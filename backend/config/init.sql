-- ===========================================================
-- 1. CREAR LA BASE DE DATOS (Si no existe)
--    Se asume que eres un superusuario (por ejemplo "postgres")
--    o que tu rol actual tiene permisos para crear bases de datos.
-- ===========================================================
CREATE DATABASE cliqueatools;

-- ===========================================================
-- 2. Conectarse a la BD cliqueatools
-- ===========================================================
\c cliqueatools

-- ===========================================================
-- 3. Crear el schema donde vivirá todo (por ejemplo "cliquea")
--    Si deseas usar "public", puedes omitir esta parte.
-- ===========================================================
CREATE SCHEMA IF NOT EXISTS cliquea;

-- Opcionalmente, establecer la búsqueda por defecto a ese schema:
SET search_path TO cliquea;

-- ===========================================================
-- 4. CREAR TIPO ENUM PARA ROLES (rol_usuario)
-- ===========================================================
-- Ajusta si requieres otros roles:
CREATE TYPE cliquea.rol_usuario AS ENUM (
    'capturista',
    'director',
    'creditos',
    'gerencia',
    'admin'
);

-- ===========================================================
-- 5. TABLA DE USUARIOS
--    - Manejo de credenciales (numero_empleado/usuario + contraseña hasheada).
--    - Campo "rol" usando rol_usuario.
--    - Campos de timestamps.
-- ===========================================================
CREATE TABLE cliquea.usuarios (
    usuario_id      SERIAL PRIMARY KEY,
    numero_empleado VARCHAR(20) UNIQUE,
    usuario         VARCHAR(50) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    rol             cliquea.rol_usuario NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ===========================================================
-- 5.1) Ejemplo de INSERT para la tabla usuarios
--      Los hashes son ficticios (se asume que en la lógica real
--      se usará bcrypt o similar).
-- ===========================================================
INSERT INTO cliquea.usuarios (numero_empleado, usuario, hashed_password, rol)
VALUES
    ('EMP001', 'juanp', '$2b$10$HashFicticioBcrypt1example1234aB...', 'capturista'),
    (NULL, 'adminmaster', '$2b$10$HashFicticioBcrypt2example5678X...', 'admin');

-- ===========================================================
-- 6. TABLA DE CLIENTES
--    Basada en ClientForm.jsx
-- ===========================================================
CREATE TABLE cliquea.clientes (
    cliente_id      SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(100) NOT NULL,
    email           VARCHAR(150),
    telefono        VARCHAR(20),
    rfc             VARCHAR(13),
    direccion       VARCHAR(200),
    ciudad          VARCHAR(100),
    codigo_postal   VARCHAR(5)
);

-- ===========================================================
-- 7. TABLA DE VEHÍCULOS
--    Basada en VehicleForm.jsx
-- ===========================================================
CREATE TABLE cliquea.vehiculos (
    vehiculo_id SERIAL PRIMARY KEY,
    marca       VARCHAR(50) NOT NULL,
    modelo      VARCHAR(50) NOT NULL,
    anio        INT NOT NULL,
    valor       NUMERIC(15,2) NOT NULL,
    descripcion VARCHAR(200)
);

-- ===========================================================
-- 8. TABLA DE BANCOS
--    Basada en la lista de bancos de CreditForm.jsx
-- ===========================================================
CREATE TABLE cliquea.bancos (
    banco_id  SERIAL PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL,
    tasa      NUMERIC(5,2),   -- Ej. 12.50 = 12.5%
    cat       NUMERIC(5,2),   -- Ej. 16.20 = 16.2%
    comision  NUMERIC(5,2),   -- Porcentaje
    logo      VARCHAR(255)    -- Ruta o URL del logo
);

