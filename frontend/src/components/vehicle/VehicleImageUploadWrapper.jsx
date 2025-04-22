/**
 * Wrapper para el componente de carga de imágenes
 * Permite cambiar fácilmente entre la versión de Material UI y Ant Design
 *
 * Este wrapper fue creado para resolver problemas de compatibilidad con Material UI
 * y proporcionar una alternativa usando Ant Design que ya está instalado en el proyecto.
 *
 * Para cambiar entre versiones, simplemente modifica la constante USE_ANTD.
 */

// Importar ambas versiones del componente
import VehicleImageUploadMUI from './VehicleImageUpload';
import VehicleImageUploadAntd from './VehicleImageUploadAntd';

/**
 * Configuración para elegir qué versión del componente usar
 *
 * - true: Usa la versión de Ant Design (recomendado si Material UI no está instalado)
 * - false: Usa la versión de Material UI (requiere @mui/material y @mui/icons-material)
 *
 * Si necesitas usar Material UI, instala las dependencias con:
 * npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
 */
const USE_ANTD = true;

// Exportar el componente seleccionado
const VehicleImageUpload = USE_ANTD ? VehicleImageUploadAntd : VehicleImageUploadMUI;

export default VehicleImageUpload;