import { TCP_RECEIVE } from "./ipc/tcp/tcp-channels";
import { requestOCRData } from "./tcp_helpers";

const { SerialPort } = require("serialport");

let serial: any = null;
let currentPortPath: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export async function openSerialPort(port: string, event: any): Promise<string> {
    return new Promise((resolve, reject) => {
        currentPortPath = port;
        serial = new SerialPort({ path: port, baudRate: 9600 });

        serial.on("error", (err: Error) => {
            console.error("Error: ", err.message);
            reject(`Connection error: ${err.message}`);
        });

        serial.on("open", () => {
            console.log(`Connected to serial port: ${port}`);
            attachSerialListeners(event);
            startHeartbeat();
            pollDCON(event);
            resolve('Connected successfully');
        });
    });
}

function pollDCON(event: any) {
    if (!serial || !serial.isOpen) return;

    serial.write('@01\r\n', (err: any) => {
        if (err) {
            console.error('Error writing @01:', err.message);
            return;
        }

        serial.once('data', (data: any) => {
            const response = data.toString('ascii');
            if (response.includes('1')) {
                requestOCRData(event);
            }
            pollDCON(event); // Recursive polling
        });
    });
}

function sendDconCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!serial || !serial.isOpen) {
            return reject(new Error("Serial port is not open."));
        }

        serial.write(command, 'ascii', (err: any) => {
            if (err) return reject(err);

            serial.once('data', (data: Buffer) => {
                resolve(data.toString('ascii'));
            });
        });
    });
}

export function sendSerialData(cmd: string) {
    console.log("Sending:", cmd);

    if (!serial || !serial.isOpen) {
        console.error("Serial port is not open.");
        return;
    }

    sendDconCommand(cmd)
        .then((response) => {
            if (cmd !== '@0100\r') {
                setTimeout(() => {
                    sendSerialData('@0100\r');
                }, 1500);
            }
            console.log('Response:', response);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

export async function closeSerialPort() {
    return new Promise((resolve, reject) => {
        if (serial) {
            stopHeartbeat();
            serial.close((err: any) => {
                if (err) {
                    reject(`Error closing serial port: ${err.message}`);
                } else {
                    console.log("Serial port closed");
                    serial = null;
                    resolve('Disconnected successfully');
                }
            });
        } else {
            reject("No active serial port to close");
        }
    });
}

export async function listSerialPorts() {
    return SerialPort.list();
}

function startHeartbeat() {
    if (heartbeatInterval) return;

    heartbeatInterval = setInterval(() => {
        if (serial && serial.isOpen) {
            sendDconCommand('@0100\r')
                .then(response => {
                    console.log('Heartbeat:', response.trim());
                })
                .catch(err => {
                    console.error('Heartbeat error:', err.message);
                    attemptReconnect();
                });
        }
    }, 5000);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function attachSerialListeners(event: any) {
    if (!serial) return;

    serial.on('close', () => {
        console.warn('Serial port closed unexpectedly.');
        stopHeartbeat();
        attemptReconnect(event);
    });

    serial.on('error', (err: any) => {
        console.error('Serial port error:', err.message);
        stopHeartbeat();
        attemptReconnect(event);
    });
}

function attemptReconnect(event: any) {
    if (!currentPortPath) {
        console.warn("No port path saved; cannot reconnect.");
        return;
    }

    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(async () => {
        try {
            await openSerialPort(currentPortPath, event);
            console.log('Reconnected to serial port.');
        } catch (err) {
            console.error('Reconnect failed:', err);
            attemptReconnect(event); // Keep retrying
        }
    }, 5000);
}
