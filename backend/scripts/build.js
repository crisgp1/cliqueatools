#!/usr/bin/env node

/**
 * Script para preparar el backend para producción en Digital Ocean
 * 
 * Este script realiza las siguientes tareas:
 * 1. Verifica que todas las variables de entorno necesarias estén definidas
 * 2. Verifica la conexión a la base de datos
 * 3. Genera un archivo .env.production si no existe
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { testConnection } = require('../config/configDB');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}=============================================`);
console.log(`     PREPARANDO BACKEND PARA PRODUCCIÓN      `);
console.log(`==============================================${colors.reset}`);

// 1. Verificar variables de entorno requeridas
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_SCHEMA',
  'DB_SSL',
  'JWT_SECRET'
];

console.log(`\n${colors.cyan}Verificando variables de entorno...${colors.reset}`);
const missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
    console.log(`${colors.red}✖ Falta la variable ${envVar}${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ ${envVar} está definida${colors.reset}`);
  }
}

if (missingVars.length > 0) {
  console.log(`\n${colors.red}${colors.bright}Error: Faltan variables de entorno requeridas`);
  console.log(`Por favor, defina las siguientes variables en el archivo .env:${colors.reset}`);
  missingVars.forEach(variable => console.log(`- ${variable}`));
  process.exit(1);
}

// 2. Verificar conexión a la base de datos
console.log(`\n${colors.cyan}Verificando conexión a la base de datos...${colors.reset}`);

(async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error(`${colors.red}${colors.bright}Error al conectar con la base de datos. Verifique sus credenciales.${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✓ Conexión a la base de datos establecida correctamente${colors.reset}`);
    
    // 3. Generar archivo .env.production si no existe
    const envProductionPath = path.resolve(__dirname, '../.env.production');
    
    if (!fs.existsSync(envProductionPath)) {
      console.log(`\n${colors.cyan}Generando archivo .env.production...${colors.reset}`);
      
      // Crear una copia del archivo .env actual con configuraciones para producción
      const currentEnvContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
      
      // Reemplazar configuraciones específicas para producción
      let productionEnvContent = currentEnvContent
        .replace(/NODE_ENV=.*/, 'NODE_ENV=production')
        .replace(/SYNC_DB=.*/, 'SYNC_DB=false');
      
      fs.writeFileSync(envProductionPath, productionEnvContent);
      console.log(`${colors.green}✓ Archivo .env.production generado correctamente${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ El archivo .env.production ya existe${colors.reset}`);
    }
    
    // Mostrar instrucciones para desplegar en Digital Ocean
    console.log(`\n${colors.bright}${colors.blue}=============================================`);
    console.log(`     INSTRUCCIONES PARA DIGITAL OCEAN      `);
    console.log(`==============================================${colors.reset}`);
    
    console.log(`\n${colors.yellow}1. Crear un Droplet en Digital Ocean:${colors.reset}`);
    console.log(`   - Seleccione un plan básico (1GB / 1 CPU)`);
    console.log(`   - Elija Ubuntu 22.04 LTS`);
    console.log(`   - Configure SSH para acceso seguro`);
    
    console.log(`\n${colors.yellow}2. Instalar dependencias en el servidor:${colors.reset}`);
    console.log(`   $ sudo apt update && sudo apt upgrade -y`);
    console.log(`   $ sudo apt install -y nodejs npm postgresql postgresql-contrib nginx`);
    console.log(`   $ sudo npm install -g pm2`);
    
    console.log(`\n${colors.yellow}3. Configurar PostgreSQL:${colors.reset}`);
    console.log(`   $ sudo -u postgres psql`);
    console.log(`   postgres=# CREATE USER ${process.env.DB_USER} WITH PASSWORD '${process.env.DB_PASSWORD}';`);
    console.log(`   postgres=# CREATE DATABASE ${process.env.DB_NAME};`);
    console.log(`   postgres=# GRANT ALL PRIVILEGES ON DATABASE ${process.env.DB_NAME} TO ${process.env.DB_USER};`);
    console.log(`   postgres=# \\q`);
    
    console.log(`\n${colors.yellow}4. Clonar el repositorio en el servidor:${colors.reset}`);
    console.log(`   $ git clone <URL_REPOSITORIO> /var/www/cliqueatools`);
    console.log(`   $ cd /var/www/cliqueatools/backend`);
    
    console.log(`\n${colors.yellow}5. Configurar variables de entorno:${colors.reset}`);
    console.log(`   $ cp .env.production .env`);
    console.log(`   $ nano .env  # Actualizar variables para Digital Ocean`);
    
    console.log(`\n${colors.yellow}6. Instalar dependencias y ejecutar el script de inicialización:${colors.reset}`);
    console.log(`   $ npm install`);
    console.log(`   $ node scripts/initdb.js`);
    
    console.log(`\n${colors.yellow}7. Configurar PM2 para mantener la aplicación en ejecución:${colors.reset}`);
    console.log(`   $ pm2 start app.js --name "cliqueatools-backend"`);
    console.log(`   $ pm2 startup`);
    console.log(`   $ pm2 save`);
    
    console.log(`\n${colors.yellow}8. Configurar Nginx como proxy inverso:${colors.reset}`);
    console.log(`   $ sudo nano /etc/nginx/sites-available/cliqueatools`);
    console.log(`   # Configuración básica de Nginx:`);
    console.log(`   server {`);
    console.log(`       listen 80;`);
    console.log(`       server_name tu-dominio.com www.tu-dominio.com;`);
    console.log(`       location /api {`);
    console.log(`           proxy_pass http://localhost:${process.env.PORT};`);
    console.log(`           proxy_http_version 1.1;`);
    console.log(`           proxy_set_header Upgrade $http_upgrade;`);
    console.log(`           proxy_set_header Connection 'upgrade';`);
    console.log(`           proxy_set_header Host $host;`);
    console.log(`           proxy_cache_bypass $http_upgrade;`);
    console.log(`       }`);
    console.log(`   }`);
    
    console.log(`\n${colors.yellow}9. Activar la configuración de Nginx:${colors.reset}`);
    console.log(`   $ sudo ln -s /etc/nginx/sites-available/cliqueatools /etc/nginx/sites-enabled/`);
    console.log(`   $ sudo nginx -t`);
    console.log(`   $ sudo systemctl restart nginx`);
    
    console.log(`\n${colors.yellow}10. Configurar Certbot para HTTPS (opcional):${colors.reset}`);
    console.log(`   $ sudo apt install -y certbot python3-certbot-nginx`);
    console.log(`   $ sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com`);
    
    console.log(`\n${colors.bright}${colors.green}✅ La aplicación backend está lista para producción`);
    console.log(`Siga las instrucciones anteriores para completar el despliegue en Digital Ocean${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Error en el proceso de build:${colors.reset}`, error);
    process.exit(1);
  }
})();