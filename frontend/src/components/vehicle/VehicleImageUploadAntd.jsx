import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Button, Card, Modal, Spin, Upload, 
  Space, Tooltip, Row, Col, message
} from 'antd';
import { 
  UploadOutlined, DeleteOutlined, StarOutlined, 
  StarFilled, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import * as MediaService from '../../services/MediaService';

const { Title, Text } = Typography;

/**
 * Componente para la carga y gestión de imágenes de vehículos
 * Versión con Ant Design (alternativa a Material UI)
 */
const VehicleImageUploadAntd = ({ vehiculoId, readOnly = false }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cargar archivos existentes
  const loadFiles = useCallback(async () => {
    if (!vehiculoId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const vehicleFiles = await MediaService.getVehicleFiles(vehiculoId);
      setFiles(vehicleFiles);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
      setError('No se pudieron cargar los archivos del vehículo');
      message.error('Error al cargar archivos del vehículo');
    } finally {
      setLoading(false);
    }
  }, [vehiculoId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Manejar subida de archivos
  const handleFileUpload = async ({ file }) => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const esPrincipal = files.length === 0; // Primera imagen como principal si no hay otras
      const orden = files.length;
      
      await MediaService.uploadFile(file, vehiculoId, esPrincipal, orden);
      
      // Recargar archivos después de subir
      await loadFiles();
      message.success('Archivo subido correctamente');
    } catch (error) {
      console.error('Error en carga de archivos:', error);
      setError('Error al subir archivos. Inténtalo de nuevo.');
      message.error('Error al subir el archivo');
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
    
    setLoading(true);
    setError(null);
    
    try {
      await MediaService.deleteFile(selectedFile.id_media);
      setFiles(files.filter(f => f.id_media !== selectedFile.id_media));
      setDeleteModalOpen(false);
      message.success('Archivo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      setError('Error al eliminar el archivo');
      message.error('Error al eliminar el archivo');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de imagen principal
  const handleSetPrincipal = async (file) => {
    if (file.es_principal) return; // Ya es principal
    
    setLoading(true);
    setError(null);
    
    try {
      await MediaService.updateFile(file.id_media, vehiculoId, { es_principal: true });
      // Actualizar estado local
      setFiles(files.map(f => ({
        ...f,
        es_principal: f.id_media === file.id_media
      })));
      message.success('Imagen principal actualizada');
    } catch (error) {
      console.error('Error al establecer imagen principal:', error);
      setError('Error al actualizar la imagen principal');
      message.error('Error al establecer la imagen principal');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de orden
  const handleReorder = async (file, direction) => {
    const currentIndex = files.findIndex(f => f.id_media === file.id_media);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === files.length - 1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetFile = files[targetIndex];
    
    setLoading(true);
    setError(null);
    
    try {
      // Intercambiar órdenes
      await MediaService.updateFile(file.id_media, vehiculoId, { orden: targetFile.orden });
      await MediaService.updateFile(targetFile.id_media, vehiculoId, { orden: file.orden });
      
      // Actualizar estado local
      const newFiles = [...files];
      [newFiles[currentIndex], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[currentIndex]];
      setFiles(newFiles);
      message.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al reordenar imágenes:', error);
      setError('Error al cambiar el orden de las imágenes');
      message.error('Error al reordenar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      <Title level={5}>Imágenes del Vehículo</Title>
      
      {error && (
        <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
          {error}
        </Text>
      )}
      
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Upload
            name="file"
            accept="image/*,video/*"
            showUploadList={false}
            customRequest={({ file }) => handleFileUpload({ file })}
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
      )}
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
          <Spin size="large" />
        </div>
      ) : files.length === 0 ? (
        <Text type="secondary" style={{ display: 'block', margin: '16px 0' }}>
          No hay imágenes disponibles para este vehículo.
        </Text>
      ) : (
        <Row gutter={[16, 16]}>
          {files.map((file) => (
            <Col xs={24} sm={12} md={8} key={file.id_media}>
              <Card 
                style={{ position: 'relative' }}
                bodyStyle={{ padding: 0 }}
                cover={
                  file.tipo_media === 'video' ? (
                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                      <video
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        src={file.url}
                        controls
                      />
                    </div>
                  ) : (
                    <img
                      alt={`Imagen ${file.orden + 1}`}
                      src={file.url}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  )
                }
                actions={!readOnly ? [
                  <Tooltip title={file.es_principal ? "Imagen principal" : "Establecer como principal"}>
                    {file.es_principal ? 
                      <StarFilled style={{ color: '#faad14' }} /> : 
                      <StarOutlined onClick={() => handleSetPrincipal(file)} />
                    }
                  </Tooltip>,
                  <Tooltip title="Mover arriba">
                    <ArrowUpOutlined 
                      onClick={() => handleReorder(file, 'up')}
                      style={{ color: files.indexOf(file) === 0 ? '#d9d9d9' : undefined }}
                    />
                  </Tooltip>,
                  <Tooltip title="Mover abajo">
                    <ArrowDownOutlined 
                      onClick={() => handleReorder(file, 'down')}
                      style={{ color: files.indexOf(file) === files.length - 1 ? '#d9d9d9' : undefined }}
                    />
                  </Tooltip>,
                  <Tooltip title="Eliminar">
                    <DeleteOutlined 
                      onClick={() => handleDeleteClick(file)}
                      style={{ color: '#ff4d4f' }}
                    />
                  </Tooltip>
                ] : undefined}
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

export default VehicleImageUploadAntd;