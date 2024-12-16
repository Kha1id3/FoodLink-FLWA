module.exports = {
  apps: [
    {
      name: "foodlink-backend", // Backend app name
      script: "./bin/www", // Backend entry point (adjust if needed)
      watch: true, // Watch for file changes (optional)
      env: {
        NODE_ENV: "development",
        PORT: 3001, // Backend port
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
