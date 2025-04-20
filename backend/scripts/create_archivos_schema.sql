-- Crear esquema de archivos
CREATE SCHEMA IF NOT EXISTS archivos;

-- Tabla principal de archivos multimedia
CREATE TABLE IF NOT EXISTS archivos.medias (
    id_media        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_media      VARCHAR(20) NOT NULL CHECK (tipo_media IN ('foto', 'video', 'raw')),
    public_id       VARCHAR(100) NOT NULL,
    url             VARCHAR(255) NOT NULL,
    formato         VARCHAR(20),
    tamano_bytes    INTEGER,
    ancho           INTEGER,
    alto            INTEGER,
    duracion        INTEGER,  -- Para videos (en segundos)
    metadata        JSONB,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_por      UUID REFERENCES autenticacion.usuarios(id_usuario)
);

-- Tabla de relación entre vehículos y archivos
CREATE TABLE IF NOT EXISTS archivos.vehiculo_medias (
    id_vehiculo     UUID NOT NULL REFERENCES inventario.vehiculos(id_vehiculo) ON DELETE CASCADE,
    id_media        UUID NOT NULL REFERENCES archivos.medias(id_media) ON DELETE CASCADE,
    es_principal    BOOLEAN NOT NULL DEFAULT false,
    orden           INTEGER NOT NULL DEFAULT 0,
    creado_por      UUID REFERENCES autenticacion.usuarios(id_usuario),
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_vehiculo, id_media)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_archivos_medias_tipo ON archivos.medias(tipo_media);
CREATE INDEX IF NOT EXISTS idx_archivos_medias_public_id ON archivos.medias(public_id);
CREATE INDEX IF NOT EXISTS idx_archivos_vehiculo_medias_vehiculo ON archivos.vehiculo_medias(id_vehiculo);
CREATE INDEX IF NOT EXISTS idx_archivos_vehiculo_medias_media ON archivos.vehiculo_medias(id_media);
CREATE INDEX IF NOT EXISTS idx_archivos_vehiculo_medias_principal ON archivos.vehiculo_medias(es_principal);

-- Comentarios para documentación
COMMENT ON SCHEMA archivos IS 'Esquema para gestión de archivos multimedia';
COMMENT ON TABLE archivos.medias IS 'Tabla principal de archivos multimedia (imágenes, videos)';
COMMENT ON TABLE archivos.vehiculo_medias IS 'Relación entre vehículos y archivos multimedia';