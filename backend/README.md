# Cliquea Tools - Backend

Este repositorio contiene el backend de Cliquea Tools, una aplicación para gestión de vehículos, clientes, contratos y créditos.

## Despliegue en Digital Ocean

### Preparativos

Antes de iniciar el despliegue, asegúrate de tener:

- Una cuenta en Digital Ocean
- Acceso SSH configurado para tu computadora
- El código del repositorio disponible localmente

### 1. Configuración Local

1. Ejecuta el script de preparación para producción:

```bash
cd backend
node scripts/build.js
```

Este script verificará si el entorno está correctamente configurado para producción y generará un archivo `.env.production` si no existe.

### 2. Creación del Droplet en Digital Ocean

1. Inicia sesión en tu cuenta de Digital Ocean
2. Crea un nuevo Droplet con las siguientes especificaciones:
   - **Imagen**: Ubuntu 22.04 LTS
   - **Plan**: Básico (Compartido CPU)
   - **CPU/RAM**: 1 GB RAM / 1 CPU (mínimo recomendado)
   - **Almacenamiento**: SSD 25 GB
   - **Datacenter**: Selecciona la región más cercana a tus usuarios
   - **Autenticación**: SSH Keys (recomendado)
   - **Hostname**: cliqueatools

3. Una vez creado el Droplet, anota la dirección IP asignada.
209.38.133.53

### 3. Configuración Inicial del Servidor

Conéctate a tu Droplet vía SSH:

```bash
ssh root@209.38.133.53
```

Actualiza el sistema e instala las dependencias necesarias:

```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js, npm y otras dependencias
apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar las instalaciones
node -v
npm -v

# Instalar PM2 globalmente
npm install -g pm2

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib
```

### 4. Configurar PostgreSQL

```bash
# Iniciar sesión como usuario postgres
sudo -u postgres psql

# Crear usuario para la aplicación
CREATE USER admin WITH PASSWORD 'AVNS_iIg_KmMbBPA0-nrishv';

# Crear base de datos
CREATE DATABASE cliqueatools;

# Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE cliqueatools TO doadmin;

# Salir de psql
\q
```

### 5. Clonar el Repositorio

```bash
# Crear directorio para la aplicación
mkdir -p /var/www
cd /var/www

# Clonar el repositorio (ajusta la URL según tu caso)
git clone https://github.com/crisgp1/cliqueatools.git
cd cliqueatools/backend
```

### 6. Configurar el Backend

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración para producción
cp .env.production .env

# Editar configuración si es necesario
nano .env
```

Asegúrate de actualizar las siguientes variables con valores específicos para tu entorno:

- `DB_HOST`: localhost (o la dirección del servidor de base de datos)
- `DB_USER`: admin (o el usuario que creaste)
- `DB_PASSWORD`: TuContraseñaSegura
- `FRONTEND_URL`: https://tu-dominio.com (cuando tengas un dominio configurado)
- `JWT_SECRET`: Genera un secreto seguro y único

### 7. Inicializar la Base de Datos

```bash
# Ejecutar script de inicialización
node scripts/initdb.js
```

### 8. Configurar PM2 para la Gestión de Procesos

```bash
# Iniciar la aplicación con PM2
pm2 start app.js --name "cliqueatools-backend"

# Configurar PM2 para iniciar con el sistema
pm2 startup
pm2 save
```

### 9. Instalar y Configurar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Crear archivo de configuración
nano /etc/nginx/sites-available/cliqueatools
```

Copia el contenido del archivo de plantilla `backend/config/nginx.conf.template` al archivo de configuración de Nginx, reemplazando `tu-dominio.com` con tu dominio real (o usa la IP del servidor temporalmente).

```bash
# Crear enlace simbólico para habilitar el sitio
ln -s /etc/nginx/sites-available/cliqueatools /etc/nginx/sites-enabled/

# Verificar la configuración de Nginx
nginx -t

# Si la verificación es exitosa, reiniciar Nginx
systemctl restart nginx

# Permitir tráfico HTTP y HTTPS en el firewall
ufw allow 'Nginx Full'
```

### 10. Configurar SSL con Let's Encrypt (opcional pero recomendado)

Si tienes un dominio configurado para apuntar a tu servidor, puedes configurar SSL gratuito con Let's Encrypt:

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado y configurar Nginx automáticamente
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Comprobar la renovación automática
certbot renew --dry-run
```

Certbot actualiza automáticamente la configuración de Nginx para usar HTTPS.

### 11. Desplegar el Frontend (necesario para una instalación completa)

El frontend debe ser construido y desplegado en la ubicación configurada en Nginx:

```bash
# Navegar al directorio del frontend
cd /var/www/cliqueatools/frontend

# Instalar dependencias
npm install

# Construir la aplicación para producción
npm run build

# El resultado estará en el directorio 'dist'
# Asegúrate de que Nginx esté configurado para servir desde este directorio
```

### 12. Monitoreo y Mantenimiento

#### Comandos útiles de PM2:

```bash
# Ver todos los procesos
pm2 list

# Ver logs del backend
pm2 logs cliqueatools-backend

# Reiniciar el backend
pm2 restart cliqueatools-backend

# Detener el backend
pm2 stop cliqueatools-backend

# Iniciar el backend
pm2 start cliqueatools-backend
```

#### Mantenimiento de la Base de Datos:

```bash
# Crear respaldo de la base de datos
pg_dump -U admin cliqueatools > backup_$(date +%Y%m%d).sql

# Restaurar desde respaldo
psql -U admin -d cliqueatools < backup_file.sql
```

### 13. Seguridad Adicional

Para mejorar la seguridad de tu servidor:

```bash
# Configurar firewall básico
ufw enable
ufw allow ssh
ufw allow 'Nginx Full'

# Instalar y configurar fail2ban para proteger de ataques de fuerza bruta
apt install -y fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local  # Ajustar configuración según necesidades
systemctl restart fail2ban
```

### Solución de Problemas Comunes

1. **El backend no arranca**:
   - Verifica logs: `pm2 logs cliqueatools-backend`
   - Comprueba las variables de entorno: `cat .env`
   - Prueba la conexión a la base de datos: `node -e "const {testConnection} = require('./config/configDB.js'); testConnection().then(console.log);"`

2. **Problemas con Nginx**:
   - Verifica la sintaxis de la configuración: `nginx -t`
   - Revisa los logs: `cat /var/log/nginx/error.log`
   - Comprueba si Nginx está ejecutándose: `systemctl status nginx`

3. **Problemas de certificado SSL**:
   - Verifica los logs de Certbot: `journalctl -xeu certbot.service`
   - Intenta renovación manual: `certbot renew`

4. **Errores de base de datos**:
   - Revisa los logs de PostgreSQL: `cat /var/log/postgresql/postgresql-*.log`
   - Verifica permisos del usuario: `sudo -u postgres psql -c "SELECT rolname, rolsuper, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname='admin';"`

## Recursos Adicionales

- [Documentación Digital Ocean](https://www.digitalocean.com/docs)
- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)