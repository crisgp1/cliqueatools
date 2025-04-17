-- ===============================================================
-- CliqueaTools – Solución Integral Automotriz v4.0
-- Fecha: 2025‑04‑16
-- Optimizado para negocios automotrices en México (Seminuevos, Lotes, Compraventas y Consignaciones)
-- ===============================================================
--  CARACTERÍSTICAS PRINCIPALES
--  • 20 schemas aislados con responsabilidades claramente definidas
--  • PK en UUID (uuid-ossp) + CITEXT para búsquedas insensibles a mayúsculas/minúsculas
--  • CHECK, UNIQUE, FK con índices optimizados + cascadas lógicas
--  • Trigger genérico updated_at para auditoría completa
--  • Totalmente ACID: BEGIN/COMMIT/ROLLBACK con savepoints
--  • Particionamiento para tablas grandes (históricas)
--  • Funciones de auditoría integradas
--  • Búsqueda de texto completo (Full Text Search)
--  • JSON para datos flexibles/dinámicos
-- ===============================================================

BEGIN;

-- ===============================================================
-- 1. EXTENSIONES & SCHEMAS
-- ===============================================================

-- 1.1 Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- Para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS citext;          -- Para búsquedas insensibles a mayúsculas
CREATE EXTENSION IF NOT EXISTS pg_trgm;         -- Para búsqueda de texto similar
CREATE EXTENSION IF NOT EXISTS btree_gist;      -- Para constraints avanzados
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- Para encriptación

-- 1.2 Creación de schemas
CREATE SCHEMA IF NOT EXISTS autenticacion;      -- Autenticación y autorizaciones
CREATE SCHEMA IF NOT EXISTS clientes;           -- Clientes y prospectos
CREATE SCHEMA IF NOT EXISTS inventario;         -- Inventario de vehículos
CREATE SCHEMA IF NOT EXISTS bancos;             -- Bancos y entidades financieras
CREATE SCHEMA IF NOT EXISTS financiamiento;     -- Financiamiento y créditos
CREATE SCHEMA IF NOT EXISTS ventas;             -- Ventas y contratos
CREATE SCHEMA IF NOT EXISTS distribuidores;     -- Distribuidores, lotes y ubicaciones
CREATE SCHEMA IF NOT EXISTS servicio;           -- Servicios y reparaciones
CREATE SCHEMA IF NOT EXISTS seguros;            -- Seguros y pólizas
CREATE SCHEMA IF NOT EXISTS cumplimiento;       -- Cumplimiento legal y regulatorio
CREATE SCHEMA IF NOT EXISTS marketing;          -- Marketing y campañas
CREATE SCHEMA IF NOT EXISTS contabilidad;       -- Contabilidad
CREATE SCHEMA IF NOT EXISTS documentos;         -- Gestión de documentos
CREATE SCHEMA IF NOT EXISTS mantenimiento;      -- Mantenimiento de vehículos
CREATE SCHEMA IF NOT EXISTS subastas;           -- Subastas
CREATE SCHEMA IF NOT EXISTS consignaciones;     -- Consignaciones
CREATE SCHEMA IF NOT EXISTS importaciones;      -- Importación de vehículos
CREATE SCHEMA IF NOT EXISTS logistica;          -- Logística y transporte
CREATE SCHEMA IF NOT EXISTS avaluos;            -- Avalúos y valuaciones
CREATE SCHEMA IF NOT EXISTS proveedores;        -- Proveedores
CREATE SCHEMA IF NOT EXISTS recursos_humanos;   -- Recursos humanos

-- 1.3 Configuración de search path
SET search_path TO autenticacion, clientes, inventario, bancos, financiamiento, ventas, distribuidores, servicio, seguros, cumplimiento, marketing, contabilidad, documentos, mantenimiento, subastas, consignaciones, importaciones, logistica, avaluos, proveedores, recursos_humanos, public;

-- ===============================================================
-- 2. CREACIÓN DE FUNCIONES BÁSICAS
-- ===============================================================

-- 2.1 Trigger para fecha_actualizacion
CREATE OR REPLACE FUNCTION public.establecer_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================
-- 3. TIPOS DE DATOS GLOBALES (ENUMS)
-- ===============================================================

-- 3.1 SCHEMA AUTENTICACION
CREATE TYPE autenticacion.rol_usuario AS ENUM (
    'capturista',
    'director',
    'creditos',
    'gerencia',
    'administrador',
    'vendedor',
    'mecanico',
    'valuador',
    'contador',
    'atencion_cliente',
    'logistica',
    'marketing',
    'legal',
    'rh'
);

CREATE TYPE autenticacion.nivel_acceso AS ENUM (
    'lectura',
    'escritura',
    'administrador',
    'ninguno'
);

-- 3.2 SCHEMA CLIENTES
CREATE TYPE clientes.tipo_cliente AS ENUM (
    'individual',
    'empresa',
    'gobierno'
);

CREATE TYPE clientes.origen_prospecto AS ENUM (
    'referido',
    'web',
    'redes_sociales',
    'visita_lote',
    'llamada',
    'evento',
    'publicidad',
    'otro'
);

-- 3.3 SCHEMA INVENTARIO
CREATE TYPE inventario.tipo_transmision AS ENUM (
    'manual',
    'automatica',
    'cvt',
    'semi_automatica',
    'doble_embrague',
    'secuencial'
);

CREATE TYPE inventario.tipo_combustible AS ENUM (
    'gasolina',
    'diesel',
    'hibrido',
    'electrico',
    'gas_lp',
    'gas_natural',
    'otro'
);

CREATE TYPE inventario.condicion_vehiculo AS ENUM (
    'nuevo',
    'seminuevo',
    'usado',
    'reconstruido',
    'salvamento',
    'clasico'
);

CREATE TYPE inventario.origen_vehiculo AS ENUM (
    'nacional',
    'importado',
    'fronterizo',
    'regularizado',
    'diplomatico'
);

CREATE TYPE inventario.estatus_legal AS ENUM (
    'limpio',
    'en_proceso',
    'reportado',
    'recuperado',
    'pendiente_documentos',
    'restricciones'
);

CREATE TYPE inventario.tipo_adquisicion AS ENUM (
    'compra_directa',
    'consignacion',
    'intercambio',
    'subasta',
    'importacion',
    'recuperacion'
);

-- 3.4 SCHEMA FINANCIAMIENTO
CREATE TYPE financiamiento.estatus_credito AS ENUM (
    'solicitud',
    'analisis',
    'aprobado',
    'rechazado',
    'activo',
    'pagado',
    'cancelado',
    'mora',
    'restructurado'
);

-- 3.5 SCHEMA VENTAS
CREATE TYPE ventas.tipo_contrato AS ENUM (
    'compraventa',
    'consignacion',
    'financiamiento',
    'arrendamiento',
    'intercambio'
);

CREATE TYPE ventas.estatus_contrato AS ENUM (
    'borrador',
    'firmado',
    'cancelado',
    'completado',
    'en_proceso'
);

-- 3.6 SCHEMA DISTRIBUIDORES
CREATE TYPE distribuidores.estatus_vehiculo_lote AS ENUM (
    'en_lote',
    'reservado',
    'vendido',
    'preparacion',
    'en_transito',
    'mantenimiento',
    'consignado',
    'baja'
);

-- 3.7 SCHEMA SERVICIO
CREATE TYPE servicio.tipo_servicio AS ENUM (
    'mantenimiento_preventivo',
    'mantenimiento_correctivo',
    'reparacion',
    'estetica',
    'garantia',
    'revision',
    'otro'
);

