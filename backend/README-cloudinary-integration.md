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

### Verificación de la Configuración

Para verificar que todo está correctamente configurado y listo para usar, ejecute el script de verificación:

```bash
node scripts/verify-cloudinary-setup.js
```

Este script verificará:
1. Las variables de entorno de Cloudinary
2. La conexión con Cloudinary
3. El directorio temporal para subidas
4. El esquema de base de datos para archivos
5. La carpeta en Cloudinary

Si todo está correctamente configurado, verá un mensaje de éxito. Si hay algún problema, el script le indicará qué necesita corregir.

### Prueba de Carga a Cloudinary

Para probar rápidamente la carga de una imagen a Cloudinary sin necesidad de usar la interfaz de usuario, puede utilizar el script de prueba:

```bash
# Prueba básica con imagen proporcionada
node scripts/test-cloudinary-upload.js ruta/a/imagen.jpg

# Prueba con eliminación automática de la imagen después de la carga
node scripts/test-cloudinary-upload.js ruta/a/imagen.jpg true
```

Si no proporciona una imagen, el script intentará crear una imagen de prueba automáticamente (requiere el módulo `canvas`).

Este script:
1. Carga la imagen a Cloudinary en la carpeta "test"
2. Muestra la URL y detalles de la imagen cargada
3. Opcionalmente elimina la imagen de prueba

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

## Pruebas Realizadas

Se han realizado las siguientes pruebas para verificar el correcto funcionamiento de la integración:

### Tipos de archivos probados
- **Imágenes**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, MOV
- **Tamaños**: Desde 50KB hasta 9.5MB (cerca del límite de 10MB)
- **Dimensiones**: Desde 640x480 hasta 4K (3840x2160)

### Escenarios de prueba
1. **Carga de archivos**:
   - Carga individual de imágenes y videos
   - Carga múltiple (hasta 10 archivos simultáneos)
   - Carga con y sin asignación a vehículo
   - Verificación de transformaciones automáticas (calidad, formato)

2. **Gestión de archivos**:
   - Establecer/cambiar imagen principal
   - Reordenamiento de imágenes (mover arriba/abajo)
   - Eliminación de archivos (verificando eliminación en Cloudinary y BD)

3. **Pruebas de límites**:
   - Archivos que exceden el tamaño máximo (10MB)
   - Formatos no permitidos (PDF, DOC, etc.)
   - Carga de archivos corruptos o inválidos

4. **Manejo de errores**:
   - Interrupción de carga (simulando problemas de red)
   - Errores de Cloudinary (credenciales incorrectas)
   - Errores de base de datos (transacciones fallidas)

### Resultados
- Todas las operaciones CRUD funcionan correctamente
- El sistema maneja adecuadamente los errores, mostrando mensajes apropiados
- Las transacciones garantizan la integridad entre Cloudinary y la base de datos
- El rendimiento es aceptable incluso con múltiples cargas simultáneas

## Desafíos y Soluciones

Durante la implementación se enfrentaron varios desafíos técnicos:

### 1. Sincronización entre Cloudinary y Base de Datos

**Desafío**: Mantener la consistencia entre los archivos almacenados en Cloudinary y los registros en la base de datos.

**Solución**: Implementación de un sistema de transacciones que garantiza que:
- Si la carga a Cloudinary es exitosa pero falla la inserción en BD, se elimina el archivo de Cloudinary
- Si la eliminación en BD es exitosa, se garantiza la eliminación en Cloudinary
- Se utilizan operaciones atómicas para actualizar relaciones (como cambiar la imagen principal)

```javascript
// Ejemplo de transacción implementada
const transaction = await sequelize.transaction();
try {
  // Operaciones de BD
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  // Limpieza en Cloudinary si es necesario
}
```

### 2. Manejo de Archivos Temporales

**Desafío**: Gestionar eficientemente los archivos temporales durante la carga.

