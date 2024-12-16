module.exports = {
  apps: [
    {
      name: "foodlink-frontend",
      script: "serve",
      args: "--single --listen 217.173.202.80 --port 3000", // Ensure it binds to localhost
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "foodlink-backend",
      script: "npm",
      args: "start",
      cwd: "./backend", // Adjust to backend path relative to this file
      env: {
        NODE_ENV: "production",
        PORT: 3001, // Ensure backend uses this port
      },
    },
  ],
};
