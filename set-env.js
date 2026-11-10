const fs = require('fs');
const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  production: ${process.env.PRODUCTION || true},
  apiBaseUrl: '${process.env.API_BASE_URL || ''}',
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}'
  }
};\n`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`Environment variables written to ${targetPath}`);