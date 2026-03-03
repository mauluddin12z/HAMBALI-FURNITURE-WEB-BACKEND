module.exports = {
  apps: [
    {
      name: "hambali-furniture-backend",
      script: "index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5002
      }
    }
  ]
}

