import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, CircularProgress, Card, CardMedia,
  IconButton, Grid, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon
} from '@mui/icons-material';
import * as MediaService from '../../services/MediaService';

const VehicleImageUpload = ({ vehiculoId, readOnly = false }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    } finally {
      setLoading(false);
    }
  }, [vehiculoId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Manejar subida de archivos
  const handleFileUpload = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles.length) return;
    
    setUploading(true);
    setError(null);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const esPrincipal = files.length === 0 && i === 0; // Primera imagen como principal si no hay otras
        const orden = files.length + i;
        
        await MediaService.uploadFile(file, vehiculoId, esPrincipal, orden);
      }
      
      // Recargar archivos después de subir
      await loadFiles();
    } catch (error) {
      console.error('Error en carga de archivos:', error);
      setError('Error al subir archivos. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  // Manejar eliminación de archivos
  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await MediaService.deleteFile(selectedFile.id_media);
      setFiles(files.filter(f => f.id_media !== selectedFile.id_media));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      setError('Error al eliminar el archivo');
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
    } catch (error) {
      console.error('Error al establecer imagen principal:', error);
      setError('Error al actualizar la imagen principal');
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
    } catch (error) {
      console.error('Error al reordenar imágenes:', error);
      setError('Error al cambiar el orden de las imágenes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Imágenes del Vehículo
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {!readOnly && (
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*,video/*"
            style={{ display: 'none' }}
            id="upload-file-button"
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="upload-file-button">
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            </Button>
          </label>
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : files.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ my: 2 }}>
          No hay imágenes disponibles para este vehículo.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id_media}>
              <Card sx={{ position: 'relative' }}>
                {file.tipo_media === 'video' ? (
                  <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                    <Box
                      component="video"
                      sx={{
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
                  </Box>
                ) : (
                  <CardMedia
                    component="img"
                    image={file.url}
                    alt={`Imagen ${file.orden + 1}`}
                    sx={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                
                {!readOnly && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    borderRadius: '0 0 0 8px'
                  }}>
                    <Tooltip title={file.es_principal ? "Imagen principal" : "Establecer como principal"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleSetPrincipal(file)}
                        color={file.es_principal ? "warning" : "default"}
                      >
                        {file.es_principal ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Mover arriba">
                      <IconButton 
                        size="small" 
                        onClick={() => handleReorder(file, 'up')}
                        disabled={files.indexOf(file) === 0}
                      >
                        <MoveUpIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Mover abajo">
                      <IconButton 
                        size="small" 
                        onClick={() => handleReorder(file, 'down')}
                        disabled={files.indexOf(file) === files.length - 1}
                      >
                        <MoveDownIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(file)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                {file.es_principal && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    px: 1,
                    borderRadius: '0 4px 0 0'
                  }}>
                    Principal
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleImageUpload;