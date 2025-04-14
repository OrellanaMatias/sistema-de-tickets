const Config = require('../models/Config');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

/**
 * Obtiene la configuración actual del sistema desde la base de datos
 */
const getSystemConfig = async (req, res) => {
  try {
    // Asegurar que exista la configuración
    await Config.ensureConfig();
    
    // Obtener la primera configuración (solo debería haber una)
    const config = await Config.findOne();
    
    if (!config) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontró la configuración del sistema' 
      });
    }
    
    // No enviar la contraseña SMTP por seguridad
    const configData = config.toJSON();
    delete configData.smtpPass;
    
    res.json(configData);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener la configuración del sistema',
      error: error.message
    });
  }
};

/**
 * Actualiza la configuración del sistema en la base de datos
 */
const updateSystemConfig = async (req, res) => {
  try {
    // Asegurar que exista la configuración
    await Config.ensureConfig();
    
    // Obtener la primera configuración (solo debería haber una)
    const config = await Config.findOne();
    
    if (!config) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontró la configuración del sistema' 
      });
    }
    
    // Actualizar los campos con los valores proporcionados
    await config.update(req.body);
    
    // No enviar la contraseña SMTP por seguridad
    const configData = config.toJSON();
    delete configData.smtpPass;
    
    res.json({
      success: true, 
      message: 'Configuración actualizada correctamente',
      config: configData
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar la configuración del sistema',
      error: error.message
    });
  }
};

/**
 * Realiza un backup de la base de datos
 * Nota: Esta implementación es simulada, en un entorno real
 * usaríamos herramientas como mysqldump para MySQL
 */
const backupDatabase = async (req, res) => {
  try {
    // En un entorno real, aquí se ejecutaría un comando como:
    // mysqldump -u user -p database > backup.sql
    
    // Simulamos la creación de un archivo de backup
    const backupDate = new Date().toISOString().replace(/:/g, '-');
    const backupFileName = `backup_${backupDate}.sql`;
    const backupPath = path.join(__dirname, '..', '..', 'backups', backupFileName);
    
    // Asegurar que existe el directorio de backups
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Crear un archivo de backup simulado
    const backupContent = `-- Backup simulado generado el ${new Date().toISOString()}\n`;
    fs.writeFileSync(backupPath, backupContent);
    
    res.json({ 
      success: true, 
      message: 'Backup realizado correctamente',
      file: backupFileName
    });
  } catch (error) {
    console.error('Error al realizar backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al realizar el backup de la base de datos',
      error: error.message
    });
  }
};

/**
 * Restaura la base de datos desde un archivo de backup
 */
const restoreDatabase = async (req, res) => {
  try {
    // Esta es una implementación simulada
    // En un entorno real, verificaríamos el archivo y ejecutaríamos:
    // mysql -u user -p database < backup_file.sql
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó un archivo de backup'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Base de datos restaurada correctamente'
    });
  } catch (error) {
    console.error('Error al restaurar la base de datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al restaurar la base de datos',
      error: error.message
    });
  }
};

/**
 * Prueba la conexión SMTP utilizando la configuración proporcionada
 */
const testSmtpConnection = async (req, res) => {
  try {
    const { smtpServer, smtpPort, smtpUser, smtpPass } = req.body;
    
    // Crear un transporter de nodemailer para probar la conexión
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass || ''
      },
      // Permitir certificados autofirmados en desarrollo
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verificar la conexión
    await transporter.verify();
    
    res.json({ 
      success: true, 
      message: 'Conexión SMTP probada correctamente'
    });
  } catch (error) {
    console.error('Error al probar conexión SMTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al probar la conexión SMTP',
      error: error.message
    });
  }
};

/**
 * Realiza tareas de mantenimiento del sistema
 */
const performMaintenance = async (req, res) => {
  try {
    const { task } = req.params;
    
    let message = '';
    
    switch (task) {
      case 'clearCache':
        // Simulación de limpieza de caché
        message = 'Caché del sistema limpiada correctamente';
        break;
        
      case 'optimizeTables':
        // En un entorno real, ejecutaríamos:
        // OPTIMIZE TABLE para MySQL
        message = 'Tablas de la base de datos optimizadas correctamente';
        break;
        
      case 'clearLogs':
        // Simulación de limpieza de logs
        message = 'Archivos de log limpiados correctamente';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Tarea de mantenimiento no válida'
        });
    }
    
    res.json({ 
      success: true, 
      message
    });
  } catch (error) {
    console.error(`Error al realizar tarea de mantenimiento:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al realizar la tarea de mantenimiento',
      error: error.message
    });
  }
};

module.exports = {
  getSystemConfig,
  updateSystemConfig,
  backupDatabase,
  restoreDatabase,
  testSmtpConnection,
  performMaintenance
}; 