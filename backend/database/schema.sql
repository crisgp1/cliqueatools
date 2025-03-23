-- ================================
-- Esquema de Base de Datos PostgreSQL para Simulador de Créditos Automotrices
-- Cliquéalo.mx
-- ================================

-- Eliminar tablas si existen (para poder ejecutar el script múltiples veces)
DROP TABLE IF EXISTS amortizacion_detalle;
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
    descripcion VARCHAR(255) NOT NULL,
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
-- Inserción de Datos Iniciales
-- ================================

-- Datos para la tabla banco
INSERT INTO banco (nombre, tasa_interes, cat, comision_apertura) VALUES
('BBVA', 12.5, 16.2, 2.0),
('Banorte', 13.2, 17.1, 1.8),
('Santander', 13.8, 17.5, 2.2),
('Scotiabank', 14.2, 18.3, 1.5),
('Citibanamex', 13.5, 17.8, 2.0),
('HSBC', 14.5, 18.9, 1.7),
('Inbursa', 12.8, 16.5, 1.9),
('Afirme', 14.8, 19.2, 2.1),
('BanRegio', 13.9, 18.0, 1.6);

-- ================================
-- Funciones y Triggers
-- ================================

-- Función para actualizar la fecha de actualización
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar la fecha_actualizacion
CREATE TRIGGER update_cliente_fecha_actualizacion
BEFORE UPDATE ON cliente
FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_vehiculo_fecha_actualizacion
BEFORE UPDATE ON vehiculo
FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_banco_fecha_actualizacion
BEFORE UPDATE ON banco
FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_credito_fecha_actualizacion
BEFORE UPDATE ON credito
FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion();

-- ================================
-- Índices
-- ================================

-- Índices para mejorar el rendimiento en búsquedas frecuentes
CREATE INDEX idx_cliente_nombre_apellidos ON cliente(nombre, apellidos);
CREATE INDEX idx_vehiculo_marca_modelo ON vehiculo(marca, modelo);
CREATE INDEX idx_credito_cliente_id ON credito(cliente_id);
CREATE INDEX idx_credito_banco_id ON credito(banco_id);
CREATE INDEX idx_amortizacion_credito_id ON amortizacion_detalle(credito_id);

-- ================================
-- Comentarios
-- ================================

COMMENT ON TABLE banco IS 'Catálogo de bancos y sus condiciones de financiamiento';
COMMENT ON TABLE cliente IS 'Datos del cliente que solicita la simulación o crédito';
COMMENT ON TABLE vehiculo IS 'Información de los vehículos a financiar';
COMMENT ON TABLE credito IS 'Detalles del crédito solicitado o simulado';
COMMENT ON TABLE credito_vehiculo IS 'Relación entre créditos y vehículos (un crédito puede incluir varios vehículos)';
COMMENT ON TABLE amortizacion_detalle IS 'Tabla de amortización con el detalle de cada pago mensual';

-- ================================
-- Funciones de utilidad
-- ================================

-- Función para generar tabla de amortización para un crédito
CREATE OR REPLACE FUNCTION generar_tabla_amortizacion(p_credito_id INTEGER)
RETURNS void AS $$
DECLARE
    v_credito RECORD;
    v_tasa_mensual NUMERIC;
    v_saldo_insoluto NUMERIC;
    v_fecha_pago DATE;
    v_pago_interes NUMERIC;
    v_pago_capital NUMERIC;
    v_num_pago INTEGER;