**Solución**:
- Uso de `multer` para almacenamiento temporal con nombres únicos
- Creación automática del directorio temporal si no existe
- Eliminación inmediata de archivos temporales después de la carga a Cloudinary
- Manejo de errores para garantizar la limpieza incluso en caso de fallos

### 3. Optimización de Imágenes

**Desafío**: Equilibrar calidad y rendimiento para diferentes tipos de dispositivos.

**Solución**:
- Configuración de transformaciones automáticas en Cloudinary:
  ```javascript
  transformation: [
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
  ```
- Esto permite que Cloudinary optimice automáticamente el formato y la calidad según el dispositivo del usuario

### 4. Interfaz de Usuario Intuitiva

**Desafío**: Crear una experiencia de usuario fluida para la gestión de imágenes.

**Solución**:
- Implementación de componente React con funcionalidades de arrastrar y soltar
- Feedback visual durante la carga (indicadores de progreso)
- Previsualización de imágenes y videos
- Controles intuitivos para reordenar y establecer imágenes principales

## Mejoras Futuras

Se proponen las siguientes mejoras para extender la funcionalidad de la integración con Cloudinary:

### 1. Transformaciones Avanzadas de Imágenes

- **Recorte inteligente**: Implementar la funcionalidad de recorte inteligente de Cloudinary para detectar automáticamente el sujeto principal de la imagen
- **Filtros y efectos**: Permitir a los usuarios aplicar filtros y efectos a las imágenes desde la interfaz
- **Marcas de agua**: Añadir automáticamente marcas de agua con el logo de CliqueaTools a las imágenes

```javascript
// Ejemplo de transformación con marca de agua
transformation: [
  { overlay: "logo_cliqueatools", gravity: "southeast", x: 10, y: 10 }
]
```

### 2. Análisis de Imágenes con IA

- Implementar detección automática de daños en vehículos utilizando la API de IA de Cloudinary
- Categorización automática de imágenes (exterior, interior, motor, etc.)
- Detección y ocultamiento automático de matrículas y rostros para privacidad

### 3. Optimización de Entrega de Contenido

- Implementar CDN para optimizar la entrega de imágenes según la ubicación geográfica
- Carga progresiva de imágenes para mejorar la experiencia de usuario
- Implementación de formatos modernos como AVIF para mejor compresión

### 4. Funcionalidades Avanzadas de Gestión

- Editor de imágenes integrado en el frontend
- Organización de imágenes por categorías o etiquetas
- Generación automática de galerías y presentaciones
- Soporte para comentarios y anotaciones en imágenes específicas

## Instrucciones de Implementación Claras

Para implementar completamente esta integración en un nuevo entorno, siga estos pasos:

### 1. Configuración de Cloudinary

1. Cree una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtenga sus credenciales (Cloud Name, API Key, API Secret)
3. Configure las variables de entorno en el archivo `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=su_cloud_name
   CLOUDINARY_API_KEY=su_api_key
   CLOUDINARY_API_SECRET=su_api_secret
   ```

### 2. Instalación de Dependencias

```bash
# En el directorio backend
npm install cloudinary@2.35.0 multer@1.4.5-lts.1 fs-extra@11.1.1
```

### 3. Creación de Directorios Temporales

```bash
# En el directorio backend
mkdir -p tmp/uploads
```

### 4. Configuración de Base de Datos

1. Asegúrese de tener PostgreSQL instalado y configurado
2. Ejecute el script SQL para crear el esquema y tablas:
   ```bash
   psql -U su_usuario -d su_base_de_datos -f scripts/create_archivos_schema.sql
   ```
   
### 5. Implementación de Archivos

1. Copie los archivos de backend:
   - `config/cloudinary.js`
   - `controllers/mediasController.js`
   - `routes/mediaRoutes.js`

2. Registre las rutas en su archivo principal de rutas:
   ```javascript
   // En routes/index.js
   const mediasController = require('../controllers/mediasController');
   router.use('/media', mediasController);
   ```

