// ==========================================================================
// DATOS ORBET - MOTOR DE SINCRONIZACIÓN EN LA NUBE (CLOUD SYNC)
// Archivo: js/cloud-sync.js
// Sincroniza usuarios VIP y datos bancarios entre PC, GitHub Pages y teléfonos
// ==========================================================================

class CloudSync {
  static CLOUD_FILE_PATH = 'data/app_cloud_data.json';
  static STORAGE_KEY_LAST_SYNC = 'datos_orbet_last_cloud_sync';
  static STORAGE_KEY_REMOTE_ENDPOINT = 'datos_orbet_cloud_endpoint';

  /**
   * Inicializa la sincronización al abrir la aplicación
   */
  static async init() {
    try {
      await this.syncFromCloudFile();
    } catch (err) {
      console.warn('CloudSync: No se pudo sincronizar automáticamente con el archivo de nube:', err);
    }
  }

  /**
   * Intenta descargar el archivo data/app_cloud_data.json del repositorio / servidor
   */
  static async syncFromCloudFile() {
    const cacheBuster = '?t=' + Date.now();
    const candidateUrls = [];

    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin || '';
      const href = window.location.href.split('?')[0].split('#')[0];

      // 1. URL canónica de GitHub Pages
      candidateUrls.push(`https://osrovzlo-byte.github.io/DATOS-ORBET/${this.CLOUD_FILE_PATH}${cacheBuster}`);

      // 2. Resolver basePath normalizando barra final
      let baseDir = href;
      if (baseDir.endsWith('/index.html')) {
        baseDir = baseDir.substring(0, baseDir.lastIndexOf('/index.html') + 1);
      } else if (!baseDir.endsWith('/')) {
        baseDir = baseDir + '/';
      }
      candidateUrls.push(baseDir + this.CLOUD_FILE_PATH + cacheBuster);

      // 3. Resolución basada en pathname del host actual
      const pathParts = (window.location.pathname || '').split('/').filter(Boolean);
      if (pathParts.length > 0 && !pathParts[pathParts.length - 1].includes('.')) {
        candidateUrls.push(`${origin}/${pathParts.join('/')}/${this.CLOUD_FILE_PATH}${cacheBuster}`);
      } else if (pathParts.length > 1) {
        candidateUrls.push(`${origin}/${pathParts.slice(0, -1).join('/')}/${this.CLOUD_FILE_PATH}${cacheBuster}`);
      }

      // 4. Ruta relativa directa
      candidateUrls.push(`./${this.CLOUD_FILE_PATH}${cacheBuster}`);
      candidateUrls.push(`${this.CLOUD_FILE_PATH}${cacheBuster}`);
    } else {
      candidateUrls.push(this.CLOUD_FILE_PATH + cacheBuster);
    }

    // Filtrar URLs duplicadas
    const uniqueUrls = [...new Set(candidateUrls)];

