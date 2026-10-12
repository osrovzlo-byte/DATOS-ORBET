const firebaseConfig = {
  apiKey: "AIzaSyDHPq4tnjz6SXN_gnqfiHjwENQkd7CZPbU",
  authDomain: "datos-orbet.firebaseapp.com",
  projectId: "datos-orbet",
  storageBucket: "datos-orbet.firebasestorage.app",
  messagingSenderId: "753839707861",
  appId: "1:753839707861:web:82c0e1ca399093b779b45c",
  measurementId: "G-Q3X9HYK89N"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase init error:", e);
  }
}

class CloudSync {
  static CLOUD_FILE_PATH = 'data/app_cloud_data.json';
  static STORAGE_KEY_LAST_SYNC = 'datos_orbet_last_cloud_sync';
  static isSyncing = false;
  static originalSaveUsers = null;

  /**
   * Inicializa la sincronización: primero desde el archivo GitHub (100% confiable)
   * y luego activa Firebase en tiempo real si está disponible.
   */
  static async init() {
    try {
      await this.syncFromCloudFile();
    } catch (err) {
      console.warn('CloudSync: Error al sincronizar desde archivo JSON:', err);
    }

    this.initFirebase();
  }

  /**
   * Descarga data/app_cloud_data.json desde GitHub Pages con anti-caché
   */
  static async syncFromCloudFile() {
    const cacheBuster = '?t=' + Date.now();
    const candidateUrls = [];

    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin || '';
      const href = window.location.href.split('?')[0].split('#')[0];

      // 1. URL canónica de GitHub Pages
      candidateUrls.push(https://osrovzlo-byte.github.io/DATOS-ORBET/);

      // 2. BasePath normalizado
      let baseDir = href;
      if (baseDir.endsWith('/index.html')) {
        baseDir = baseDir.substring(0, baseDir.lastIndexOf('/index.html') + 1);
      } else if (!baseDir.endsWith('/')) {
        baseDir = baseDir + '/';
      }
      candidateUrls.push(baseDir + this.CLOUD_FILE_PATH + cacheBuster);

      // 3. Resolución basada en pathname
      const pathParts = (window.location.pathname || '').split('/').filter(Boolean);
      if (pathParts.length > 0 && !pathParts[pathParts.length - 1].includes('.')) {
        candidateUrls.push(${origin}//);
      } else if (pathParts.length > 1) {
        candidateUrls.push(${origin}//);
      }

      // 4. Rutas relativas
      candidateUrls.push(./);
      candidateUrls.push(${this.CLOUD_FILE_PATH});
    } else {
      candidateUrls.push(this.CLOUD_FILE_PATH + cacheBuster);
    }

    const uniqueUrls = [...new Set(candidateUrls)];

    for (const testUrl of uniqueUrls) {
      try {
        const res = await fetch(testUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.users || data.settings)) {
            console.log('✅ Datos cargados con éxito desde:', testUrl);
            return this.applyCloudData(data);
          }
        }
      } catch (_) {}
    }

    return false;
  }

  /**
   * Aplica los datos descargados del JSON a la base de datos local
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

        if (deletedUsers.includes(normName)) return;

        const existingIdx = localUsers.findIndex(u => {
          const uNorm = AuthManager.normalizeText 
            ? AuthManager.normalizeText(u.username) 
            : String(u.username).trim().toLowerCase();
          return uNorm === normName;
        });

        if (existingIdx === -1) {
          localUsers.push({ ...cUser });
          usersUpdated = true;
          hasChanges = true;
        } else {
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
        this.saveUsersSafe(localUsers);
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
   * Guarda usuarios en localStorage evitando bucles infinitos con Firebase
   */
  static saveUsersSafe(users) {
    if (this.originalSaveUsers) {
      this.originalSaveUsers.call(AuthManager, users);
    } else if (typeof AuthManager !== 'undefined') {
      AuthManager.saveUsers(users);
    }
  }