CREATE TYPE servicio.estatus_servicio AS ENUM (
    'programado',
    'en_proceso',
    'en_espera_de_partes',
    'completado',
    'entregado',
    'cancelado'
);

-- 3.8 SCHEMA SEGUROS
CREATE TYPE seguros.tipo_seguro AS ENUM (
    'danos_terceros',
    'amplia',
    'limitada',
    'total',
    'robo',
    'responsabilidad_civil',
    'gastos_medicos',
    'asistencia_vial',
    'otro'
);

-- 3.9 SCHEMA CUMPLIMIENTO
CREATE TYPE cumplimiento.tipo_documento AS ENUM (
    'factura_origen',
    'pedimento',
    'tarjeta_circulacion',
    'verificacion',
    'tenencia',
    'poliza_seguro',
    'carta_responsiva',
    'contrato',
    'poder_notarial',
    'identificacion',
    'rfc',
    'comprobante_domicilio',
    'otro'
);

CREATE TYPE cumplimiento.estatus_documento_legal AS ENUM (
    'vigente',
    'por_vencer',
    'vencido',
    'en_tramite',
    'pendiente',
    'indefinido'
);

-- 3.10 SCHEMA MARKETING
CREATE TYPE marketing.tipo_campana AS ENUM (
    'email',
    'sms',
    'redes_sociales',
    'evento',
    'promocion',
    'descuento',
    'referidos',
    'feria',
    'otro'
);

-- 3.11 SCHEMA DOCUMENTOS
CREATE TYPE documentos.categoria_documento AS ENUM (
    'contrato',
    'identificacion',
    'comprobante',
    'vehiculo',
    'financiamiento',
    'seguro',
    'servicio',
    'legal',
    'administrativo',
    'otro'
);

-- 3.12 SCHEMA MANTENIMIENTO
CREATE TYPE mantenimiento.tipo_mantenimiento AS ENUM (
    'preventivo',
    'correctivo',
    'diagnostico',
    'garantia',
    'recall',
    'estetico',
    'preentrega'
);

CREATE TYPE mantenimiento.estatus_mantenimiento AS ENUM (
    'programado',
    'en_proceso',
    'completado',
    'cancelado',
    'pendiente_partes'
);

-- 3.13 SCHEMA SUBASTAS
CREATE TYPE subastas.estatus_subasta AS ENUM (
    'programada',
    'activa',
    'finalizada',
    'cancelada'
);

-- 3.14 SCHEMA CONSIGNACIONES
CREATE TYPE consignaciones.estatus_consignacion AS ENUM (
    'solicitud',
    'activa',
    'vendida',
    'devuelta',
    'cancelada',
    'expirada'
);

-- 3.15 SCHEMA IMPORTACIONES
CREATE TYPE importaciones.estatus_importacion AS ENUM (
    'iniciado',
    'en_transito',
    'en_aduana',
    'en_verificacion',
    'completado',
    'rechazado',
    'cancelado'
);

-- 3.16 SCHEMA LOGISTICA
CREATE TYPE logistica.tipo_transporte AS ENUM (
    'propio',
    'tercerizado',
    'cliente'
);

CREATE TYPE logistica.estatus_transporte AS ENUM (
    'programado',
    'en_ruta',
    'completado',
    'cancelado',
    'retraso'
);

-- 3.17 SCHEMA AVALUOS
CREATE TYPE avaluos.tipo_avaluo AS ENUM (
    'compra',
    'venta',
    'seguro',
    'financiamiento',
    'judicial',
    'intercambio',
    'donacion'
);

-- 3.18 SCHEMA PROVEEDORES
CREATE TYPE proveedores.tipo_proveedor AS ENUM (
    'refacciones',
    'servicios',
    'equipamiento',
    'insumos',
    'marketing',
    'seguros',
    'financiamiento',
    'consultoría',
    'tecnología',
    'otro'
);

-- 3.19 SCHEMA CONTABILIDAD
CREATE TYPE contabilidad.tipo_transaccion AS ENUM (
    'ingreso',
    'egreso',
    'ajuste',
    'transferencia',
    'factura',
    'nota_credito',
    'nota_debito',
    'comision'
);

-- ===============================================================
-- 4. TABLAS BÁSICAS SIN FOREIGN KEYS
-- ===============================================================

-- 4.1 SCHEMA AUTENTICACION - Tabla básica de usuarios (sin FK a sí misma aún)
CREATE TABLE autenticacion.usuarios (
    id_usuario       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_empleado      UUID,
    numero_empleado  VARCHAR(20) UNIQUE,
    nombre_usuario   CITEXT UNIQUE NOT NULL,
    contrasena_hash  VARCHAR(255) NOT NULL,
    correo           CITEXT UNIQUE NOT NULL,
    rol              autenticacion.rol_usuario NOT NULL,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    forzar_cambio    BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso    TIMESTAMPTZ,
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 4.2 SCHEMA CUMPLIMIENTO - Tabla de registro de auditoría
CREATE TABLE cumplimiento.registro_auditoria (
    id_registro      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tabla     VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10) NOT NULL,
    id_fila          UUID NOT NULL,
    datos_antiguos   JSONB,
    datos_nuevos     JSONB,
    fecha_cambio     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_usuario       UUID,
    direccion_ip     INET
);

