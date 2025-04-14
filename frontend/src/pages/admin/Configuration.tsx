import React, { useState, useEffect } from 'react';
import {
  Box, Tab, Tabs, Typography, Paper, CircularProgress, Alert,
  Switch, FormControlLabel, Button, Snackbar, TextField
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import EmailIcon from '@mui/icons-material/Email';
import BuildIcon from '@mui/icons-material/Build';

import configService, { SystemConfig } from '../../services/configService';
import GeneralConfigForm from '../../components/admin/GeneralConfigForm';
import BackupRestoreForm from '../../components/admin/BackupRestoreForm';
import SmtpConfigForm from '../../components/admin/SmtpConfigForm';
import MaintenanceForm from '../../components/admin/MaintenanceForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `config-tab-${index}`,
    'aria-controls': `config-tabpanel-${index}`,
  };
}

const Configuration: React.FC = () => {
  const [value, setValue] = useState(0);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(localStorage.getItem('debug-mode') === 'true');

  // Estado para almacenar el error detallado
  const [detailedError, setDetailedError] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const configData = await configService.getSystemConfig();
      console.log('Configuración cargada:', configData);
      setConfig(configData);
    } catch (err: any) {
      console.error('Error al cargar la configuración:', err);
      setError('Error al cargar la configuración del sistema. Por favor, inténtelo de nuevo más tarde.');
      setDetailedError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleDebugModeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setDebugMode(enabled);
    configService.toggleDebugMode(enabled);
    
    // Recargar la configuración después de cambiar el modo
    if (enabled) {
      loadConfig();
    }
  };

  useEffect(() => {
    loadConfig();
    
    // Comprobar si hay errores almacenados en localStorage
    const savedError = localStorage.getItem('config-error');
    if (savedError) {
      try {
        setDetailedError(JSON.parse(savedError));
      } catch (e) {
        console.error('Error al parsear el error guardado:', e);
      }
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>

      {/* Panel de modo de depuración */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={debugMode}
                onChange={toggleDebugModeHandler}
                color="primary"
              />
            }
            label="Modo de depuración (usar datos simulados)"
          />
          {debugMode && (
            <Typography variant="body2" color="text.secondary">
              Modo de depuración activado: La aplicación simulará las respuestas del backend
            </Typography>
          )}
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {detailedError && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f8f8' }}>
              <Typography variant="subtitle2" gutterBottom>Detalles del error:</Typography>
              <Box component="pre" sx={{ 
                p: 2, 
                bgcolor: '#f0f0f0', 
                borderRadius: 1,
                overflowX: 'auto',
                fontSize: '0.8rem'
              }}>
                {JSON.stringify(detailedError, null, 2)}
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={loadConfig}
              >
                Reintentar
              </Button>
            </Paper>
          )}
        </>
      ) : config ? (
        <>
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={value} 
              onChange={handleTabChange} 
              aria-label="config tabs"
              variant="fullWidth"
            >
              <Tab icon={<SettingsIcon />} label="General" {...a11yProps(0)} />
              <Tab icon={<BackupIcon />} label="Backup y Restauración" {...a11yProps(1)} />
              <Tab icon={<EmailIcon />} label="Configuración SMTP" {...a11yProps(2)} />
              <Tab icon={<BuildIcon />} label="Mantenimiento" {...a11yProps(3)} />
            </Tabs>

            <TabPanel value={value} index={0}>
              <GeneralConfigForm 
                initialConfig={config}
                onSaveSuccess={() => handleSuccessMessage('Configuración general guardada con éxito')}
                onError={(msg) => setError(msg)}
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <BackupRestoreForm 
                onSuccessMessage={handleSuccessMessage}
                onError={(msg) => setError(msg)}
              />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <SmtpConfigForm 
                initialConfig={config}
                onSaveSuccess={() => handleSuccessMessage('Configuración SMTP guardada con éxito')}
                onError={(msg) => setError(msg)}
              />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <MaintenanceForm 
                onSuccessMessage={handleSuccessMessage}
                onError={(msg) => setError(msg)}
              />
            </TabPanel>
          </Paper>
        </>
      ) : null}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Box>
  );
};

export default Configuration; 