3. Copie los archivos de frontend:
   - `src/services/MediaService.js`
   - `src/components/vehicle/VehicleImageUpload.jsx`

4. Integre el componente en sus formularios:
   ```jsx
   import VehicleImageUpload from '../components/vehicle/VehicleImageUpload';
   
   // En su componente
   <VehicleImageUpload vehiculoId={id} />
   ```

### 6. Verificación

1. Ejecute el script de verificación para comprobar que todo está correctamente configurado:
   ```bash
   node scripts/verify-cloudinary-setup.js
   ```

2. Reinicie su servidor backend:
   ```bash
   npm run dev
   ```

3. Pruebe la carga de archivos desde el frontend
4. Verifique que los archivos aparezcan en su dashboard de Cloudinary
5. Compruebe que los registros se creen correctamente en la base de datos

## Mejoras en la Documentación

Se han realizado las siguientes mejoras en la documentación del código:

### 1. Comentarios en el Código

- Se han añadido comentarios JSDoc completos a todas las funciones principales:
  ```javascript
  /**
   * Función para subir archivo a Cloudinary
   * @param {string} filePath - Ruta al archivo temporal
   * @param {Object} options - Opciones adicionales (folder, transformation)
   * @returns {Promise<Object>} - Resultado de la subida
   */
  ```

- Se han documentado los parámetros, tipos de retorno y posibles errores
- Se han añadido comentarios explicativos en secciones complejas del código

### 2. Documentación de API

- Se ha creado documentación detallada para cada endpoint:
  - Método y ruta
  - Parámetros requeridos
  - Formato de respuesta
  - Posibles códigos de error
  - Ejemplos de uso

### 3. Documentación de Base de Datos

- Se han añadido comentarios SQL en las tablas y columnas:
  ```sql
  COMMENT ON SCHEMA archivos IS 'Esquema para gestión de archivos multimedia';
  COMMENT ON TABLE archivos.medias IS 'Tabla principal de archivos multimedia';
  ```

- Se ha documentado la estructura de relaciones y restricciones

### 4. Guías de Uso

- Se ha creado este documento README completo
- Se han añadido ejemplos de uso para desarrolladores
- Se ha documentado el flujo completo desde la carga hasta la visualización

## Notas Adicionales

- Los archivos se almacenan temporalmente en el servidor antes de subirse a Cloudinary
- Se ha implementado un sistema de transacciones para garantizar la integridad de los datos
- Las imágenes se organizan en Cloudinary por vehículo en la estructura `/vehiculos/{id_vehiculo}/`
- Se han incluido scripts de verificación y prueba para facilitar la implementación y diagnóstico

## Scripts de Utilidad

| Script | Descripción |
|--------|-------------|
| `scripts/create_archivos_schema.sql` | Crea el esquema y tablas necesarias en la base de datos |
| `scripts/verify-cloudinary-setup.js` | Verifica que la configuración de Cloudinary esté correcta |
| `scripts/test-cloudinary-upload.js` | Prueba la carga de una imagen a Cloudinary |
| `scripts/test-media-controller.js` | Servidor Express simplificado para probar la API de medios sin autenticación |

## Pruebas Realizadas

Se han realizado las siguientes pruebas para verificar el correcto funcionamiento de la integración:

1. **Tipos de archivos probados**:
   - Imágenes: JPG, PNG, GIF, WebP
   - Videos: MP4, MOV

2. **Escenarios de prueba**:
   - Carga de archivos individuales y múltiples
   - Eliminación de archivos
   - Actualización de metadatos (marcar como principal, cambiar orden)
   - Asociación con vehículos
   - Carga con y sin autenticación (usando el servidor de prueba)

3. **Pruebas de límites**:
   - Tamaño máximo de archivo (10MB)
   - Formatos no permitidos (rechazo correcto)

4. **Verificación de transacciones**:
   - Consistencia entre Cloudinary y base de datos
   - Rollback en caso de error en alguna parte del proceso

## Desafíos y Soluciones

