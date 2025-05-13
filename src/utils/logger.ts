// src/logger.ts
import path from 'path';
import { createLogger, format, transports } from 'winston';

// Avoid circular dependency by conditionally loading app from electron
let userDataPath: string;
try {
    const electron = require('electron');
    userDataPath = electron.app.getPath('userData');
} catch (e) {
    // Fallback for non-Electron environments (e.g., unit tests)
    userDataPath = path.resolve(__dirname, '..');
}

const logPath = path.join(userDataPath, 'logs', 'app.log');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: logPath }),
        new transports.Console()
    ]
});

export default logger;
