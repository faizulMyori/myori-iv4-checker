import { TCP_RECEIVE } from "./ipc/tcp/tcp-channels";
import { requestOCRData } from "./tcp_helpers";

const { SerialPort } = require("serialport");

let serial: any = null;

// export async function openSerialPort(port: string, event: any): Promise<string> {
//     return new Promise((resolve, reject) => {
//         serial = new SerialPort({ path: port, baudRate: 9600 }, (err: any) => {
//             if (err) {
//                 console.log(err)
//                 reject(`Connection error: ${err.message}`);
//                 return;
//             }
//             console.log(serial)
//             serial?.on("data", (data: any) => {
//                 console.log(data)
//                 requestOCRData('')
//                 // event.sender.send(TCP_RECEIVE, data.toString('ascii'));
//             })
//             console.log("Connected to serial port");
//             resolve('Connected successfully');
//         });

//         serial.on("error", (error: any) => {
//             reject(`Connection error: ${error.message}`);
//         });
//     });
// }

export async function openSerialPort(port: string, event: any): Promise<string> {
    return new Promise((resolve, reject) => {
        // Open the serial port with a specific baud rate
        serial = new SerialPort({ path: port, baudRate: 9600 });

        // Handle error if there's an issue with opening the port
        serial.on("error", (err: Error) => {
            console.error("Error: ", err.message);
            reject(`Connection error: ${err.message}`);
        });

        // Once the port is open, handle incoming data
        serial.on("open", () => {
            console.log(`Connected to serial port: ${port}`);

            pollDCON(event);

            resolve('Connected successfully');
        });
    });
}

function pollDCON(event: any) {
    serial?.write('@01\r\n', (err: any) => {
        console.log('running')

        if (err) {
            console.error('Error writing @01:', err.message);
            return;
        }

        serial.once('data', (data: any) => {
            if (data.toString('ascii').includes('1')) requestOCRData(event);

            // Immediately poll again
            pollDCON(event);
        });
    });
}

export async function closeSerialPort() {
    return new Promise((resolve, reject) => {
        if (serial) {
            serial.close((err: any) => {
                if (err) {
                    reject(`Error closing serial port: ${err.message}`);
                } else {
                    console.log("Serial port closed");
                    resolve('Disconnected successfully');
                }
            });
        } else {
            reject("No active serial port to close");
        }
    });
}

export async function listSerialPorts() {
    return new Promise((resolve, reject) => {
        SerialPort.list().then(
            (ports: any[]) => resolve(ports),
            (err: any) => reject(err)
        );
    });
}

export function sendSerialData(cmd: string) {
    //0 = RESET
    //1 = DO0
    //2 = DO1
    //3 = DO0 & DO1
    //4 = DO2
    //5 = DO0 & DO2
    //6 = DO1 & DO2
    //7 = DO0 & DO1 & DO2
    //8 = DO3
    //9 = DO0 & DO3
    //10 = DO4
    // console.log(cmd)
    sendDconCommand(cmd)
        .then((response) => {
            if (cmd !== '@0100\r') {
                setTimeout(() => {
                    sendSerialData('@0100\r')
                }, 1500)
            }

            // console.log('Response:', response);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

function sendDconCommand(command: string) {
    return new Promise((resolve, reject) => {
        // write to dcon rs485

        serial.write(command, 'ascii', (err: any) => {
            if (err) {
                return reject(err);
            }
            serial.on('data', (data: any) => {
                resolve(data.toString('ascii')); // Convert response buffer to ASCII string
            });
        });
    });
}