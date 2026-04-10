/**
 * Docker：工作目录为 /app（standalone）。
 * PM2_INSTANCES：留空或 max = 与 CPU 同数进程；设数字则固定进程数（省内存/DB 连接）。
 */
const raw = process.env.PM2_INSTANCES
let instances = 'max'
if (raw && raw !== 'max') {
  const n = Number.parseInt(raw, 10)
  if (!Number.isNaN(n) && n > 0) {
    instances = n
  }
}

module.exports = {
  apps: [
    {
      name: 'qimeng-next',
      cwd: '/app',
      script: 'server.js',
      exec_mode: 'cluster',
      instances,
      autorestart: true,
      watch: false,
      max_memory_restart: process.env.PM2_MAX_MEMORY || '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000',
        HOSTNAME: process.env.HOSTNAME || '0.0.0.0'
      }
    }
  ]
}