-- ===========================================================
-- 9. TABLA DE CRÉDITOS
--    Para almacenar la configuración de un crédito (cliente,
--    vehículo, banco, monto financiado, plazo, etc.)
--    Basada en CreditForm, AmortizationTable, etc.
-- ===========================================================
CREATE TABLE cliquea.creditos (
    credito_id        SERIAL PRIMARY KEY,
    cliente_id        INT NOT NULL REFERENCES cliquea.clientes(cliente_id),
    vehiculo_id       INT NOT NULL REFERENCES cliquea.vehiculos(vehiculo_id),
    banco_id          INT NOT NULL REFERENCES cliquea.bancos(banco_id),
    monto_financiado  NUMERIC(15,2) NOT NULL,
    plazo_meses       INT NOT NULL,
    tasa_anual        NUMERIC(5,2),
    cat_personalizado NUMERIC(5,2),
    fecha_creacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 10. TABLA DE CONTRATOS
--     Basada en ContractForm.jsx
-- ===========================================================
CREATE TABLE cliquea.contratos (
    contrato_id       SERIAL PRIMARY KEY,
    cliente_id        INT NOT NULL REFERENCES cliquea.clientes(cliente_id),
    ciudad            VARCHAR(100),
    fecha_contrato    DATE NOT NULL,
    hora_contrato     TIME NOT NULL,
    precio_total      NUMERIC(15,2),
    forma_pago        VARCHAR(100),
    observaciones     TEXT
);

-- ===========================================================
-- 10.1 RELACIÓN CONTRATO - VEHÍCULOS
--      Si un contrato puede contener varios vehículos
--      se maneja una tabla pivote.
-- ===========================================================
CREATE TABLE cliquea.contrato_vehiculos (
    contrato_id  INT NOT NULL REFERENCES cliquea.contratos(contrato_id),
    vehiculo_id  INT NOT NULL REFERENCES cliquea.vehiculos(vehiculo_id),
    PRIMARY KEY (contrato_id, vehiculo_id)
);

-- ===========================================================
-- 11. INSERTS DE PRUEBA (OPCIONALES)
-- ===========================================================
-- (A) Insertar bancos de ejemplo
INSERT INTO cliquea.bancos (nombre, tasa, cat, comision, logo)
VALUES
  ('BBVA',        12.5, 16.2, 2.0, 'bbva.png'),
  ('Banorte',     13.2, 17.1, 1.8, 'banorte.png'),
  ('Santander',   13.8, 17.5, 2.2, 'santander.png'),
  ('Scotiabank',  14.2, 18.3, 1.5, 'scotiabank.png'),
  ('Citibanamex', 13.5, 17.8, 2.0, 'banamex.png'),
  ('HSBC',        14.5, 18.9, 1.7, 'hsbc.png'),
  ('Inbursa',     12.8, 16.5, 1.9, 'inbursa.png'),
  ('Afirme',      14.8, 19.2, 2.1, 'afirme.png'),
  ('BanRegio',    13.9, 18.0, 1.6, 'banregio.png'),
  ('Hey Banco',   12.9, 16.8, 1.8, 'heybanco.png');

-- (B) Insertar cliente de ejemplo
INSERT INTO cliquea.clientes (nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigo_postal)
VALUES ('Juan', 'Pérez', 'juan.perez@example.com', '5551234567', 'PEJJ800101XXX', 'Calle Falsa 123', 'CDMX', '12345');

-- (C) Insertar vehículo de ejemplo
INSERT INTO cliquea.vehiculos (marca, modelo, anio, valor, descripcion)
VALUES ('Toyota', 'Corolla', 2022, 250000.00, 'Sedán confiable');

-- (D) Insertar contrato de ejemplo
INSERT INTO cliquea.contratos (
    cliente_id,
    ciudad,
    fecha_contrato,
    hora_contrato,
    precio_total,
    forma_pago,
    observaciones
) VALUES (
    1,
    'CDMX',
    CURRENT_DATE,
    CURRENT_TIME,
    250000.00,
    'Transferencia',
    'Contrato de compraventa ejemplo'
);

-- Asociar el vehículo recién insertado (ID=1) al contrato (ID=1)
INSERT INTO cliquea.contrato_vehiculos (contrato_id, vehiculo_id)
VALUES (1, 1);

-- (E) Insertar un crédito de ejemplo con el banco BBVA (banco_id=1)
INSERT INTO cliquea.creditos (
    cliente_id,
    vehiculo_id,
    banco_id,
    monto_financiado,
    plazo_meses,
    tasa_anual,
    cat_personalizado
) VALUES (
    1,
    1,
    1,
    200000.00,
    36,
    12.5,
    NULL
);

-- FIN DEL SCRIPT
