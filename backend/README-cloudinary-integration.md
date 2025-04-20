# Integración de Cloudinary en CliqueaTools

Este documento describe la integración de Cloudinary para la gestión de imágenes y videos de vehículos en el sistema CliqueaTools.

## Dependencias

Se han instalado las siguientes dependencias específicas para esta integración:

```bash
npm install cloudinary@2.35.0 multer@1.4.5-lts.1 fs-extra@11.1.1
```

| Dependencia | Versión | Descripción |
|-------------|---------|-------------|
| cloudinary | 2.35.0 | SDK oficial de Cloudinary para Node.js |
| multer | 1.4.5-lts.1 | Middleware para manejo de formularios multipart/form-data (subida de archivos) |
| fs-extra | 11.1.1 | Extensión de las funcionalidades de fs con soporte para promesas |

## Archivos Implementados

### Backend
- `config/cloudinary.js`: Configuración y funciones para interactuar con Cloudinary
- `controllers/mediasController.js`: Controlador para la API de medios
- `routes/mediaRoutes.js`: Rutas para la API de medios
- `scripts/create_archivos_schema.sql`: Script SQL para crear el esquema de archivos

### Frontend
- `src/services/MediaService.js`: Servicio para interactuar con la API de medios
- `src/components/vehicle/VehicleImageUpload.jsx`: Componente para la carga y gestión de imágenes
- Actualización de `src/components/vehicle/VehicleFormEdit.jsx` para integrar el componente de carga de imágenes

## Configuración

1. Se han agregado las variables de entorno de Cloudinary al archivo `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=cliqueatools
   CLOUDINARY_API_KEY=916231453571933
   CLOUDINARY_API_SECRET=juONTFLEVV6HxhxN3j2Y-fesZjs
   ```

2. Se han instalado las dependencias necesarias:
   ```
   npm install cloudinary multer fs-extra
   ```

## Creación del Esquema de Base de Datos

Para crear el esquema de archivos en la base de datos, ejecute el siguiente comando:

```bash
psql -U admin -d cliqueatools_qnqk -h dpg-cvo1ona4d50c739be9u0-a.oregon-postgres.render.com -f scripts/create_archivos_schema.sql
```

O conéctese a la base de datos y ejecute el script manualmente:

```bash
psql -U admin -d cliqueatools_qnqk -h dpg-cvo1ona4d50c739be9u0-a.oregon-postgres.render.com
```

Y luego:

```sql
\i scripts/create_archivos_schema.sql
```

## Funcionalidades Implementadas

1. **Subida de Imágenes y Videos**
   - Soporte para múltiples formatos (JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM)
   - Límite de tamaño de 10MB por archivo
   - Almacenamiento en Cloudinary con organización por vehículo

2. **Gestión de Imágenes**
   - Marcar imágenes como principales
   - Reordenar imágenes
   - Eliminar imágenes (con eliminación en cascada en la base de datos y en Cloudinary)

3. **Visualización**
   - Galería de imágenes en el formulario de edición de vehículos
   - Soporte para reproducción de videos

## Estructura de Datos

### Tabla `archivos.medias`
Almacena la información de los archivos multimedia:
- `id_media`: Identificador único (UUID)
- `tipo_media`: Tipo de archivo (foto, video, raw)
- `public_id`: ID público en Cloudinary
- `url`: URL del archivo en Cloudinary
- `formato`, `tamano_bytes`, `ancho`, `alto`, `duracion`: Metadatos del archivo
- `metadata`: Información adicional en formato JSON
- `fecha_creacion`, `creado_por`: Datos de auditoría

### Tabla `archivos.vehiculo_medias`
Relaciona los vehículos con sus archivos multimedia:
- `id_vehiculo`: Referencia al vehículo
- `id_media`: Referencia al archivo multimedia
- `es_principal`: Indica si es la imagen principal
- `orden`: Orden de visualización
- `creado_por`, `fecha_creacion`: Datos de auditoría

## Endpoints de la API

- `POST /api/media/upload`: Subir un archivo
- `GET /api/media/vehiculo/:id`: Obtener archivos de un vehículo
- `DELETE /api/media/:id`: Eliminar un archivo
- `PATCH /api/media/:id/vehiculo/:vehiculoId`: Actualizar propiedades de un archivo

## Notas Adicionales

- Los archivos se almacenan temporalmente en el servidor antes de subirse a Cloudinary
- Se ha implementado un sistema de transacciones para garantizar la integridad de los datos
- Las imágenes se organizan en Cloudinary por vehículo en la estructura `/vehiculos/{id_vehiculo}/`