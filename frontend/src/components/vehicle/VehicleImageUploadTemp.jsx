import React, { useState } from 'react';
import { 
  Typography, Button, Card, Spin, Upload, 
  message, Row, Col, Modal, Tooltip
} from 'antd';
import { 
  UploadOutlined, DeleteOutlined, StarOutlined, 
  StarFilled, PictureOutlined
} from '@ant-design/icons';
import * as MediaService from '../../services/MediaService';
import { uploadFileTest } from '../../services/MediaService';

const { Title, Text } = Typography;

/**
 * Componente para la carga temporal de imágenes antes de crear un vehículo
 * Similar a la experiencia de Marketplace de Facebook
 */
const VehicleImageUploadTemp = ({ onImagesChange }) => {
  const [tempFiles, setTempFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Manejar subida de archivos
  const handleFileUpload = async ({ file }) => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Probar primero con la ruta de test sin autenticación
      console.log('Intentando subida de prueba...');
      try {
        const testResult = await uploadFileTest(file);
        console.log('Prueba de diagnóstico exitosa:', testResult);
      } catch (testError) {
        console.warn('Error en prueba de diagnóstico, continuando con flujo normal:', testError);
      }
      
      const esPrincipal = tempFiles.length === 0; // Primera imagen como principal
      const orden = tempFiles.length;
      
      // Asegurar que se envíen strings para es_principal y orden
      const esPrincipalStr = esPrincipal.toString();
      const ordenStr = orden.toString();
      
      console.log('Enviando archivo a servidor:', { file, esPrincipal: esPrincipalStr, orden: ordenStr });
      
      // Subir archivo sin ID de vehículo (se guarda en carpeta temporal)
      const uploadedFile = await MediaService.uploadFile(file, null, esPrincipal, orden);
      
      console.log('Archivo subido:', uploadedFile);
      
      // Agregar archivo a la lista temporal asegurando que tenga las propiedades correctas
      const newFile = {
        ...uploadedFile,
        id: uploadedFile.id,
        id_media: uploadedFile.id_media || uploadedFile.id, // Asegurar compatibilidad
        es_principal: esPrincipal,
        orden: orden
      };
      
      const newFiles = [...tempFiles, newFile];
      
      setTempFiles(newFiles);
      
      // Notificar al componente padre sobre el cambio en las imágenes
      if (onImagesChange) {
        onImagesChange(newFiles);
      }
      
      message.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error detallado en carga de archivos:', error);
      
      // Manejo mejorado de errores
      if (error.response) {
        // Error con respuesta del servidor
        console.error('Error del servidor:', error.response.data);
        
        if (error.response.status === 401) {
          setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
          message.error('Error de autenticación. Por favor, inicie sesión nuevamente.');
          // Opcionalmente redirigir a login
          // navigate('/login');
        } else if (error.response.status === 500) {
          setError(`Error del servidor: ${error.response.data?.message || 'Error interno'}`);
          message.error('Error del servidor al procesar la imagen');
        } else {
          setError(`Error (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
          message.error(`Error (${error.response.status}): ${error.response.data?.message || 'Error desconocido'}`);
        }
      } else if (error.request) {
        // Error sin respuesta del servidor
        setError('Error de conexión. Verifica tu conexión a internet.');
        message.error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        // Error en la configuración de la petición
        setError(`Error al subir archivo: ${error.message}`);
        message.error(`Error al subir archivo: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Manejar eliminación de archivos
  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;
    
    try {
      // Usar id_media para eliminar el archivo
      await MediaService.deleteFile(selectedFile.id_media || selectedFile.id);
      
      // Filtrar usando la propiedad correcta
      const updatedFiles = tempFiles.filter(f => (f.id_media || f.id) !== (selectedFile.id_media || selectedFile.id));
      setTempFiles(updatedFiles);
      setDeleteModalOpen(false);
      
      // Notificar al componente padre sobre el cambio en las imágenes
      if (onImagesChange) {
        onImagesChange(updatedFiles);
      }
      
      message.success('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      
      // Manejar específicamente error de autenticación
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
        message.error('Error de autenticación. Por favor, inicie sesión nuevamente.');
      } else {
        setError('Error al eliminar el archivo');
        message.error('Error al eliminar el archivo');
      }
    }
  };

  // Manejar cambio de imagen principal
  const handleSetPrincipal = async (file) => {
    if (file.es_principal) return; // Ya es principal
    
    // Actualizar localmente usando la propiedad correcta (id o id_media)
    const fileId = file.id_media || file.id;
    const updatedFiles = tempFiles.map(f => ({
      ...f,
      es_principal: (f.id_media || f.id) === fileId
    }));
    
    setTempFiles(updatedFiles);
    
    // Notificar al componente padre sobre el cambio en las imágenes
    if (onImagesChange) {
      onImagesChange(updatedFiles);
    }
    
    message.success('Imagen principal actualizada');
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Title level={5} className="m-0">Imágenes del Vehículo</Title>
        <Upload
          name="file"
          accept="image/*"
          showUploadList={false}
          customRequest={handleFileUpload}
          disabled={uploading}
        >
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            type="primary"
          >
            {uploading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        </Upload>
      </div>
      
      {error && (
        <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
          {error}
        </Text>
      )}
      
      {tempFiles.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-gray-50">
          <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p className="mt-2 text-gray-500">
            Sube imágenes de tu vehículo para mostrar su estado y características
          </p>
          <p className="text-gray-400 text-sm">
            Formatos aceptados: JPG, PNG, GIF, WebP
          </p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {tempFiles.map((file) => (
            <Col xs={24} sm={12} md={8} key={file.id_media || file.id}>
              <Card
                style={{ position: 'relative' }}
                bodyStyle={{ padding: 0 }}
                cover={
                  <img
                    alt={`Imagen ${file.orden + 1}`}
                    src={file.url}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Tooltip title={file.es_principal ? "Imagen principal" : "Establecer como principal"}>
                    {file.es_principal ?
                      <StarFilled style={{ color: '#faad14' }} /> :
                      <StarOutlined onClick={() => handleSetPrincipal(file)} />
                    }
                  </Tooltip>,
                  <Tooltip title="Eliminar">
                    <DeleteOutlined
                      onClick={() => handleDeleteClick(file)}
                      style={{ color: '#ff4d4f' }}
                    />
                  </Tooltip>
                ]}
              >
                {file.es_principal && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '0 8px',
                    borderRadius: '0 4px 0 0'
                  }}>
                    Principal
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Modal de confirmación para eliminar */}
      <Modal
        title="Confirmar Eliminación"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <p>¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default VehicleImageUploadTemp;