-- 4.3 SCHEMA BANCOS - Tabla básica de bancos
CREATE TABLE bancos.instituciones (
    id_banco         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(50) NOT NULL UNIQUE,
    nombre_corto     VARCHAR(10) NOT NULL,
    tasa_promedio    NUMERIC(5,2) CHECK (tasa_promedio BETWEEN 0 AND 100),
    cat_promedio     NUMERIC(5,2) CHECK (cat_promedio BETWEEN 0 AND 100),
    comision         NUMERIC(5,2) CHECK (comision BETWEEN 0 AND 100),
    plazo_maximo     INTEGER,
    monto_maximo     NUMERIC(15,2),
    requisitos       TEXT,
    contacto         VARCHAR(100),
    telefono         VARCHAR(20),
    correo           CITEXT,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    logo             VARCHAR(255),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 SCHEMA CLIENTES - Tabla básica de clientes
CREATE TABLE clientes.datos (
    id_cliente       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_cliente     clientes.tipo_cliente NOT NULL DEFAULT 'individual',
    nombre           VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    correo           CITEXT UNIQUE,
    telefono         VARCHAR(20),
    telefono_alt     VARCHAR(20),
    rfc              VARCHAR(13) UNIQUE CHECK (rfc ~ '^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$'),
    curp             VARCHAR(18) UNIQUE CHECK (curp ~ '^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$'),
    ocupacion        VARCHAR(100),
    empresa          VARCHAR(100),
    ingresos_mensuales NUMERIC(15,2),
    origen_prospecto clientes.origen_prospecto,
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID
);

-- 4.5 SCHEMA DISTRIBUIDORES - Tabla básica de distribuidores
CREATE TABLE distribuidores.agencias (
    id_distribuidor  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(100) NOT NULL,
    nombre_comercial VARCHAR(100),
    razon_social     VARCHAR(150) NOT NULL,
    rfc              VARCHAR(13) UNIQUE CHECK (rfc ~ '^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$'),
    telefono         VARCHAR(20) NOT NULL,
    telefono_alt     VARCHAR(20),
    correo           CITEXT NOT NULL,
    sitio_web        VARCHAR(255),
    logo             VARCHAR(255),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    calle            VARCHAR(100) NOT NULL,
    num_ext          VARCHAR(20) NOT NULL,
    num_int          VARCHAR(20),
    colonia          VARCHAR(100) NOT NULL,
    municipio        VARCHAR(100) NOT NULL,
    ciudad           VARCHAR(50) NOT NULL,
    estado           VARCHAR(50) NOT NULL,
    cp               VARCHAR(10) NOT NULL CHECK (cp ~ '^\d{5}$'),
    referencias      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID
);

-- 4.6 SCHEMA DISTRIBUIDORES - Tabla básica de lotes
CREATE TABLE distribuidores.lotes (
    id_lote          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_distribuidor  UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    direccion        VARCHAR(150) NOT NULL,
    ciudad           VARCHAR(50) NOT NULL,
    estado           VARCHAR(50) NOT NULL,
    cp               VARCHAR(10) NOT NULL CHECK (cp ~ '^\d{5}$'),
    telefono         VARCHAR(20),
    capacidad        INTEGER CHECK (capacidad >= 0),
    id_encargado     UUID,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.7 SCHEMA DISTRIBUIDORES - Tabla básica de empleados
CREATE TABLE distribuidores.empleados (
    id_empleado      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_distribuidor  UUID NOT NULL,
    id_lote          UUID,
    numero_empleado  VARCHAR(20) UNIQUE,
    nombre           VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    puesto           VARCHAR(50) NOT NULL,
    departamento     VARCHAR(50) NOT NULL,
    telefono         VARCHAR(20) NOT NULL,
    correo           CITEXT NOT NULL,
    fecha_nacimiento DATE,
    fecha_ingreso    DATE NOT NULL DEFAULT CURRENT_DATE,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    comision_base    NUMERIC(5,2) CHECK (comision_base BETWEEN 0 AND 100),
    salario_base     NUMERIC(15,2),
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 SCHEMA INVENTARIO - Tabla básica de vehículos
CREATE TABLE inventario.vehiculos (
    id_vehiculo      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin              VARCHAR(17) UNIQUE CHECK (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
    num_serie        VARCHAR(20) UNIQUE,
    marca            VARCHAR(50) NOT NULL,
    modelo           VARCHAR(50) NOT NULL,
    anio             INT NOT NULL CHECK (anio BETWEEN 1900 AND EXTRACT(YEAR FROM NOW())::INT + 1),
    version          VARCHAR(50),
    tipo_vehiculo    VARCHAR(30) NOT NULL DEFAULT 'automovil',
    color_exterior   VARCHAR(30) NOT NULL,
    color_interior   VARCHAR(30),
    transmision      inventario.tipo_transmision NOT NULL,
    combustible      inventario.tipo_combustible NOT NULL,
    cilindros        INTEGER,
    cilindrada       NUMERIC(5,1),
    potencia         INTEGER,
    rendimiento_ciudad NUMERIC(5,1),
    rendimiento_carretera NUMERIC(5,1),
    odometro         INTEGER NOT NULL CHECK (odometro >= 0),
    unidad_odometro  VARCHAR(5) NOT NULL DEFAULT 'km',
    condicion        inventario.condicion_vehiculo NOT NULL DEFAULT 'usado',
    origen           inventario.origen_vehiculo NOT NULL DEFAULT 'nacional',
    estatus_legal    inventario.estatus_legal NOT NULL DEFAULT 'limpio',
    precio_compra    NUMERIC(15,2) CHECK (precio_compra >= 0),
    precio_lista     NUMERIC(15,2) NOT NULL CHECK (precio_lista >= 0),
    precio_minimo    NUMERIC(15,2) CHECK (precio_minimo >= 0),
    adquisicion      inventario.tipo_adquisicion NOT NULL,
    fecha_adquisicion DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion      TEXT,
    observaciones    TEXT,
    disponible       BOOLEAN NOT NULL DEFAULT TRUE,
    destacado        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    CONSTRAINT check_precios CHECK (
        (precio_minimo IS NULL OR precio_lista >= precio_minimo) AND
        (precio_compra IS NULL OR precio_lista >= precio_compra)
    )
);

-- 4.9 SCHEMA RECURSOS_HUMANOS - Tabla básica de departamentos
CREATE TABLE recursos_humanos.departamentos (
    id_departamento  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    id_responsable   UUID,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.10 SCHEMA RECURSOS_HUMANOS - Tabla básica de puestos
CREATE TABLE recursos_humanos.puestos (
    id_puesto        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_departamento  UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    requisitos       TEXT,
    salario_min      NUMERIC(15,2),
    salario_max      NUMERIC(15,2),
    comisiones       BOOLEAN NOT NULL DEFAULT FALSE,
    esquema_comision TEXT,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.11 SCHEMA SEGUROS - Tabla básica de aseguradoras
CREATE TABLE seguros.aseguradoras (
    id_aseguradora   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(100) NOT NULL,
    nombre_corto     VARCHAR(20) NOT NULL,
    telefono         VARCHAR(20),
    correo           CITEXT,
    sitio_web        VARCHAR(255),
    direccion        TEXT,
    contacto         VARCHAR(100),
    telefono_siniestros VARCHAR(20),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    logo             VARCHAR(255),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.12 SCHEMA CONTABILIDAD - Tabla básica de cuentas contables
CREATE TABLE contabilidad.cuentas (
    id_cuenta        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo           VARCHAR(20) UNIQUE NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    descripcion      TEXT,
    id_cuenta_padre  UUID,
    nivel            INTEGER NOT NULL DEFAULT 1,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.13 SCHEMA PROVEEDORES - Tabla básica de proveedores
CREATE TABLE proveedores.datos (
    id_proveedor     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razon_social     VARCHAR(150) NOT NULL,
    nombre_comercial VARCHAR(100),
    rfc              VARCHAR(13) CHECK (rfc ~ '^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$'),
    tipo             proveedores.tipo_proveedor NOT NULL,
    descripcion      TEXT,
    telefono         VARCHAR(20),
    correo           CITEXT,
    sitio_web        VARCHAR(255),
    direccion        TEXT,
    ciudad           VARCHAR(50),
    estado           VARCHAR(50),
    cp               VARCHAR(10),
    condiciones_pago VARCHAR(100),
    dias_credito     INTEGER,
    estatus          VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID
);

-- ===============================================================
-- 5. AÑADIR FOREIGN KEYS A TABLAS BÁSICAS
-- ===============================================================

-- 5.1 SCHEMA AUTENTICACION - Añadir FK a autenticacion.usuarios
ALTER TABLE autenticacion.usuarios 
    ADD CONSTRAINT fk_usuarios_creado_por 
    FOREIGN KEY (creado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- 5.2 SCHEMA CLIENTES - Añadir FKs a clientes.datos
ALTER TABLE clientes.datos
    ADD CONSTRAINT fk_clientes_creado_por 
    FOREIGN KEY (creado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

ALTER TABLE clientes.datos
    ADD CONSTRAINT fk_clientes_actualizado_por 
    FOREIGN KEY (actualizado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- 5.3 SCHEMA DISTRIBUIDORES - Añadir FKs a distribuidores.agencias
ALTER TABLE distribuidores.agencias
    ADD CONSTRAINT fk_agencias_creado_por 
    FOREIGN KEY (creado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- 5.4 SCHEMA DISTRIBUIDORES - Añadir FKs a distribuidores.lotes
ALTER TABLE distribuidores.lotes
    ADD CONSTRAINT fk_lotes_distribuidor 
    FOREIGN KEY (id_distribuidor) 
    REFERENCES distribuidores.agencias(id_distribuidor)
    ON DELETE CASCADE;

-- 5.5 SCHEMA DISTRIBUIDORES - Añadir FKs a distribuidores.empleados
ALTER TABLE distribuidores.empleados
    ADD CONSTRAINT fk_empleados_distribuidor 
    FOREIGN KEY (id_distribuidor) 
    REFERENCES distribuidores.agencias(id_distribuidor)
    ON DELETE CASCADE;

ALTER TABLE distribuidores.empleados
    ADD CONSTRAINT fk_empleados_lote 
    FOREIGN KEY (id_lote) 
    REFERENCES distribuidores.lotes(id_lote);

-- 5.6 SCHEMA INVENTARIO - Añadir FKs a inventario.vehiculos
ALTER TABLE inventario.vehiculos
    ADD CONSTRAINT fk_vehiculos_creado_por 
    FOREIGN KEY (creado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

ALTER TABLE inventario.vehiculos
    ADD CONSTRAINT fk_vehiculos_actualizado_por 
    FOREIGN KEY (actualizado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- 5.7 SCHEMA RECURSOS_HUMANOS - Añadir FKs a departamentos
ALTER TABLE recursos_humanos.departamentos
    ADD CONSTRAINT fk_departamentos_responsable 
    FOREIGN KEY (id_responsable) 
    REFERENCES distribuidores.empleados(id_empleado);

-- 5.8 SCHEMA RECURSOS_HUMANOS - Añadir FKs a puestos
ALTER TABLE recursos_humanos.puestos
    ADD CONSTRAINT fk_puestos_departamento 
    FOREIGN KEY (id_departamento) 
    REFERENCES recursos_humanos.departamentos(id_departamento);

-- 5.9 SCHEMA CONTABILIDAD - Añadir FKs a contabilidad.cuentas
ALTER TABLE contabilidad.cuentas
    ADD CONSTRAINT fk_cuentas_cuenta_padre 
    FOREIGN KEY (id_cuenta_padre) 
    REFERENCES contabilidad.cuentas(id_cuenta);

-- 5.10 SCHEMA PROVEEDORES - Añadir FKs a proveedores.datos
ALTER TABLE proveedores.datos
    ADD CONSTRAINT fk_proveedores_creado_por
    FOREIGN KEY (creado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

ALTER TABLE proveedores.datos
    ADD CONSTRAINT fk_proveedores_actualizado_por
    FOREIGN KEY (actualizado_por) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- 5.11 SCHEMA CUMPLIMIENTO - Añadir FKs a registro_auditoria
ALTER TABLE cumplimiento.registro_auditoria
    ADD CONSTRAINT fk_registro_auditoria_usuario
    FOREIGN KEY (id_usuario) 
    REFERENCES autenticacion.usuarios(id_usuario);

-- ===============================================================
-- 6. FUNCTION PARA AUDITORÍA
-- ===============================================================

-- Función para auditoría de cambios en tablas importantes
CREATE OR REPLACE FUNCTION public.auditar_cambios_tabla()
RETURNS TRIGGER AS $$
DECLARE
    datos_auditoria JSONB;
    id_fila UUID;
BEGIN
    -- TG_ARGV[0] debería contener el nombre de la columna PK (id_usuario, id_vehiculo, etc.)
    IF TG_ARGV[0] IS NULL THEN
        RAISE EXCEPTION 'Se debe especificar el nombre de la columna PK como argumento';
    END IF;
    
    IF (TG_OP = 'DELETE') THEN
        datos_auditoria = to_jsonb(OLD);
        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0]) INTO id_fila USING OLD;
        INSERT INTO cumplimiento.registro_auditoria (nombre_tabla, operacion, id_fila, datos_antiguos)
        VALUES (TG_TABLE_NAME, TG_OP, id_fila, datos_auditoria);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        datos_auditoria = to_jsonb(NEW);
        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0]) INTO id_fila USING NEW;
        INSERT INTO cumplimiento.registro_auditoria (nombre_tabla, operacion, id_fila, datos_antiguos, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, id_fila, to_jsonb(OLD), datos_auditoria);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        datos_auditoria = to_jsonb(NEW);
        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0]) INTO id_fila USING NEW;
        INSERT INTO cumplimiento.registro_auditoria (nombre_tabla, operacion, id_fila, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, id_fila, datos_auditoria);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================
-- 7. RESTO DE TABLAS CON SUS FOREIGN KEYS
-- ===============================================================

-- 7.1 SCHEMA AUTENTICACION - Permisos

CREATE TABLE autenticacion.permisos (
    id_permiso       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modulo           VARCHAR(50) NOT NULL,
    accion           VARCHAR(50) NOT NULL,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (modulo, accion)
);

CREATE TABLE autenticacion.roles_permisos (
    rol              autenticacion.rol_usuario NOT NULL,
    id_permiso       UUID NOT NULL,
    nivel_acceso     autenticacion.nivel_acceso NOT NULL DEFAULT 'lectura',
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    PRIMARY KEY (rol, id_permiso),
    FOREIGN KEY (id_permiso) REFERENCES autenticacion.permisos(id_permiso) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE autenticacion.sesiones (
    id_sesion        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario       UUID NOT NULL,
    token            VARCHAR(255) UNIQUE NOT NULL,
    direccion_ip     INET,
    agente_usuario   TEXT,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_usuario) REFERENCES autenticacion.usuarios(id_usuario) ON DELETE CASCADE
);

-- 7.2 SCHEMA CLIENTES - Direcciones, Referencias e Interacciones

CREATE TABLE clientes.direcciones (
    id_direccion     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente       UUID NOT NULL,
    tipo             VARCHAR(20) NOT NULL DEFAULT 'principal',
    calle            VARCHAR(100) NOT NULL,
    num_ext          VARCHAR(20) NOT NULL,
    num_int          VARCHAR(20),
    colonia          VARCHAR(100) NOT NULL,
    municipio        VARCHAR(100) NOT NULL,
    ciudad           VARCHAR(100) NOT NULL,
    estado           VARCHAR(50) NOT NULL,
    cp               VARCHAR(10) NOT NULL CHECK (cp ~ '^\d{5}$'),
    referencias      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    es_principal     BOOLEAN DEFAULT TRUE,
    UNIQUE (id_cliente, tipo),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente) ON DELETE CASCADE
);

CREATE TABLE clientes.referencias (
    id_referencia    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente       UUID NOT NULL,
    tipo             VARCHAR(50) NOT NULL DEFAULT 'personal',
    nombre           VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    relacion         VARCHAR(50) NOT NULL,
    telefono         VARCHAR(20) NOT NULL,
    correo           CITEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente) ON DELETE CASCADE
);

CREATE TABLE clientes.interacciones (
    id_interaccion   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente       UUID NOT NULL,
    id_usuario       UUID NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    fecha            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    descripcion      TEXT NOT NULL,
    seguimiento      BOOLEAN DEFAULT FALSE,
    fecha_seguimiento TIMESTAMPTZ,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.3 SCHEMA INVENTARIO - Imágenes, características e historial de precios

CREATE TABLE inventario.imagenes_vehiculo (
    id_imagen        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID NOT NULL,
    url              VARCHAR(255) NOT NULL,
    tipo             VARCHAR(30) NOT NULL DEFAULT 'exterior',
    es_principal     BOOLEAN NOT NULL DEFAULT FALSE,
    orden            INTEGER NOT NULL DEFAULT 0,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo) ON DELETE CASCADE
);

CREATE TABLE inventario.caracteristicas_vehiculo (
    id_vehiculo      UUID PRIMARY KEY,
    caracteristicas  JSONB NOT NULL DEFAULT '{}'::JSONB,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo) ON DELETE CASCADE
);

CREATE TABLE inventario.historial_precios (
    id_historial     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID NOT NULL,
    precio_anterior  NUMERIC(15,2) NOT NULL,
    precio_nuevo     NUMERIC(15,2) NOT NULL,
    motivo           VARCHAR(100),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.4 SCHEMA BANCOS - Planes de financiamiento, contactos, cuentas

CREATE TABLE bancos.planes_financiamiento (
    id_plan          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_banco         UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    tasa_minima      NUMERIC(5,2) NOT NULL CHECK (tasa_minima BETWEEN 0 AND 100),
    tasa_maxima      NUMERIC(5,2) NOT NULL CHECK (tasa_maxima BETWEEN 0 AND 100),
    cat              NUMERIC(5,2) NOT NULL CHECK (cat BETWEEN 0 AND 100),
    plazo_minimo     INTEGER NOT NULL CHECK (plazo_minimo > 0),
    plazo_maximo     INTEGER NOT NULL CHECK (plazo_maximo > 0),
    enganche_minimo  NUMERIC(5,2) NOT NULL CHECK (enganche_minimo BETWEEN 0 AND 100),
    comision_apertura NUMERIC(5,2) CHECK (comision_apertura BETWEEN 0 AND 100),
    seguro_requerido BOOLEAN NOT NULL DEFAULT TRUE,
    anio_modelo_minimo INTEGER,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_plazos CHECK (plazo_maximo >= plazo_minimo),
    CONSTRAINT check_tasas CHECK (tasa_maxima >= tasa_minima),
    FOREIGN KEY (id_banco) REFERENCES bancos.instituciones(id_banco) ON DELETE CASCADE
);

CREATE TABLE bancos.contactos_banco (
    id_contacto      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_banco         UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    puesto           VARCHAR(100),
    telefono         VARCHAR(20),
    correo           CITEXT,
    notas            TEXT,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_banco) REFERENCES bancos.instituciones(id_banco) ON DELETE CASCADE
);

CREATE TABLE bancos.cuentas_empresa (
    id_cuenta        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_banco         UUID NOT NULL,
    nombre_cuenta    VARCHAR(100) NOT NULL,
    tipo_cuenta      VARCHAR(50) NOT NULL,
    numero_cuenta    VARCHAR(50) NOT NULL,
    clabe            VARCHAR(18) CHECK (clabe ~ '^\d{18}$'),
    moneda           VARCHAR(3) NOT NULL DEFAULT 'MXN',
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_banco, numero_cuenta),
    FOREIGN KEY (id_banco) REFERENCES bancos.instituciones(id_banco) ON DELETE RESTRICT
);

-- 7.5 SCHEMA FINANCIAMIENTO - Créditos, amortización, pagos, documentos e historial

CREATE TABLE financiamiento.creditos (
    id_credito       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente       UUID NOT NULL,
    id_vehiculo      UUID NOT NULL,
    id_banco         UUID NOT NULL,
    id_plan          UUID,
    folio            VARCHAR(50) UNIQUE,
    estado           financiamiento.estatus_credito NOT NULL DEFAULT 'solicitud',
    monto_financiado NUMERIC(15,2) NOT NULL CHECK (monto_financiado > 0),
    enganche         NUMERIC(15,2) NOT NULL CHECK (enganche >= 0),
    plazo_meses      INTEGER NOT NULL CHECK (plazo_meses > 0),
    monto_mensual    NUMERIC(15,2) NOT NULL CHECK (monto_mensual > 0),
    tasa_anual       NUMERIC(5,2) NOT NULL CHECK (tasa_anual BETWEEN 0 AND 100),
    cat_personalizado NUMERIC(5,2) NOT NULL CHECK (cat_personalizado BETWEEN 0 AND 100),
    comision_apertura NUMERIC(15,2) NOT NULL DEFAULT 0,
    seguro_auto      NUMERIC(15,2) NOT NULL DEFAULT 0,
    seguro_vida      NUMERIC(15,2) NOT NULL DEFAULT 0,
    otros_cargos     NUMERIC(15,2) NOT NULL DEFAULT 0,
    fecha_solicitud  DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_aprobacion DATE,
    fecha_inicio     DATE,
    fecha_vencimiento DATE,
    dia_pago         INTEGER CHECK (dia_pago BETWEEN 1 AND 31),
    observaciones    TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_banco) REFERENCES bancos.instituciones(id_banco),
    FOREIGN KEY (id_plan) REFERENCES bancos.planes_financiamiento(id_plan),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- Continuación del esquema anterior...

CREATE TABLE financiamiento.tabla_amortizacion (
    id_amortizacion  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_credito       UUID NOT NULL,
    numero_pago      INTEGER NOT NULL CHECK (numero_pago > 0),
    fecha_pago       DATE NOT NULL,
    saldo_inicial    NUMERIC(15,2) NOT NULL CHECK (saldo_inicial >= 0),
    pago_capital     NUMERIC(15,2) NOT NULL CHECK (pago_capital >= 0),
    pago_interes     NUMERIC(15,2) NOT NULL CHECK (pago_interes >= 0),
    pago_seguro      NUMERIC(15,2) NOT NULL DEFAULT 0,
    otros_cargos     NUMERIC(15,2) NOT NULL DEFAULT 0,
    monto_pago       NUMERIC(15,2) NOT NULL CHECK (monto_pago >= 0),
    saldo_final      NUMERIC(15,2) NOT NULL CHECK (saldo_final >= 0),
    pagado           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_pagado     DATE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_credito, numero_pago),
    FOREIGN KEY (id_credito) REFERENCES financiamiento.creditos(id_credito) ON DELETE CASCADE
);

CREATE TABLE financiamiento.pagos (
    id_pago          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_credito       UUID NOT NULL,
    id_amortizacion  UUID,
    monto            NUMERIC(15,2) NOT NULL CHECK (monto > 0),
    fecha_pago       DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago      VARCHAR(50) NOT NULL,
    referencia       VARCHAR(100),
    comprobante      VARCHAR(255),
    recibido_por     UUID,
    comentarios      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_credito) REFERENCES financiamiento.creditos(id_credito) ON DELETE CASCADE,
    FOREIGN KEY (id_amortizacion) REFERENCES financiamiento.tabla_amortizacion(id_amortizacion),
    FOREIGN KEY (recibido_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE financiamiento.documentos_credito (
    id_documento     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_credito       UUID NOT NULL,
    tipo_documento   VARCHAR(50) NOT NULL,
    url              VARCHAR(255) NOT NULL,
    fecha_carga      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subido_por       UUID,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_credito) REFERENCES financiamiento.creditos(id_credito) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE financiamiento.historial_estatus_credito (
    id_historial     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_credito       UUID NOT NULL,
    estado_anterior  financiamiento.estatus_credito,
    estado_nuevo     financiamiento.estatus_credito NOT NULL,
    motivo           TEXT,
    fecha_cambio     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cambiado_por     UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_credito) REFERENCES financiamiento.creditos(id_credito) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.6 SCHEMA VENTAS - Contratos, vehículos, pagos, documentos e historial

CREATE TABLE ventas.contratos (
    id_contrato      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente       UUID NOT NULL,
    tipo_contrato    ventas.tipo_contrato NOT NULL,
    estado           ventas.estatus_contrato NOT NULL DEFAULT 'borrador',
    folio            VARCHAR(50) UNIQUE,
    fecha_contrato   DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_contrato    TIME NOT NULL DEFAULT CURRENT_TIME,
    ciudad           VARCHAR(100) NOT NULL,
    precio_total     NUMERIC(15,2) NOT NULL CHECK (precio_total >= 0),
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    descuento        NUMERIC(15,2) NOT NULL DEFAULT 0,
    forma_pago       VARCHAR(50) NOT NULL,
    id_vendedor      UUID,
    id_distribuidor  UUID,
    observaciones    TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_vendedor) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (id_distribuidor) REFERENCES distribuidores.agencias(id_distribuidor),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE ventas.vehiculos_contrato (
    id_contrato      UUID NOT NULL,
    id_vehiculo      UUID NOT NULL,
    precio_venta     NUMERIC(15,2) NOT NULL CHECK (precio_venta >= 0),
    comision         NUMERIC(15,2) NOT NULL DEFAULT 0,
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    descuento        NUMERIC(15,2) NOT NULL DEFAULT 0,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_contrato, id_vehiculo),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato) ON DELETE CASCADE,
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo)
);

CREATE TABLE ventas.pagos_contrato (
    id_pago          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_contrato      UUID NOT NULL,
    monto            NUMERIC(15,2) NOT NULL CHECK (monto > 0),
    tipo_pago        VARCHAR(50) NOT NULL,
    fecha_pago       DATE NOT NULL DEFAULT CURRENT_DATE,
    referencia       VARCHAR(100),
    comprobante      VARCHAR(255),
    id_cuenta        UUID,
    recibido_por     UUID,
    observaciones    TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato) ON DELETE CASCADE,
    FOREIGN KEY (id_cuenta) REFERENCES bancos.cuentas_empresa(id_cuenta),
    FOREIGN KEY (recibido_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE ventas.documentos_contrato (
    id_documento     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_contrato      UUID NOT NULL,
    tipo_documento   VARCHAR(50) NOT NULL,
    url              VARCHAR(255) NOT NULL,
    fecha_carga      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subido_por       UUID,
    comentarios      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE ventas.historial_estatus_contrato (
    id_historial     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_contrato      UUID NOT NULL,
    estado_anterior  ventas.estatus_contrato,
    estado_nuevo     ventas.estatus_contrato NOT NULL,
    motivo           TEXT,
    fecha_cambio     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cambiado_por     UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.7 SCHEMA DISTRIBUIDORES - Inventario de lotes y movimientos de vehículos

CREATE TABLE distribuidores.inventario_lote (
    id_lote          UUID NOT NULL,
    id_vehiculo      UUID NOT NULL,
    estado           distribuidores.estatus_vehiculo_lote NOT NULL DEFAULT 'en_lote',
    fecha_ingreso    DATE NOT NULL DEFAULT CURRENT_DATE,
    ubicacion_lote   VARCHAR(50),
    notas            TEXT,
    id_responsable   UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_lote, id_vehiculo),
    FOREIGN KEY (id_lote) REFERENCES distribuidores.lotes(id_lote) ON DELETE CASCADE,
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_responsable) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE distribuidores.movimientos_vehiculos (
    id_movimiento    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID NOT NULL,
    id_origen        UUID,
    id_destino       UUID,
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motivo           TEXT NOT NULL,
    realizado_por    UUID,
    estado_vehiculo  TEXT,
    km_actual        INTEGER,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_origen) REFERENCES distribuidores.lotes(id_lote),
    FOREIGN KEY (id_destino) REFERENCES distribuidores.lotes(id_lote),
    FOREIGN KEY (realizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.8 SCHEMA SERVICIO - Órdenes, detalles, partes, seguimiento, imágenes

CREATE TABLE servicio.ordenes (
    id_orden         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID NOT NULL,
    id_cliente       UUID,
    tipo_servicio    servicio.tipo_servicio NOT NULL,
    estado           servicio.estatus_servicio NOT NULL DEFAULT 'programado',
    folio            VARCHAR(50) UNIQUE,
    km_recepcion     INTEGER NOT NULL,
    fecha_recepcion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_promesa    TIMESTAMPTZ NOT NULL,
    fecha_entrega    TIMESTAMPTZ,
    nivel_combustible VARCHAR(20) NOT NULL DEFAULT 'medio',
    descripcion      TEXT NOT NULL,
    diagnostico      TEXT,
    recomendaciones  TEXT,
    costo_estimado   NUMERIC(15,2),
    costo_final      NUMERIC(15,2),
    id_tecnico       UUID,
    id_asesor        UUID,
    notas_internas   TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_tecnico) REFERENCES distribuidores.empleados(id_empleado),
    FOREIGN KEY (id_asesor) REFERENCES distribuidores.empleados(id_empleado),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE servicio.detalles (
    id_detalle       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_orden         UUID NOT NULL,
    descripcion      TEXT NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    costo_mano_obra  NUMERIC(15,2) NOT NULL DEFAULT 0,
    costo_partes     NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal         NUMERIC(15,2) NOT NULL,
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    total            NUMERIC(15,2) NOT NULL,
    tiempo_estimado  INTEGER, -- En minutos
    completado       BOOLEAN NOT NULL DEFAULT FALSE,
    id_tecnico       UUID,
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_orden) REFERENCES servicio.ordenes(id_orden) ON DELETE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES distribuidores.empleados(id_empleado)
);

CREATE TABLE servicio.partes_usadas (
    id_parte         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_detalle       UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(15,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal         NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    total            NUMERIC(15,2) NOT NULL CHECK (total >= 0),
    codigo_parte     VARCHAR(50),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_detalle) REFERENCES servicio.detalles(id_detalle) ON DELETE CASCADE
);

CREATE TABLE servicio.historial_estatus (
    id_historial     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_orden         UUID NOT NULL,
    estado_anterior  servicio.estatus_servicio,
    estado_nuevo     servicio.estatus_servicio NOT NULL,
    comentarios      TEXT,
    fecha_cambio     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cambiado_por     UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_orden) REFERENCES servicio.ordenes(id_orden) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE servicio.imagenes (
    id_imagen        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_orden         UUID NOT NULL,
    url              VARCHAR(255) NOT NULL,
    tipo             VARCHAR(50) NOT NULL,
    descripcion      TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    FOREIGN KEY (id_orden) REFERENCES servicio.ordenes(id_orden) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.9 SCHEMA SEGUROS - Planes, pólizas, reclamaciones

CREATE TABLE seguros.planes (
    id_plan          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_aseguradora   UUID NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    tipo_seguro      seguros.tipo_seguro NOT NULL,
    descripcion      TEXT,
    detalles_cobertura JSONB,
    prima_base       NUMERIC(15,2),
    deducible        NUMERIC(5,2),
    suma_asegurada   VARCHAR(100),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_aseguradora) REFERENCES seguros.aseguradoras(id_aseguradora) ON DELETE CASCADE
);

CREATE TABLE seguros.polizas (
    id_poliza        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_plan          UUID NOT NULL,
    id_cliente       UUID NOT NULL,
    id_vehiculo      UUID NOT NULL,
    numero_poliza    VARCHAR(50) UNIQUE NOT NULL,
    fecha_inicio     DATE NOT NULL,
    fecha_fin        DATE NOT NULL,
    prima_pagada     NUMERIC(15,2) NOT NULL,
    forma_pago       VARCHAR(50) NOT NULL,
    frecuencia_pago  VARCHAR(20) NOT NULL DEFAULT 'anual',
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    deducible        NUMERIC(5,2) NOT NULL,
    suma_asegurada   NUMERIC(15,2) NOT NULL,
    cobertura        JSONB,
    beneficiarios    TEXT,
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    CONSTRAINT check_fechas CHECK (fecha_fin > fecha_inicio),
    FOREIGN KEY (id_plan) REFERENCES seguros.planes(id_plan),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE seguros.siniestros (
    id_siniestro     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_poliza        UUID NOT NULL,
    numero_reclamo   VARCHAR(50) UNIQUE,
    fecha_incidente  DATE NOT NULL,
    fecha_reclamo    DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion      TEXT NOT NULL,
    ubicacion        TEXT,
    tipo_incidente   VARCHAR(50) NOT NULL,
    monto_reclamado  NUMERIC(15,2),
    monto_aprobado   NUMERIC(15,2),
    estado           VARCHAR(50) NOT NULL DEFAULT 'reportado',
    ajustador        VARCHAR(100),
    contacto_ajustador VARCHAR(100),
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_poliza) REFERENCES seguros.polizas(id_poliza),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.10 SCHEMA CUMPLIMIENTO - Documentos legales, verificaciones, obligaciones

CREATE TABLE cumplimiento.documentos_legales (
    id_documento     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID,
    id_cliente       UUID,
    id_contrato      UUID,
    tipo_documento   cumplimiento.tipo_documento NOT NULL,
    numero_documento VARCHAR(100),
    fecha_emision    DATE,
    fecha_vencimiento DATE,
    estado           cumplimiento.estatus_documento_legal NOT NULL DEFAULT 'vigente',
    url              VARCHAR(255),
    emisor           VARCHAR(100),
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    CHECK (
        (id_vehiculo IS NOT NULL AND id_cliente IS NULL AND id_contrato IS NULL) OR
        (id_vehiculo IS NULL AND id_cliente IS NOT NULL AND id_contrato IS NULL) OR
        (id_vehiculo IS NULL AND id_cliente IS NULL AND id_contrato IS NOT NULL) OR
        (id_vehiculo IS NOT NULL AND id_cliente IS NOT NULL AND id_contrato IS NULL) OR
        (id_vehiculo IS NOT NULL AND id_cliente IS NULL AND id_contrato IS NOT NULL) OR
        (id_vehiculo IS NULL AND id_cliente IS NOT NULL AND id_contrato IS NOT NULL) OR
        (id_vehiculo IS NOT NULL AND id_cliente IS NOT NULL AND id_contrato IS NOT NULL)
    ),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE cumplimiento.verificaciones (
    id_verificacion  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID NOT NULL,
    tipo_verificacion VARCHAR(50) NOT NULL,
    folio            VARCHAR(50),
    fecha_realizacion DATE NOT NULL,
    fecha_vencimiento DATE,
    resultado        VARCHAR(50) NOT NULL,
    centro_verificacion VARCHAR(100),
    costo            NUMERIC(15,2),
    url_comprobante  VARCHAR(255),
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE cumplimiento.obligaciones_fiscales (
    id_obligacion    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_vehiculo      UUID,
    id_cliente       UUID,
    tipo_obligacion  VARCHAR(50) NOT NULL,
    año_fiscal       INTEGER NOT NULL,
    periodo          VARCHAR(20) NOT NULL,
    monto            NUMERIC(15,2) NOT NULL,
    fecha_limite     DATE NOT NULL,
    fecha_pago       DATE,
    comprobante      VARCHAR(255),
    estado           VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    CHECK (
        (id_vehiculo IS NOT NULL AND id_cliente IS NULL) OR
        (id_vehiculo IS NULL AND id_cliente IS NOT NULL) OR
        (id_vehiculo IS NOT NULL AND id_cliente IS NOT NULL)
    ),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.11 SCHEMA MARKETING - Campañas, prospectos, seguimiento

CREATE TABLE marketing.campanas (
    id_campana       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre           VARCHAR(100) NOT NULL,
    tipo             marketing.tipo_campana NOT NULL,
    descripcion      TEXT NOT NULL,
    fecha_inicio     DATE NOT NULL,
    fecha_fin        DATE NOT NULL,
    presupuesto      NUMERIC(15,2),
    costo_actual     NUMERIC(15,2) DEFAULT 0,
    objetivo         TEXT,
    id_responsable   UUID,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    CONSTRAINT check_fechas_campana CHECK (fecha_fin >= fecha_inicio),
    FOREIGN KEY (id_responsable) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE marketing.prospectos (
    id_prospecto     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_campana       UUID,
    nombre           VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    correo           CITEXT,
    telefono         VARCHAR(20),
    origen           VARCHAR(50) NOT NULL,
    interes          VARCHAR(100),
    comentarios      TEXT,
    asignado_a       UUID,
    estado           VARCHAR(20) NOT NULL DEFAULT 'nuevo',
    fecha_seguimiento DATE,
    convertido_cliente BOOLEAN DEFAULT FALSE,
    id_cliente       UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_campana) REFERENCES marketing.campanas(id_campana),
    FOREIGN KEY (asignado_a) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente)
);

CREATE TABLE marketing.seguimiento_prospectos (
    id_seguimiento   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_prospecto     UUID NOT NULL,
    fecha            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo_contacto    VARCHAR(50) NOT NULL,
    resultado        VARCHAR(50) NOT NULL,
    comentarios      TEXT,
    siguiente_accion VARCHAR(100),
    fecha_siguiente  DATE,
    realizado_por    UUID,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_prospecto) REFERENCES marketing.prospectos(id_prospecto) ON DELETE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- 7.12 SCHEMA CONTABILIDAD - Transacciones, detalles, facturas

CREATE TABLE contabilidad.transacciones (
    id_transaccion   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo             contabilidad.tipo_transaccion NOT NULL,
    fecha            DATE NOT NULL DEFAULT CURRENT_DATE,
    concepto         VARCHAR(200) NOT NULL,
    referencia       VARCHAR(100),
    monto            NUMERIC(15,2) NOT NULL,
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    total            NUMERIC(15,2) NOT NULL,
    id_cliente       UUID,
    id_vehiculo      UUID,
    id_contrato      UUID,
    id_credito       UUID,
    nota             TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (id_vehiculo) REFERENCES inventario.vehiculos(id_vehiculo),
    FOREIGN KEY (id_contrato) REFERENCES ventas.contratos(id_contrato),
    FOREIGN KEY (id_credito) REFERENCES financiamiento.creditos(id_credito),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

CREATE TABLE contabilidad.detalles_transaccion (
    id_detalle       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_transaccion   UUID NOT NULL,
    id_cuenta        UUID NOT NULL,
    descripcion      VARCHAR(200) NOT NULL,
    es_debito        BOOLEAN NOT NULL,
    monto            NUMERIC(15,2) NOT NULL CHECK (monto >= 0),
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_transaccion) REFERENCES contabilidad.transacciones(id_transaccion) ON DELETE CASCADE,
    FOREIGN KEY (id_cuenta) REFERENCES contabilidad.cuentas(id_cuenta)
);

CREATE TABLE contabilidad.facturas (
    id_factura       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_transaccion   UUID,
    numero_factura   VARCHAR(50) UNIQUE NOT NULL,
    serie            VARCHAR(10),
    fecha_emision    DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    id_cliente       UUID NOT NULL,
    subtotal         NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    impuestos        NUMERIC(15,2) NOT NULL DEFAULT 0,
    total            NUMERIC(15,2) NOT NULL CHECK (total >= 0),
    estado           VARCHAR(20) NOT NULL DEFAULT 'emitida',
    uuid_sat         VARCHAR(36) UNIQUE,
    url_xml          VARCHAR(255),
    url_pdf          VARCHAR(255),
    notas            TEXT,
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por       UUID,
    actualizado_por  UUID,
    FOREIGN KEY (id_transaccion) REFERENCES contabilidad.transacciones(id_transaccion),
    FOREIGN KEY (id_cliente) REFERENCES clientes.datos(id_cliente),
    FOREIGN KEY (creado_por) REFERENCES autenticacion.usuarios(id_usuario),
    FOREIGN KEY (actualizado_por) REFERENCES autenticacion.usuarios(id_usuario)
);

-- ===============================================================
-- 8. CREACIÓN DE TRIGGERS
-- ===============================================================

-- 8.1 Triggers para actualizar fecha_actualizacion en todas las tablas que lo requieren

CREATE TRIGGER trg_bancos_instituciones_u 
BEFORE UPDATE ON bancos.instituciones
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_bancos_planes_financiamiento_u 
BEFORE UPDATE ON bancos.planes_financiamiento
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_bancos_contactos_banco_u 
BEFORE UPDATE ON bancos.contactos_banco
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_bancos_cuentas_empresa_u 
BEFORE UPDATE ON bancos.cuentas_empresa
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_clientes_datos_u 
BEFORE UPDATE ON clientes.datos
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_clientes_direcciones_u 
BEFORE UPDATE ON clientes.direcciones
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_distribuidores_agencias_u 
BEFORE UPDATE ON distribuidores.agencias
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_distribuidores_lotes_u 
BEFORE UPDATE ON distribuidores.lotes
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_distribuidores_empleados_u 
BEFORE UPDATE ON distribuidores.empleados
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_distribuidores_inventario_lote_u 
BEFORE UPDATE ON distribuidores.inventario_lote
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_inventario_vehiculos_u 
BEFORE UPDATE ON inventario.vehiculos
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_inventario_caracteristicas_vehiculo_u 
BEFORE UPDATE ON inventario.caracteristicas_vehiculo
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_financiamiento_creditos_u 
BEFORE UPDATE ON financiamiento.creditos
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_financiamiento_tabla_amortizacion_u 
BEFORE UPDATE ON financiamiento.tabla_amortizacion
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_ventas_contratos_u 
BEFORE UPDATE ON ventas.contratos
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_servicio_ordenes_u 
BEFORE UPDATE ON servicio.ordenes
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_servicio_detalles_u 
BEFORE UPDATE ON servicio.detalles
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_seguros_aseguradoras_u 
BEFORE UPDATE ON seguros.aseguradoras
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_seguros_planes_u 
BEFORE UPDATE ON seguros.planes
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_seguros_polizas_u 
BEFORE UPDATE ON seguros.polizas
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_seguros_siniestros_u 
BEFORE UPDATE ON seguros.siniestros
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_cumplimiento_documentos_legales_u 
BEFORE UPDATE ON cumplimiento.documentos_legales
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_cumplimiento_verificaciones_u 
BEFORE UPDATE ON cumplimiento.verificaciones
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_cumplimiento_obligaciones_fiscales_u 
BEFORE UPDATE ON cumplimiento.obligaciones_fiscales
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_marketing_campanas_u 
BEFORE UPDATE ON marketing.campanas
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_marketing_prospectos_u 
BEFORE UPDATE ON marketing.prospectos
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_contabilidad_cuentas_u 
BEFORE UPDATE ON contabilidad.cuentas
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_contabilidad_transacciones_u 
BEFORE UPDATE ON contabilidad.transacciones
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

CREATE TRIGGER trg_contabilidad_facturas_u 
BEFORE UPDATE ON contabilidad.facturas
FOR EACH ROW EXECUTE FUNCTION public.establecer_fecha_actualizacion();

-- 8.2 Triggers para auditoría en tablas clave
-- Nota: Se deben agregar el nombre de la columna PK como argumento

-- Para autenticacion.usuarios
CREATE TRIGGER trg_autenticacion_usuarios_audit 
AFTER INSERT OR UPDATE OR DELETE ON autenticacion.usuarios
FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_tabla('id_usuario');

-- Para clientes.datos
CREATE TRIGGER trg_clientes_datos_audit 
AFTER INSERT OR UPDATE OR DELETE ON clientes.datos
FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_tabla('id_cliente');

-- Para inventario.vehiculos
CREATE TRIGGER trg_inventario_vehiculos_audit 
AFTER INSERT OR UPDATE OR DELETE ON inventario.vehiculos
FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_tabla('id_vehiculo');

-- Para financiamiento.creditos
CREATE TRIGGER trg_financiamiento_creditos_audit 
AFTER INSERT OR UPDATE OR DELETE ON financiamiento.creditos
FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_tabla('id_credito');

-- Para ventas.contratos
CREATE TRIGGER trg_ventas_contratos_audit 
AFTER INSERT OR UPDATE OR DELETE ON ventas.contratos
FOR EACH ROW EXECUTE FUNCTION public.auditar_cambios_tabla('id_contrato');

-- ===============================================================
-- 9. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ===============================================================

-- 9.1 SCHEMA AUTENTICACION
CREATE INDEX idx_autenticacion_sesiones_usuario ON autenticacion.sesiones(id_usuario);
CREATE INDEX idx_autenticacion_sesiones_expiracion ON autenticacion.sesiones(fecha_expiracion);
CREATE INDEX idx_autenticacion_roles_permisos_rol ON autenticacion.roles_permisos(rol);

-- 9.2 SCHEMA CLIENTES
CREATE INDEX idx_clientes_direcciones_cliente ON clientes.direcciones(id_cliente);
CREATE INDEX idx_clientes_referencias_cliente ON clientes.referencias(id_cliente);
CREATE INDEX idx_clientes_interacciones_cliente ON clientes.interacciones(id_cliente);
CREATE INDEX idx_clientes_interacciones_usuario ON clientes.interacciones(id_usuario);
CREATE INDEX idx_clientes_interacciones_fecha ON clientes.interacciones(fecha);

-- 9.3 SCHEMA INVENTARIO
CREATE INDEX idx_inventario_vehiculos_marca_modelo_anio ON inventario.vehiculos(marca, modelo, anio);
CREATE INDEX idx_inventario_vehiculos_disponible ON inventario.vehiculos(disponible);
CREATE INDEX idx_inventario_vehiculos_condicion ON inventario.vehiculos(condicion);
CREATE INDEX idx_inventario_vehiculos_origen ON inventario.vehiculos(origen);
CREATE INDEX idx_inventario_vehiculos_fecha_creacion ON inventario.vehiculos(fecha_creacion);
CREATE INDEX idx_inventario_vehiculos_rango_precio ON inventario.vehiculos(precio_lista);
CREATE INDEX idx_inventario_imagenes_vehiculo_vehiculo ON inventario.imagenes_vehiculo(id_vehiculo);
CREATE INDEX idx_inventario_imagenes_vehiculo_principal ON inventario.imagenes_vehiculo(es_principal);
CREATE INDEX idx_inventario_caracteristicas_vehiculo_gin ON inventario.caracteristicas_vehiculo USING GIN (caracteristicas);
CREATE INDEX idx_inventario_historial_precios_vehiculo ON inventario.historial_precios(id_vehiculo);
CREATE INDEX idx_inventario_historial_precios_fecha_creacion ON inventario.historial_precios(fecha_creacion);

-- ===============================================================
-- 10. FINALIZACIÓN
-- ===============================================================

COMMIT;