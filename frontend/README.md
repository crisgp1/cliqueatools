# Simulador de Crédito Automotriz - Cliquéalo.mx

Aplicación web para simular créditos automotrices con diferentes bancos de México, permitiendo a los usuarios comparar opciones, ver tablas de amortización y exportar a PDF.

## Características

- Gestión de múltiples vehículos en un solo financiamiento
- Captura de datos del cliente
- Configuración personalizada de crédito (enganche, plazo, etc.)
- Comparativa de opciones de diferentes bancos
- Generación de tablas de amortización detalladas
- Exportación a PDF
- Interfaz responsive para móviles y escritorio
- Base de datos PostgreSQL para persistencia

## Estructura del Proyecto

```
/
├── src/                      # Código fuente React
│   ├── components/           # Componentes React
│   │   ├── Modal.jsx         # Componente de modal reutilizable
│   │   ├── VehicleForm.jsx   # Formulario de vehículos
│   │   ├── ClientForm.jsx    # Formulario de datos del cliente
│   │   ├── CreditForm.jsx    # Configuración de crédito
│   │   ├── BankComparison.jsx# Comparativa de bancos
│   │   └── AmortizationTable.jsx # Tabla de amortización
│   ├── App.jsx               # Componente principal
│   └── ...                   # Otros archivos React
├── database/                 # Archivos de base de datos
│   ├── schema.sql            # Esquema de la base de datos
│   └── config.js             # Configuración de conexión
└── ...                       # Otros archivos de configuración
```

## Requisitos Previos

- Node.js (v14+)
- npm o yarn
- PostgreSQL (v12+)

## Configuración de PostgreSQL

### 1. Instalación de PostgreSQL

#### En Windows
- Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Ejecuta el instalador y sigue las instrucciones
- Recuerda la contraseña que asignas al usuario postgres

#### En macOS
```bash
brew install postgresql
brew services start postgresql
```

#### En Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Creación de la Base de Datos

Conéctate a PostgreSQL:

```bash
# En Windows, usa pgAdmin o:
psql -U postgres

# En macOS:
psql postgres

# En Linux:
sudo -u postgres psql
```

Crea la base de datos:

```sql
CREATE DATABASE simulador_credito;
```

### 3. Ejecutar el Esquema de Base de Datos

Hay dos formas de ejecutar el script `schema.sql`:

#### Usando psql:
```bash
# Reemplaza la ruta según sea necesario
psql -U postgres -d simulador_credito -f /ruta/a/database/schema.sql
```

#### Usando pgAdmin:
1. Abre pgAdmin
2. Conéctate al servidor
3. Selecciona la base de datos `simulador_credito`
4. Abre la herramienta de consulta SQL
5. Carga y ejecuta el archivo `schema.sql`

## Instalación de la Aplicación

### 1. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Adicionalmente, instalar el cliente de PostgreSQL
npm install pg
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con lo siguiente:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=simulador_credito
DB_PASSWORD=tu_contraseña
DB_PORT=5432
```

Reemplaza `tu_contraseña` con la contraseña que configuraste para PostgreSQL.

### 3. Configurar el Backend

Si quieres inicializar la base de datos con el script proporcionado, crea un archivo `init-db.js` en la raíz:

```javascript
const { initializeDatabase, testConnection } = require('./database/config');

// Probar conexión e inicializar base de datos
async function init() {
  const connected = await testConnection();
  if (connected) {
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');
    process.exit(0);
  } else {
    console.error('No se pudo conectar a la base de datos');
    process.exit(1);
  }
}

init();
```

Luego ejecútalo:

```bash
node init-db.js
```

## Integrar la Base de Datos con React

### 1. Crear un Servidor Express

Para integrar la base de datos con React, necesitarás un servidor Express. Crea un archivo `server.js` en la raíz:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Endpoints de API

// Obtener bancos
app.get('/api/bancos', async (req, res) => {
  try {
    const bancos = await db.getBancos();
    res.json(bancos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await db.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear vehículo
app.post('/api/vehiculos', async (req, res) => {
  try {
    const vehiculo = await db.createVehiculo(req.body);
    res.status(201).json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear crédito
app.post('/api/creditos', async (req, res) => {
  try {
    const credito = await db.createCredito(req.body);
    res.status(201).json(credito);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener tabla de amortización
app.get('/api/creditos/:id/amortizacion', async (req, res) => {
  try {
    const tabla = await db.getTablaAmortizacion(req.params.id);
    res.json(tabla);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

Instala las dependencias necesarias:

```bash
npm install express body-parser cors
```

### 2. Modificar la Aplicación React para Conectarse a la API

Puedes usar `fetch` o `axios` para conectar la aplicación React con la API:

```bash
npm install axios
```

Ejemplo de uso en un componente:

```javascript
import axios from 'axios';

// Establecer URL base
axios.defaults.baseURL = 'http://localhost:3001/api';

// Ejemplo: Obtener bancos
const fetchBancos = async () => {
  try {
    const response = await axios.get('/bancos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener bancos:", error);
    return [];
  }
};

// Ejemplo: Crear un cliente
const createCliente = async (clienteData) => {
  try {
    const response = await axios.post('/clientes', clienteData);
    return response.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};
```

## Ejecutar la Aplicación

### 1. Iniciar el Servidor Express

```bash
node server.js
```

### 2. Iniciar la Aplicación React

```bash
npm run dev
```

Ahora puedes acceder a la aplicación en tu navegador en `http://localhost:5173` (o el puerto que Vite asigne).

## Despliegue en Producción

Para un entorno de producción, considera:

1. Usar variables de entorno seguras para credenciales de la base de datos
2. Configurar HTTPS
3. Implementar autenticación de usuarios
4. Optimizar las consultas de base de datos
5. Implementar caché para mejorar el rendimiento
6. Usar un servicio como Heroku, Vercel o AWS para el hosting

## Soporte

Para preguntas o soporte:
- Contacta con Cliquéalo.mx
- Crea un issue en el repositorio
- Consulta la documentación detallada