#!/bin/bash

# =========================================================
# Cliquéalo.mx Backend Structure Generator
# =========================================================
# This script creates a microservices backend structure
# following hexagonal architecture and Domain-Driven Design
# principles for an automotive credit simulator.
# =========================================================

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Define the base directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="${SCRIPT_DIR}"
CLIQUEATOOLS_DIR="${PARENT_DIR}/cliqueatools"
BACKEND_DIR="${CLIQUEATOOLS_DIR}/backend"

# Print banner
echo -e "${GREEN}"
echo "================================================================="
echo "         Cliquéalo.mx Backend Project Structure Generator        "
echo "================================================================="
echo -e "${NC}"

# Check if the backend directory already exists
if [ -d "${BACKEND_DIR}" ]; then
  echo -e "${RED}Warning: Directory ${BACKEND_DIR} already exists.${NC}"
  read -p "Do you want to overwrite it? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 1
  fi
  
  # Remove the existing directory
  rm -rf "${BACKEND_DIR}"
  echo -e "${GREEN}Existing directory removed.${NC}"
fi

# Create base directory
echo -e "${YELLOW}Creating base directory...${NC}"
mkdir -p "${BACKEND_DIR}"

# Define microservices based on DB schema
MICROSERVICES=(
  "auth-service"
  "client-service"
  "vehicle-service"
  "bank-service"
  "credit-service"
  "amortization-service"
  "api-gateway"
  "shared"
)

# Function to create empty file with a comment header
create_file() {
  local file_path=$1
  local comment=$2
  mkdir -p "$(dirname "$file_path")"
  echo "// $comment" > "$file_path"
  echo "" >> "$file_path"
  echo "// TODO: Implement this file" >> "$file_path"
}