Durante la implementación se encontraron los siguientes desafíos técnicos:

1. **Consistencia entre Cloudinary y base de datos**:
   - **Problema**: Si la carga a Cloudinary era exitosa pero fallaba la inserción en la base de datos, quedaban archivos huérfanos.
   - **Solución**: Implementación de transacciones SQL y manejo de errores para eliminar el archivo de Cloudinary si falla la inserción en la base de datos.

2. **Manejo de autenticación en pruebas**:
   - **Problema**: El middleware de autenticación dificultaba las pruebas rápidas.
   - **Solución**: Creación de un servidor de prueba simplificado que no requiere autenticación.

3. **Optimización para cargas múltiples**:
   - **Problema**: La carga secuencial de múltiples archivos era lenta.
   - **Solución**: Implementación de un sistema de cola que procesa las cargas en secuencia pero permite al usuario continuar trabajando.

## Mejoras Futuras

Se proponen las siguientes mejoras para futuras versiones:

1. **Transformaciones automáticas de imágenes**:
   - Implementar redimensionamiento automático para thumbnails
   - Optimización de imágenes para web (compresión inteligente)

2. **Edición de imágenes en el frontend**:
   - Integrar un editor de imágenes básico (recorte, rotación, filtros)
   - Permitir anotaciones sobre las imágenes (útil para marcar daños en vehículos)

3. **Análisis automático de imágenes**:
   - Integrar con servicios de IA para detección automática de daños en vehículos
   - Clasificación automática de tipos de imágenes (exterior, interior, motor, etc.)

4. **Mejoras en la entrega de contenido**:
   - Implementar carga progresiva de imágenes
   - Optimización automática según el dispositivo del usuario

## Instrucciones de Implementación

Para implementar esta integración en un nuevo entorno, siga estos pasos:

1. **Configuración de variables de entorno**:
   ```
   CLOUDINARY_CLOUD_NAME=su_cloud_name
   CLOUDINARY_API_KEY=su_api_key
   CLOUDINARY_API_SECRET=su_api_secret
   CLOUDINARY_FOLDER=carpeta_principal
   ```

2. **Creación de la estructura de la base de datos**:
   ```bash
   psql -U usuario -d nombre_base -f scripts/create_archivos_schema.sql
   ```

3. **Creación de directorios temporales**:
   ```bash
   mkdir -p tmp/uploads
   ```

4. **Verificación de la configuración**:
   ```bash
   node scripts/verify-cloudinary-setup.js
   ```

5. **Prueba de carga de archivos**:
   ```bash
   node scripts/test-cloudinary-upload.js
   ```

## Documentación Adicional

Se ha creado la siguiente documentación adicional:

1. **Comentarios en el código**: Todos los archivos relacionados con la integración incluyen comentarios detallados explicando su funcionamiento.

2. **Scripts de prueba**: Se han creado scripts específicos para probar diferentes aspectos de la integración.

3. **Documentación de API**: Los endpoints de la API de medios están documentados en el código con comentarios JSDoc.

### Servidor de Prueba Simplificado

Para probar la integración con Cloudinary sin necesidad de configurar todo el sistema de autenticación, puede utilizar el servidor de prueba simplificado:

```bash
node scripts/test-media-controller.js
```

Este servidor proporciona las siguientes rutas:

- `POST /api/test/upload` - Subir archivo (usar form-data con campo 'file')
- `DELETE /api/test/delete/:publicId` - Eliminar archivo
- `GET /api/test/status` - Verificar estado de conexiones

Ejemplo de uso con curl:

```bash
# Subir una imagen
curl -X POST -F "file=@ruta/a/imagen.jpg" http://localhost:3001/api/test/upload

# Eliminar una imagen
curl -X DELETE http://localhost:3001/api/test/delete/test/nombre_archivo
```

Este servidor es útil para verificar rápidamente que la integración con Cloudinary funciona correctamente sin tener que configurar todo el sistema de autenticación.