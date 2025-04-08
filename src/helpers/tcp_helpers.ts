import net from 'net';
import {
    TCP_CLOSED,
    TCP_CONNECTED,
    TCP_ERROR,
    TCP_RECEIVE
} from "../helpers/ipc/tcp/tcp-channels";
import { ipcMain } from 'electron';
import { WIN_DIALOG_INFO } from './ipc/window/window-channels';

let client: net.Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

export async function connectTcp(ip: string, port: number, event: any) {
    console.log(`Attempting to connect to ${ip}:${port}`);

    return new Promise((resolve, reject) => {
        if (!ip || !port) {
            reject('Invalid IP or Port');
            return;
        }

        if (client && !client.destroyed) {
            resolve('Connection already exists');
            return;
        }

        client = new net.Socket();

        const connectionTimeout = setTimeout(() => {
            if (client) client.destroy();
            reject('Connection timeout');
        }, 10000);

        client.connect(port, ip, () => {
            clearTimeout(connectionTimeout);
            console.log('Connected successfully');
            resolve('Connected successfully');
            reconnectAttempts = 0; // Reset reconnect attempts on success
            event.sender.send(TCP_CONNECTED);
            client?.removeAllListeners(); // Remove all previous listeners
            setOCRDetailedOutput(event);
            // Listen for incoming data
            client?.on('data', (data: Buffer) => {
                try {
                    const dataString = data.toString().trim();
                    console.log(dataString)

                    if (dataString.split(',').find((d: any) => d === 'OK')) {
                        let status = dataString.split(',')[7]
                        let url = dataString.split(',')[8]
                        let serial = dataString.split(',')[9]
                        let tcp_data = `${serial},${url},${status}`
                        console.log(tcp_data)
                        event.sender.send(TCP_RECEIVE, tcp_data);
                    } else {
                        event.sender.send(TCP_RECEIVE, `,,NG`);
                    }
                } catch (parseError: any) {
                    event.sender.send(TCP_ERROR, parseError.message);
                }
            });

            // Handle connection close (Trigger reconnection)
            client?.on('close', () => {
                console.log('TCP connection closed');
                event.sender.send(TCP_CLOSED);
                client = null; // Reset client for reconnection
                attemptReconnect(ip, port, event);
                ipcMain.emit(WIN_DIALOG_INFO, {
                    title: "Error",
                    message: `Connection Closed! Reconnecting....`,
                });
            });

            // Handle errors (Trigger reconnection)
            client?.on('error', (err: Error) => {
                console.error(`TCP Connection Error: ${err.message}`);
                event.sender.send(TCP_ERROR, err.message);
                client = null; // Reset client for reconnection
                attemptReconnect(ip, port, event);
            });
        });

        client.on('error', (err: Error) => {
            clearTimeout(connectionTimeout);
            console.error(`TCP Connection Error: ${err.message}`);
            event.sender.send(TCP_ERROR, err.message);
            client = null; // Reset client for reconnection
            attemptReconnect(ip, port, event);
        });
    });
}

// Send commands to IV4
export function sendIV4Command(command: string, event: any) {
    return new Promise((resolve, reject) => {
        if (!client || client.destroyed) {
            reject('No active TCP connection');
            return;
        }

        console.log(`Sending command to IV4: ${command}`);
        client.write(command + '\r\n', 'utf-8', (err) => {
            if (err) {
                reject(`Error sending command: ${err.message}`);
            } else {
                resolve('Command sent successfully');
            }
        });
    });
}

// Request OCR detailed output (OF,01)
export async function setOCRDetailedOutput(event: any) {
    try {
        const response = await sendIV4Command("OF,01", event);
        return console.log(`Detailed OCR Output Set: ${response}`);
    } catch (error) {
        return console.error(error);
    }
}

// Request OCR data (RT)
export async function requestOCRData(event: any) {
    try {
        const response: any = await sendIV4Command("RT", event);

        return console.log(`OCR Data Requested: ${response}`);
    } catch (error) {
        return console.error(error);
    }
}

// Attempt to reconnect with a delay
function attemptReconnect(ip: string, port: number, event: any) {
    console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);

    setTimeout(() => {
        connectTcp(ip, port, event)
            .then(() => console.log('Reconnected successfully'))
            .catch((err) => console.error(`Reconnect failed: ${err}`));
    }, RECONNECT_DELAY);
}

export function closeTcpConnection() {
    return new Promise((resolve, reject) => {
        if (client && !client.destroyed) {
            client.end(() => {
                client?.destroy();
                client = null;
                resolve('Connection closed successfully');
            });
        } else {
            reject('No active connection to close');
        }
    });
}
