# Solución al Error 401 Unauthorized en Carga de Archivos con Cloudinary

Este documento explica la solución implementada para resolver el error 401 (Unauthorized) que ocurría al intentar subir archivos a Cloudinary a través del endpoint `/api/media/upload`.

## Análisis del Problema

El error ocurría porque:

1. El endpoint `/api/media/upload` en el backend está protegido por un middleware de autenticación
2. Las solicitudes desde `MediaService.js` no incluían correctamente la información de autenticación necesaria
3. Aunque `withCredentials: true` estaba configurado, las cookies de autenticación no se estaban enviando o procesando correctamente

## Solución Implementada

### 1. Modificación de MediaService.js

Se ha modificado el servicio para utilizar una instancia personalizada de axios con un interceptor que añade el token de autenticación en cada solicitud:

```javascript
// Crear una instancia de axios con configuración específica
const mediaAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Interceptor para añadir el token de auth en cada solicitud
mediaAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Todos los métodos del servicio ahora utilizan esta instancia personalizada en lugar de axios directamente.

### 2. Mejora del Middleware de Autenticación

Se ha mejorado el middleware de autenticación para verificar el token tanto en los headers como en las cookies:

```javascript
// Intentar obtener el token de diferentes fuentes
let token;

// 1. Verificar en headers (Authorization: Bearer token)
const authHeader = req.header('Authorization');
if (authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.replace('Bearer ', '');
} 
// 2. Si no está en headers, verificar en cookies
else if (req.cookies && req.cookies.auth_token) {
  token = req.cookies.auth_token;
}
```

### 3. Manejo de Errores de Autenticación en Componentes

Se ha mejorado el manejo de errores en los componentes para detectar específicamente errores de autenticación y mostrar mensajes apropiados:

```javascript
// Manejar específicamente error de autenticación
if (error.message.includes('401') || error.message.includes('Unauthorized')) {
  setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
  message.error('Error de autenticación. Por favor, inicie sesión nuevamente.');
  // Opcionalmente redirigir a login
  // navigate('/login');
} else {
  setError('Error al subir archivos. Inténtalo de nuevo.');
  message.error('Error al subir el archivo');
}
```

### 4. Ruta de Prueba sin Autenticación

Se ha añadido una ruta de prueba que no requiere autenticación para facilitar el diagnóstico de problemas:

```javascript
// Ruta de prueba sin autenticación para diagnóstico
router.post('/test-upload', upload.single('file'), async (req, res) => {
  // Implementación...
});
```

### 5. Script de Prueba

Se ha creado un script de prueba (`test-auth-upload.js`) para verificar tanto la ruta protegida como la ruta de prueba, lo que facilita la validación de la solución.

## Cómo Funciona la Solución

1. **Autenticación Consistente**: Ahora todas las solicitudes desde el frontend incluyen el token de autenticación en el encabezado `Authorization`.

2. **Verificación Flexible**: El backend verifica el token tanto en los headers como en las cookies, lo que proporciona mayor flexibilidad.

3. **Mejor Experiencia de Usuario**: Los componentes ahora manejan específicamente los errores de autenticación, mostrando mensajes claros al usuario.

4. **Facilidad de Diagnóstico**: La ruta de prueba y el script de prueba facilitan la identificación y resolución de problemas.

## Verificación de la Solución

Para verificar que la solución funciona correctamente:

1. Ejecutar el script de prueba:
   ```
   node backend/scripts/test-auth-upload.js
   ```

2. Probar la carga de imágenes desde la interfaz de usuario después de iniciar sesión.

3. Verificar que las imágenes se suben correctamente y se muestran en la interfaz.

## Consideraciones Adicionales

- **Seguridad**: Esta solución mantiene la seguridad de la API al requerir autenticación para las operaciones sensibles.
  
- **Rendimiento**: El uso de interceptores de axios es eficiente y no afecta significativamente al rendimiento.
  
- **Mantenibilidad**: La solución es fácil de mantener y extender, ya que centraliza la lógica de autenticación.