BEGIN
    -- Obtener datos del crédito
    SELECT * INTO v_credito FROM credito WHERE id = p_credito_id;
    
    -- Verificar que el crédito existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El crédito con ID % no existe', p_credito_id;
    END IF;
    
    -- Eliminar amortizaciones previas si existen
    DELETE FROM amortizacion_detalle WHERE credito_id = p_credito_id;
    
    -- Calcular tasa mensual
    v_tasa_mensual := (v_credito.tasa_interes / 100) / 12;
    
    -- Inicializar valores
    v_saldo_insoluto := v_credito.monto_financiado;
    v_fecha_pago := v_credito.fecha_solicitud + interval '1 month';
    
    -- Generar pagos
    FOR v_num_pago IN 1..v_credito.plazo_meses LOOP
        -- Calcular interés
        v_pago_interes := v_saldo_insoluto * v_tasa_mensual;
        
        -- Calcular abono a capital
        v_pago_capital := v_credito.pago_mensual - v_pago_interes;
        
        -- Calcular nuevo saldo
        v_saldo_insoluto := v_saldo_insoluto - v_pago_capital;
        IF v_saldo_insoluto < 0.01 THEN
            v_saldo_insoluto := 0;
        END IF;
        
        -- Insertar el detalle de la amortización
        INSERT INTO amortizacion_detalle (
            credito_id, 
            numero_pago, 
            fecha_pago, 
            pago_total, 
            pago_capital, 
            pago_interes, 
            saldo_insoluto
        ) VALUES (
            p_credito_id,
            v_num_pago,
            v_fecha_pago,
            v_credito.pago_mensual,
            v_pago_capital,
            v_pago_interes,
            v_saldo_insoluto
        );
        
        -- Incrementar fecha para el siguiente pago
        v_fecha_pago := v_fecha_pago + interval '1 month';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular pago mensual
CREATE OR REPLACE FUNCTION calcular_pago_mensual(
    p_monto NUMERIC,
    p_tasa_anual NUMERIC,
    p_plazo_meses INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    v_tasa_mensual NUMERIC;
    v_factor NUMERIC;
BEGIN
    v_tasa_mensual := (p_tasa_anual / 100) / 12;
    v_factor := POWER(1 + v_tasa_mensual, p_plazo_meses);
    
    RETURN (p_monto * v_tasa_mensual * v_factor) / (v_factor - 1);
END;
$$ LANGUAGE plpgsql;

-- ================================
-- Ejemplo de uso
-- ================================

/*
-- Crear un cliente
INSERT INTO cliente (nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigo_postal)
VALUES ('Juan', 'Pérez González', 'juan@ejemplo.com', '5512345678', 'PEGJ901231ABC', 'Calle Principal 123', 'Ciudad de México', '01234');

-- Crear dos vehículos
INSERT INTO vehiculo (descripcion, marca, modelo, anio, valor)
VALUES ('Sedán 4 puertas', 'Toyota', 'Corolla', 2023, 450000);

INSERT INTO vehiculo (descripcion, marca, modelo, anio, valor)
VALUES ('SUV', 'Honda', 'CR-V', 2022, 520000);

-- Crear un crédito con BBVA
INSERT INTO credito (
    cliente_id, banco_id, monto_total, porcentaje_enganche, monto_enganche, 
    monto_financiado, plazo_meses, tasa_interes, pago_mensual, cat, 
    comision_apertura, monto_total_pagar
)
SELECT 
    1, -- cliente_id
    1, -- banco_id (BBVA)
    970000, -- monto_total (suma de los dos vehículos)
    20, -- porcentaje_enganche
    194000, -- monto_enganche (20% de 970000)
    776000, -- monto_financiado
    36, -- plazo_meses
    b.tasa_interes, -- tasa del banco
    calcular_pago_mensual(776000, b.tasa_interes, 36), -- función para calcular pago mensual
    b.cat, -- CAT del banco
    776000 * (b.comision_apertura / 100), -- comisión de apertura
    calcular_pago_mensual(776000, b.tasa_interes, 36) * 36 -- monto total a pagar
FROM banco b
WHERE b.id = 1;

-- Asociar los vehículos al crédito
INSERT INTO credito_vehiculo (credito_id, vehiculo_id) VALUES (1, 1);
INSERT INTO credito_vehiculo (credito_id, vehiculo_id) VALUES (1, 2);

-- Generar tabla de amortización
SELECT generar_tabla_amortizacion(1);
*/