  /**
   * Configura listeners en tiempo real de Firebase con manejo de excepciones (por si las reglas de seguridad están bloqueadas)
   */
  static initFirebase() {
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;

    try {
      const db = firebase.firestore();

      // Escuchar configuraciones globales
      db.collection('appData').doc('globalSettings').onSnapshot(doc => {
        if (doc && doc.exists) {
          const data = doc.data();
          if (data && data.settings && typeof DatosOrbetDB !== 'undefined') {
            const current = DatosOrbetDB.getSettings();
            const newSettings = {
              ...current,
              ...data.settings,
              payments: { ...(current.payments || {}), ...(data.settings.payments || {}) },
              whatsapp: { ...(current.whatsapp || {}), ...(data.settings.whatsapp || {}) }
            };
            DatosOrbetDB.saveSettings(newSettings);
            if (typeof loadAppSettings === 'function') loadAppSettings();
            if (typeof PlaySafeEngine !== 'undefined' && PlaySafeEngine.updatePaymentInfoCard) {
              PlaySafeEngine.updatePaymentInfoCard();
            }
          }
        }
      }, err => {
        console.warn('Firebase globalSettings (Permiso o regla pendiente en Firestore):', err.message);
      });

      // Escuchar usuarios en tiempo real
      db.collection('users').onSnapshot(snapshot => {
        if (typeof AuthManager === 'undefined' || !snapshot) return;
        const cloudUsers = [];
        snapshot.forEach(doc => cloudUsers.push(doc.data()));
        if (cloudUsers.length > 0) {
          this.applyCloudUsers(cloudUsers);
        }
      }, err => {
        console.warn('Firebase users (Permiso o regla pendiente en Firestore):', err.message);
      });

      this.interceptAuthManager(db);
    } catch (e) {
      console.warn('Error conectando a Firebase:', e);
    }
  }

  static applyCloudUsers(cloudUsers) {
    if (!cloudUsers || cloudUsers.length === 0) return false;
    this.isSyncing = true;
    
    const localUsers = AuthManager.getUsers();
    let hasChanges = false;

    cloudUsers.forEach(cUser => {
      if (!cUser || !cUser.username) return;
      const normName = AuthManager.normalizeText(cUser.username);
      const existingIdx = localUsers.findIndex(u => AuthManager.normalizeText(u.username) === normName);

      if (existingIdx === -1) {
        localUsers.push({ ...cUser });
        hasChanges = true;
      } else {
        const local = localUsers[existingIdx];
        const shouldUpdate = local.password !== cUser.password || 
                             local.status !== cUser.status || 
                             local.expiresAt !== cUser.expiresAt ||
                             local.dispositivo_vinculado !== cUser.dispositivo_vinculado;

        if (shouldUpdate) {
          localUsers[existingIdx] = {
            ...cUser,
            dispositivo_vinculado: cUser.dispositivo_vinculado !== undefined ? cUser.dispositivo_vinculado : local.dispositivo_vinculado
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      this.saveUsersSafe(localUsers);
      localStorage.setItem(this.STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      if (typeof renderUsersTable === 'function') renderUsersTable();
    }
    
    this.isSyncing = false;
    return true;
  }

  static interceptAuthManager(db) {
    if (this.originalSaveUsers || typeof AuthManager === 'undefined') return;
    this.originalSaveUsers = AuthManager.saveUsers;
    
    AuthManager.saveUsers = (users) => {
      this.originalSaveUsers.call(AuthManager, users);
      if (this.isSyncing) return;
      
      try {
        const batch = db.batch();
        users.forEach(u => {
          const docId = AuthManager.normalizeText(u.username);
          const docRef = db.collection('users').doc(docId);
          batch.set(docRef, u, { merge: true });
        });
        batch.commit().catch(err => console.warn('Firebase batch warning:', err.message));
      } catch (_) {}
    };
  }

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
   * Descarga el archivo JSON app_cloud_data.json y además replica a Firebase si está activo
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

    // Intentar sincronizar con Firebase en segundo plano si las credenciales están activas
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
      try {
        const db = firebase.firestore();
        const settings = typeof DatosOrbetDB !== 'undefined' ? DatosOrbetDB.getSettings() : {};
        db.collection('appData').doc('globalSettings').set({ settings }, { merge: true }).catch(() => {});
        
        const users = (typeof AuthManager !== 'undefined') ? AuthManager.getUsers() : [];
        const batch = db.batch();
        users.forEach(u => {
          const docId = AuthManager.normalizeText(u.username);
          const docRef = db.collection('users').doc(docId);
          batch.set(docRef, u, { merge: true });
        });
        batch.commit().catch(() => {});
      } catch (_) {}
    }

    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('✅ Archivo app_cloud_data.json descargado. Reemplácelo en la carpeta /data de GitHub.');
    }
  }

  static copyCloudDataJson() {
    const payload = this.generateCurrentCloudPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    if (typeof PaymentsAndWhatsApp !== 'undefined') {
      PaymentsAndWhatsApp.copyText(jsonStr, 'JSON de Configuración Nube');
    }
  }
}

if (typeof window !== 'undefined') window.CloudSync = CloudSync;
