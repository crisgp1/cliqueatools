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
