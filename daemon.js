/**
 * LexFlow Colombia - Supervisor Daemon Permanente
 * Mantiene el servidor Node.js ejecutándose de manera continua e ininterrumpida.
 * Si el proceso se detiene o falla por cualquier motivo, lo reinicia automáticamente en 1.5s.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const SERVER_DIR = path.join(__dirname, 'server');
const LOGS_DIR = path.join(SERVER_DIR, 'logs');
const DAEMON_PID_FILE = path.join(SERVER_DIR, 'daemon.pid');
const SERVER_PID_FILE = path.join(SERVER_DIR, 'server.pid');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const outLogPath = path.join(LOGS_DIR, 'lexflow.log');
const errLogPath = path.join(LOGS_DIR, 'lexflow-error.log');

function logMessage(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(outLogPath, line, 'utf8');
  } catch {}
  console.log(msg);
}

// Verificar si el puerto 3001 ya está respondiendo
function checkAlreadyListening(callback) {
  const req = http.get({
    host: '127.0.0.1',
    port: 3001,
    path: '/api/health',
    timeout: 1000
  }, (res) => {
    callback(res.statusCode === 200);
  });
  req.on('error', () => callback(false));
  req.on('timeout', () => {
    req.destroy();
    callback(false);
  });
}

checkAlreadyListening((alreadyRunning) => {
  if (alreadyRunning) {
    logMessage(`[LexFlow Daemon] El servidor ya se encuentra activo y respondiendo en el puerto 3001.`);
    process.exit(0);
  }

  // Guardar PID actual del daemon
  fs.writeFileSync(DAEMON_PID_FILE, String(process.pid), 'utf8');
  logMessage(`🚀 [LexFlow Daemon] Supervisor iniciado con PID: ${process.pid}`);

  let child = null;
  let isShuttingDown = false;
  let restartCount = 0;

  function startServer() {
    if (isShuttingDown) return;

    const outStream = fs.createWriteStream(outLogPath, { flags: 'a' });
    const errStream = fs.createWriteStream(errLogPath, { flags: 'a' });

    logMessage(`[LexFlow Daemon] Iniciando servidor Node en: ${SERVER_DIR}...`);

    child = spawn(process.execPath, ['dist/index.js'], {
      cwd: SERVER_DIR,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (child.pid) {
      fs.writeFileSync(SERVER_PID_FILE, String(child.pid), 'utf8');
      logMessage(`[LexFlow Daemon] Servidor iniciado con PID: ${child.pid}`);
    }

    child.stdout.pipe(outStream);
    child.stderr.pipe(errStream);

    child.on('error', (err) => {
      logMessage(`❌ [LexFlow Daemon] Error en el proceso servidor: ${err.message}`);
    });

    child.on('exit', (code, signal) => {
      if (fs.existsSync(SERVER_PID_FILE)) {
        try { fs.unlinkSync(SERVER_PID_FILE); } catch {}
      }

      if (isShuttingDown) {
        logMessage(`[LexFlow Daemon] Servidor finalizado normalmente.`);
        return;
      }

      restartCount++;
      logMessage(`⚠️ [LexFlow Daemon] Servidor detenido (código: ${code}, señal: ${signal}). Reiniciando automáticamente (Intento #${restartCount}) en 1.5s...`);
      
      setTimeout(() => {
        startServer();
      }, 1500);
    });
  }

  function cleanShutdown() {
    isShuttingDown = true;
    logMessage(`[LexFlow Daemon] Recibida señal de apagado. Limpiando procesos...`);
    if (child && child.pid) {
      try { process.kill(child.pid); } catch {}
    }
    if (fs.existsSync(DAEMON_PID_FILE)) {
      try { fs.unlinkSync(DAEMON_PID_FILE); } catch {}
    }
    process.exit(0);
  }

  process.on('SIGINT', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);
  process.on('exit', () => {
    if (fs.existsSync(DAEMON_PID_FILE)) {
      try { fs.unlinkSync(DAEMON_PID_FILE); } catch {}
    }
  });

  process.on('uncaughtException', (err) => {
    logMessage(`💥 [LexFlow Daemon] Excepción no controlada en el supervisor: ${err.message}\n${err.stack}`);
  });

  process.on('unhandledRejection', (reason) => {
    logMessage(`💥 [LexFlow Daemon] Promesa rechazada en el supervisor: ${reason}`);
  });

  startServer();
});
