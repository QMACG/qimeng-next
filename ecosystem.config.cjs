const path = require('path')

const instances = Number(process.env.PM2_INSTANCES || 2)
const port = Number(process.env.PORT || 3000)
const hostname = process.env.HOSTNAME || '127.0.0.1'

module.exports = {
  apps: [
    {
      name: 'qimeng-next',
      cwd: path.join(__dirname),
      script: './.next/standalone/server.js',
      exec_mode: 'cluster',
      instances: Number.isNaN(instances) || instances <= 0 ? 2 : instances,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: hostname,
        PORT: port
      }
    }
  ]
}
