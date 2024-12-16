module.exports = {
  apps: [
    {
      name: "foodlink-frontend",
      script: "serve",
      args: "--single --listen 3000", // Use the React build folder and define the port
      watch: false, // No need to watch the frontend files
      env: {
        NODE_ENV: "production",
      },
    },
 ],

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