    for (const testUrl of uniqueUrls) {
      try {
        const res = await fetch(testUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.users || data.settings)) {
            return this.applyCloudData(data);
          }
        }
      } catch (_) {
        // Probar siguiente URL candidata
      }
    }

    return false;
  }

  /**
   * Aplica los datos de la nube en la base de datos local del dispositivo
   */
  static applyCloudData(cloudData) {
    if (!cloudData) return false;
    let hasChanges = false;

    // 1. Sincronizar usuarios VIP
    if (Array.isArray(cloudData.users) && typeof AuthManager !== 'undefined') {
      const localUsers = AuthManager.getUsers();
      const deletedUsers = (typeof AuthManager.getDeletedUsers === 'function') 
        ? AuthManager.getDeletedUsers() 
        : [];
      let usersUpdated = false;

      cloudData.users.forEach(cUser => {
        if (!cUser || !cUser.username) return;
        const normName = AuthManager.normalizeText 
          ? AuthManager.normalizeText(cUser.username) 
          : String(cUser.username).trim().toLowerCase();

        // Si el usuario fue eliminado explícitamente en este dispositivo, NO recrearlo desde la nube
        if (deletedUsers.includes(normName)) {
          return;
        }

        const existingIdx = localUsers.findIndex(u => {
          const uNorm = AuthManager.normalizeText 
            ? AuthManager.normalizeText(u.username) 
            : String(u.username).trim().toLowerCase();
          return uNorm === normName;
        });

        if (existingIdx === -1) {
          // Usuario nuevo desde la nube: agregarlo
          localUsers.push({ ...cUser });
          usersUpdated = true;
          hasChanges = true;
        } else {
          // El usuario ya existe localmente: actualizar datos clave respetando su dispositivo vinculado si ya tenía uno
          const local = localUsers[existingIdx];
          const shouldUpdate = local.password !== cUser.password || 
                              local.status !== cUser.status || 
                              local.expiresAt !== cUser.expiresAt;

          if (shouldUpdate) {
            localUsers[existingIdx] = {
              ...cUser,
              dispositivo_vinculado: (local.dispositivo_vinculado !== undefined && local.dispositivo_vinculado !== null) 
                ? local.dispositivo_vinculado 
                : (cUser.dispositivo_vinculado || null)
            };
            usersUpdated = true;
            hasChanges = true;
          }
        }
      });

      if (usersUpdated) {
        AuthManager.saveUsers(localUsers);
      }
    }

    // 2. Sincronizar configuración bancaria y pagos
    if (cloudData.settings && typeof DatosOrbetDB !== 'undefined') {
      const current = DatosOrbetDB.getSettings();
      const newSettings = {
        ...current,
        ...cloudData.settings,
        payments: {
          ...current.payments,
          ...(cloudData.settings.payments || {})
        },
        whatsapp: {
          ...current.whatsapp,
          ...(cloudData.settings.whatsapp || {})
        }
      };

      DatosOrbetDB.saveSettings(newSettings);
      hasChanges = true;
    }

    if (hasChanges) {
      localStorage.setItem(this.STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      // Refrescar vistas en vivo si la UI ya fue cargada
      if (typeof loadAppSettings === 'function') loadAppSettings();
      if (typeof PlaySafeEngine !== 'undefined' && PlaySafeEngine.updatePaymentInfoCard) {
        PlaySafeEngine.updatePaymentInfoCard();
      }
      if (typeof AuthManager !== 'undefined' && typeof renderUsersTable === 'function') {
        renderUsersTable();
      }
    }

    return true;
  }

  /**
   * Genera el objeto JSON consolidado con los usuarios y ajustes actuales para respaldar en la nube
   */
  static generateCurrentCloudPayload() {
    const users = (typeof AuthManager !== 'undefined') ? AuthManager.getUsers() : [];
    const settings = (typeof DatosOrbetDB !== 'undefined') ? DatosOrbetDB.getSettings() : {};

    return {
      version: "1.0",
      lastUpdated: new Date().toISOString(),
      updatedBy: (typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser()) 
        ? AuthManager.getCurrentUser().username 
        : "admin",
      settings: settings,
      users: users
    };
  }

  /**
   * Descarga el archivo app_cloud_data.json para que el administrador lo guarde en su carpeta /data
   */
  static downloadCloudDataFile() {
    const payload = this.generateCurrentCloudPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app_cloud_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('✅ Archivo app_cloud_data.json generado. Reemplácelo en la carpeta /data de su proyecto.');
    }
  }

  /**
   * Copia al portapapeles el JSON consolidado
   */
  static copyCloudDataJson() {
    const payload = this.generateCurrentCloudPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    if (typeof PaymentsAndWhatsApp !== 'undefined') {
      PaymentsAndWhatsApp.copyText(jsonStr, 'JSON de Configuración Nube');
    }
  }
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.CloudSync = CloudSync;
}
