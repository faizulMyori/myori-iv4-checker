const { spawn } = require('child_process');
const { createServer } = require('vite');
const electron = require('electron');
const path = require('path');

/**
 * @type {import('child_process').ChildProcessWithoutNullStreams | null}
 */
let electronProcess = null;

/**
 * Start Electron process and watch for changes
 */
function startElectron() {
  if (electronProcess) {
    electronProcess.kill();
    electronProcess = null;
  }

  electronProcess = spawn(electron, ['.'], {
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
    stdio: 'inherit',
  });

  electronProcess.on('close', () => {
    process.exit();
  });
}

/**
 * Start Vite dev server and Electron
 */
async function startDevServer() {
  try {
    // Create Vite dev server
    const server = await createServer({
      configFile: path.resolve(__dirname, '../vite.config.ts'),
    });

    await server.listen();
    const { port } = server.httpServer.address();
    
    // Set environment variable for main process
    process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL = `http://localhost:${port}`;

    // Build main and preload scripts using npx to avoid path issues
    const mainProcess = spawn('npx', ['vite', 'build', '-c', 'vite.main.config.ts'], {
      stdio: 'inherit',
      shell: true
    });

    mainProcess.on('close', (code) => {
      if (code === 0) {
        const preloadProcess = spawn('npx', ['vite', 'build', '-c', 'vite.preload.config.ts'], {
          stdio: 'inherit',
          shell: true
        });

        preloadProcess.on('close', (code) => {
          if (code === 0) {
            startElectron();
          }
        });
      }
    });

    // Watch for changes in main and preload using npx
    const mainWatcher = spawn('npx', ['vite', 'build', '-c', 'vite.main.config.ts', '--watch'], {
      stdio: 'inherit',
      shell: true
    });

    const preloadWatcher = spawn('npx', ['vite', 'build', '-c', 'vite.preload.config.ts', '--watch'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle process exit
    const cleanup = () => {
      if (electronProcess) electronProcess.kill();
      if (mainWatcher) mainWatcher.kill();
      if (preloadWatcher) preloadWatcher.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error('Error starting dev server:', error);
    process.exit(1);
  }
}

startDevServer();