# Function to create a basic package.json file
create_package_json() {
  local dir=$1
  local name=$2
  local description=$3
  
  cat > "${dir}/package.json" << EOF
{
  "name": "${name}",
  "version": "1.0.0",
  "description": "${description}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "keywords": ["cliqueatools", "microservice", "hexagonal", "ddd"],
  "author": "Cliquéalo.mx",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
EOF
}

# Function to create a basic README.md file
create_readme() {
  local dir=$1
  local title=$2
  local description=$3
  
  cat > "${dir}/README.md" << EOF
# ${title}

${description}

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (>= 16.x)
- npm (>= 8.x)

### Installing

\`\`\`bash
npm install
\`\`\`

### Running

\`\`\`bash
npm start
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Running the tests

\`\`\`bash
npm test
\`\`\`

## Architecture

This service follows hexagonal architecture combined with Domain-Driven Design principles:

- **Domain**: Core business logic, entities, value objects
- **Application**: Use cases, application services
- **Infrastructure**: External services integration, repositories implementation
- **Interface**: Controllers, API endpoints
EOF
}

# Function to create a basic Dockerfile
create_dockerfile() {
  local dir=$1
  
  cat > "${dir}/Dockerfile" << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF
}

# Function to create a basic .env.example file
create_env_example() {
  local dir=$1
  local service=$2
  
  cat > "${dir}/.env.example" << EOF
# ${service} Environment Variables

# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${service//-/_}
DB_USER=postgres
DB_PASSWORD=postgres

# Logging
LOG_LEVEL=info
EOF
}

# Define the hexagonal architecture structure for each microservice
echo -e "${YELLOW}Creating microservices structure...${NC}"
for SERVICE in "${MICROSERVICES[@]}"; do
  echo -e "  ${GREEN}Creating ${SERVICE}...${NC}"
  
  if [ "$SERVICE" != "shared" ] && [ "$SERVICE" != "api-gateway" ]; then
    # Create the microservice directory
    SERVICE_DIR="${BACKEND_DIR}/${SERVICE}"
    mkdir -p "${SERVICE_DIR}"
    
    # Create the hexagonal architecture directories
    # Domain layer
    mkdir -p "${SERVICE_DIR}/domain/entities"
    mkdir -p "${SERVICE_DIR}/domain/value-objects"
    mkdir -p "${SERVICE_DIR}/domain/services"
    mkdir -p "${SERVICE_DIR}/domain/repositories"
    mkdir -p "${SERVICE_DIR}/domain/events"
    
    # Application layer
    mkdir -p "${SERVICE_DIR}/application/use-cases"
    mkdir -p "${SERVICE_DIR}/application/dtos"
    mkdir -p "${SERVICE_DIR}/application/ports/input"
    mkdir -p "${SERVICE_DIR}/application/ports/output"
    
    # Infrastructure layer
    mkdir -p "${SERVICE_DIR}/infrastructure/adapters/persistence"
    mkdir -p "${SERVICE_DIR}/infrastructure/adapters/messaging"
    mkdir -p "${SERVICE_DIR}/infrastructure/adapters/external-services"
    mkdir -p "${SERVICE_DIR}/infrastructure/config"
    
    # Interface layer
    mkdir -p "${SERVICE_DIR}/interface/controllers"
    mkdir -p "${SERVICE_DIR}/interface/presenters"
    mkdir -p "${SERVICE_DIR}/interface/routes"
    
    # Config and entry points
    mkdir -p "${SERVICE_DIR}/config"
    create_dockerfile "${SERVICE_DIR}"
    create_env_example "${SERVICE_DIR}" "${SERVICE}"
    create_package_json "${SERVICE_DIR}" "${SERVICE}" "${SERVICE} microservice for Cliquéalo.mx automotive credit simulator"
    create_readme "${SERVICE_DIR}" "${SERVICE}" "${SERVICE} microservice for Cliquéalo.mx automotive credit simulator"
    
    # Create index.js file
    cat > "${SERVICE_DIR}/index.js" << EOF
// ${SERVICE} microservice entry point

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: '${SERVICE}', status: 'running' });
});

app.listen(PORT, () => {
  console.log(\`${SERVICE} microservice running on port \${PORT}\`);
});
EOF
    
    # Service-specific files based on database schema
    if [ "$SERVICE" == "auth-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/User.js" "User entity based on usuario table"
      create_file "${SERVICE_DIR}/domain/value-objects/Password.js" "Password value object"
      create_file "${SERVICE_DIR}/domain/repositories/UserRepository.js" "User repository interface"
      create_file "${SERVICE_DIR}/application/use-cases/AuthenticateUser.js" "Authenticate user use case"
      create_file "${SERVICE_DIR}/application/use-cases/RegisterUser.js" "Register user use case"
    fi
    
    if [ "$SERVICE" == "client-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/Client.js" "Client entity based on cliente table"
      create_file "${SERVICE_DIR}/domain/value-objects/ClientId.js" "Client ID value object"
      create_file "${SERVICE_DIR}/domain/repositories/ClientRepository.js" "Client repository interface"
      create_file "${SERVICE_DIR}/application/use-cases/CreateClient.js" "Create client use case"
      create_file "${SERVICE_DIR}/application/use-cases/UpdateClient.js" "Update client use case"
      create_file "${SERVICE_DIR}/application/use-cases/GetClientById.js" "Get client by ID use case"
    fi
    
    if [ "$SERVICE" == "vehicle-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/Vehicle.js" "Vehicle entity based on vehiculo table"
      create_file "${SERVICE_DIR}/domain/value-objects/VehicleId.js" "Vehicle ID value object"
      create_file "${SERVICE_DIR}/domain/repositories/VehicleRepository.js" "Vehicle repository interface"
      create_file "${SERVICE_DIR}/application/use-cases/CreateVehicle.js" "Create vehicle use case"
      create_file "${SERVICE_DIR}/application/use-cases/UpdateVehicle.js" "Update vehicle use case"
      create_file "${SERVICE_DIR}/application/use-cases/GetVehicleById.js" "Get vehicle by ID use case"
    fi
    
    if [ "$SERVICE" == "bank-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/Bank.js" "Bank entity based on banco table"
      create_file "${SERVICE_DIR}/domain/value-objects/InterestRate.js" "Interest rate value object"
      create_file "${SERVICE_DIR}/domain/repositories/BankRepository.js" "Bank repository interface"
      create_file "${SERVICE_DIR}/application/use-cases/CreateBank.js" "Create bank use case"
      create_file "${SERVICE_DIR}/application/use-cases/UpdateBank.js" "Update bank use case"
      create_file "${SERVICE_DIR}/application/use-cases/GetAllBanks.js" "Get all banks use case"
    fi
    
    if [ "$SERVICE" == "credit-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/Credit.js" "Credit entity based on credito table"
      create_file "${SERVICE_DIR}/domain/entities/CreditVehicle.js" "Credit-Vehicle relationship entity"
      create_file "${SERVICE_DIR}/domain/value-objects/Money.js" "Money value object"
      create_file "${SERVICE_DIR}/domain/repositories/CreditRepository.js" "Credit repository interface"
      create_file "${SERVICE_DIR}/application/use-cases/CreateCredit.js" "Create credit use case"
      create_file "${SERVICE_DIR}/application/use-cases/UpdateCreditStatus.js" "Update credit status use case"
      create_file "${SERVICE_DIR}/application/use-cases/GetCreditById.js" "Get credit by ID use case"
    fi
    
    if [ "$SERVICE" == "amortization-service" ]; then
      create_file "${SERVICE_DIR}/domain/entities/AmortizationSchedule.js" "Amortization schedule entity"
      create_file "${SERVICE_DIR}/domain/entities/AmortizationDetail.js" "Amortization detail entity based on amortizacion_detalle table"
      create_file "${SERVICE_DIR}/domain/services/AmortizationCalculator.js" "Amortization calculator domain service"
      create_file "${SERVICE_DIR}/domain/services/PaymentCalculator.js" "Payment calculator domain service"
      create_file "${SERVICE_DIR}/application/use-cases/GenerateAmortizationSchedule.js" "Generate amortization schedule use case"
      create_file "${SERVICE_DIR}/application/use-cases/CalculateMonthlyPayment.js" "Calculate monthly payment use case"
    fi
    
  elif [ "$SERVICE" == "api-gateway" ]; then
    # Create API Gateway structure
    API_GATEWAY_DIR="${BACKEND_DIR}/api-gateway"
    mkdir -p "${API_GATEWAY_DIR}/routes"
    mkdir -p "${API_GATEWAY_DIR}/middleware"
    mkdir -p "${API_GATEWAY_DIR}/config"
    mkdir -p "${API_GATEWAY_DIR}/services"
    
    # Create API Gateway specific files
    create_file "${API_GATEWAY_DIR}/routes/authRoutes.js" "Authentication routes"
    create_file "${API_GATEWAY_DIR}/routes/clientRoutes.js" "Client routes"
    create_file "${API_GATEWAY_DIR}/routes/vehicleRoutes.js" "Vehicle routes"
    create_file "${API_GATEWAY_DIR}/routes/bankRoutes.js" "Bank routes"
    create_file "${API_GATEWAY_DIR}/routes/creditRoutes.js" "Credit routes"
    create_file "${API_GATEWAY_DIR}/routes/amortizationRoutes.js" "Amortization routes"
    
    create_file "${API_GATEWAY_DIR}/middleware/authMiddleware.js" "Authentication middleware"
    create_file "${API_GATEWAY_DIR}/middleware/errorMiddleware.js" "Error handling middleware"
    
    create_file "${API_GATEWAY_DIR}/services/authService.js" "Auth service client"
    create_file "${API_GATEWAY_DIR}/services/clientService.js" "Client service client"
    create_file "${API_GATEWAY_DIR}/services/vehicleService.js" "Vehicle service client"
    create_file "${API_GATEWAY_DIR}/services/bankService.js" "Bank service client"
    create_file "${API_GATEWAY_DIR}/services/creditService.js" "Credit service client"
    create_file "${API_GATEWAY_DIR}/services/amortizationService.js" "Amortization service client"
    
    create_dockerfile "${API_GATEWAY_DIR}"
    create_env_example "${API_GATEWAY_DIR}" "api-gateway"
    create_package_json "${API_GATEWAY_DIR}" "api-gateway" "API Gateway for Cliquéalo.mx automotive credit simulator microservices"
    create_readme "${API_GATEWAY_DIR}" "API Gateway" "API Gateway for Cliquéalo.mx automotive credit simulator microservices"
    
    # Create index.js file
    cat > "${API_GATEWAY_DIR}/index.js" << EOF
// API Gateway entry point

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// TODO: Import and use routes
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'API Gateway', status: 'running' });
});

app.listen(PORT, () => {
  console.log(\`API Gateway running on port \${PORT}\`);
});
EOF
    
  elif [ "$SERVICE" == "shared" ]; then
    # Create shared modules
    SHARED_DIR="${BACKEND_DIR}/shared"
    mkdir -p "${SHARED_DIR}/utils"
    mkdir -p "${SHARED_DIR}/models"
    mkdir -p "${SHARED_DIR}/middlewares"
    mkdir -p "${SHARED_DIR}/constants"
    mkdir -p "${SHARED_DIR}/db"
    
    # Create shared specific files
    create_file "${SHARED_DIR}/utils/logger.js" "Logging utility"
    create_file "${SHARED_DIR}/utils/errorHandler.js" "Error handling utility"
    create_file "${SHARED_DIR}/utils/validator.js" "Data validation utility"
    create_file "${SHARED_DIR}/constants/errorCodes.js" "Error codes constants"
    create_file "${SHARED_DIR}/constants/statusCodes.js" "HTTP status codes constants"
    create_file "${SHARED_DIR}/db/postgres.js" "PostgreSQL database connection utility"
    
    # Create SQL schema file
    mkdir -p "${SHARED_DIR}/db/schema"
    cat > "${SHARED_DIR}/db/schema/create_tables.sql" << EOF
-- ================================
-- Esquema de Base de Datos PostgreSQL para Simulador de Créditos Automotrices
-- Cliquéalo.mx
-- ================================

-- Eliminar tablas si existen (para poder ejecutar el script múltiples veces)
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS amortizacion_detalle;
DROP TABLE IF EXISTS credito_vehiculo;
DROP TABLE IF EXISTS credito;
DROP TABLE IF EXISTS vehiculo;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS banco;

-- ================================
-- Creación de Tablas
-- ================================

-- Tabla: banco
-- Almacena información sobre los bancos y sus condiciones de financiamiento
CREATE TABLE banco (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tasa_interes NUMERIC(5,2) NOT NULL, -- Tasa de interés anual (%)
    cat NUMERIC(5,2) NOT NULL, -- Costo Anual Total (%)
    comision_apertura NUMERIC(5,2) NOT NULL, -- Comisión por apertura (%)
    logo VARCHAR(10) DEFAULT '💳', -- Emoji o referencia al logo
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: cliente
-- Almacena información de los clientes
CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(20),
    rfc VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: vehiculo
-- Almacena información de los vehículos a financiar
CREATE TABLE vehiculo (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    anio INTEGER,
    valor NUMERIC(12,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: credito
-- Almacena información del crédito solicitado
CREATE TABLE credito (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES cliente(id),
    banco_id INTEGER REFERENCES banco(id),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto_total NUMERIC(12,2) NOT NULL, -- Valor total de los vehículos
    porcentaje_enganche NUMERIC(5,2) NOT NULL,
    monto_enganche NUMERIC(12,2) NOT NULL,
    monto_financiado NUMERIC(12,2) NOT NULL,
    plazo_meses INTEGER NOT NULL,
    tasa_interes NUMERIC(5,2) NOT NULL, -- Tasa aplicada en el momento
    pago_mensual NUMERIC(12,2) NOT NULL,
    cat NUMERIC(5,2) NOT NULL, -- CAT aplicado en el momento
    comision_apertura NUMERIC(12,2) NOT NULL,
    monto_total_pagar NUMERIC(12,2) NOT NULL,
    estatus VARCHAR(50) DEFAULT 'Simulación', -- Simulación, Solicitado, Aprobado, Rechazado, etc.
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: credito_vehiculo (relación muchos a muchos entre crédito y vehículos)
CREATE TABLE credito_vehiculo (
    credito_id INTEGER REFERENCES credito(id),
    vehiculo_id INTEGER REFERENCES vehiculo(id),
    PRIMARY KEY (credito_id, vehiculo_id)
);

-- Tabla: amortizacion_detalle
-- Almacena el detalle de la tabla de amortización
CREATE TABLE amortizacion_detalle (
    id SERIAL PRIMARY KEY,
    credito_id INTEGER REFERENCES credito(id),
    numero_pago INTEGER NOT NULL,
    fecha_pago DATE NOT NULL,
    pago_total NUMERIC(12,2) NOT NULL,
    pago_capital NUMERIC(12,2) NOT NULL,
    pago_interes NUMERIC(12,2) NOT NULL,
    saldo_insoluto NUMERIC(12,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Tabla de usuarios para el portal
-- ================================

-- Tabla: usuario
-- Almacena información de los usuarios que acceden al portal
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Se debe almacenar cifrado/hash
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente', -- Opciones: admin, asesor, cliente
    cliente_id INTEGER REFERENCES cliente(id), -- NULL para admins y asesores
    ultimo_acceso TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    token_recuperacion VARCHAR(255),
    fecha_expiracion_token TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
    
    create_package_json "${SHARED_DIR}" "shared" "Shared modules for Cliquéalo.mx automotive credit simulator microservices"
    create_readme "${SHARED_DIR}" "Shared Modules" "Shared modules for Cliquéalo.mx automotive credit simulator microservices"
    
    # Create index.js file
    cat > "${SHARED_DIR}/index.js" << EOF
// Shared modules entry point

module.exports = {
  utils: {
    // logger: require('./utils/logger'),
    // errorHandler: require('./utils/errorHandler'),
    // validator: require('./utils/validator')
  },
  constants: {
    // errorCodes: require('./constants/errorCodes'),
    // statusCodes: require('./constants/statusCodes')
  },
  db: {
    // postgres: require('./db/postgres')
  }
};
EOF
  fi
done

# Create docker-compose.yml for the backend
cat > "${CLIQUEATOOLS_DIR}/docker-compose.yml" << EOF
version: '3.8'

services:
  api-gateway:
    build:
      context: ./backend/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - auth-service
      - client-service
      - vehicle-service
      - bank-service
      - credit-service
      - amortization-service
      - postgres
    networks:
      - cliqueatools-network

  auth-service:
    build:
      context: ./backend/auth-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  client-service:
    build:
      context: ./backend/client-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  vehicle-service:
    build:
      context: ./backend/vehicle-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  bank-service:
    build:
      context: ./backend/bank-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  credit-service:
    build:
      context: ./backend/credit-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  amortization-service:
    build:
      context: ./backend/amortization-service
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
    networks:
      - cliqueatools-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: cliqueatools
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/shared/db/schema:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - cliqueatools-network

networks:
  cliqueatools-network:
    driver: bridge

volumes:
  postgres-data:
EOF

# Create README.md for the backend project
cat > "${CLIQUEATOOLS_DIR}/README.md" << EOF
# Cliquéalo.mx Backend - Simulador de Créditos Automotrices

Este proyecto es el backend basado en microservicios para la simulación de créditos automotrices, siguiendo la arquitectura hexagonal y los principios de Domain-Driven Design.

## Estructura del Proyecto

- **Backend**: Arquitectura de microservicios
  - **auth-service**: Autenticación y gestión de usuarios
  - **client-service**: Gestión de datos de clientes
  - **vehicle-service**: Gestión de datos de vehículos
  - **bank-service**: Gestión de bancos e instituciones financieras
  - **credit-service**: Gestión de créditos y préstamos
  - **amortization-service**: Cálculos de amortización y pagos
  - **api-gateway**: Punto de entrada para todas las solicitudes del cliente
  - **shared**: Utilidades y modelos compartidos

## Comenzando

### Prerrequisitos

- Docker y Docker Compose
- Node.js (>= 16.x) y npm (>= 8.x) para desarrollo local

### Ejecutando con Docker

\`\`\`bash
docker-compose up
\`\`\`

### Desarrollo

Cada microservicio puede desarrollarse independientemente:

\`\`\`bash
cd backend/[nombre-servicio]
npm install
npm run dev
\`\`\`

## Arquitectura

Este proyecto sigue la arquitectura hexagonal (puertos y adaptadores) combinada con los principios de Domain-Driven Design, organizada en una arquitectura de microservicios.

### Capas de la Arquitectura Hexagonal:

1. **Capa de Dominio**: Lógica de negocio principal, entidades, objetos de valor
2. **Capa de Aplicación**: Casos de uso, servicios de aplicación, DTOs
3. **Capa de Infraestructura**: Integración con sistemas externos, persistencia
4. **Capa de Interfaz**: Controladores, presentadores, endpoints API

## Stack Tecnológico

- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL
- **Infraestructura**: Docker, Docker Compose
EOF

# Make the script executable
chmod +x "$0"

echo -e "${GREEN}¡Estructura del backend creada exitosamente en ${BACKEND_DIR}!${NC}"
echo ""
echo -e "${YELLOW}Para navegar al proyecto, ejecuta:${NC}"
echo -e "  cd ${CLIQUEATOOLS_DIR}"
echo -e "  ls -la"
echo ""
echo -e "${YELLOW}Para ejecutar los microservicios con Docker Compose:${NC}"
echo -e "  cd ${CLIQUEATOOLS_DIR}"
echo -e "  docker-compose up"