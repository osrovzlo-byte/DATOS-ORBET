// ==========================================================================
// DATOS ORBET - SINCRONIZACIÓN EN LA NUBE
// Fuente principal: data/app_cloud_data.json (GitHub Pages)
// Complemento opcional: Firebase Firestore (si las reglas lo permiten)
// Archivo: js/cloud-sync.js
// ==========================================================================

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
    console.warn('Firebase init error:', e);
  }
}

class CloudSync {
  static CLOUD_FILE_PATH = 'data/app_cloud_data.json';
  static CANONICAL_BASE = 'https://osrovzlo-byte.github.io/DATOS-ORBET/';
  static STORAGE_KEY_LAST_SYNC = 'datos_orbet_last_cloud_sync';
  static isSyncing = false;
  static originalSaveUsers = null;

  /**
   * Inicializa la sincronización: primero desde el JSON de GitHub (fuente principal)
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
   * Construye la lista de URLs candidatas para el archivo JSON (con anti-caché)
   */
  static buildCandidateUrls() {
    const cacheBuster = '?t=' + Date.now();
    const path = this.CLOUD_FILE_PATH;
    const urls = [];

    // 1. URL canónica de GitHub Pages
    urls.push(this.CANONICAL_BASE + path + cacheBuster);

    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin || '';
      const href = window.location.href.split('?')[0].split('#')[0];

      // 2. Directorio base de la página actual
      let baseDir = href;
      if (baseDir.endsWith('/index.html')) {
        baseDir = baseDir.substring(0, baseDir.lastIndexOf('/index.html') + 1);
      } else if (!baseDir.endsWith('/')) {
        baseDir = baseDir + '/';
      }
      urls.push(baseDir + path + cacheBuster);

      // 3. Resolución basada en pathname
      const parts = (window.location.pathname || '').split('/').filter(Boolean);
      if (parts.length > 0 && !parts[parts.length - 1].includes('.')) {
        urls.push(origin + '/' + parts.join('/') + '/' + path + cacheBuster);
      } else if (parts.length > 1) {
        urls.push(origin + '/' + parts.slice(0, -1).join('/') + '/' + path + cacheBuster);
      }
    }

    // 4. Rutas relativas
    urls.push('./' + path + cacheBuster);
    urls.push(path + cacheBuster);

    return [...new Set(urls)];
  }

  /**
   * Descarga data/app_cloud_data.json y aplica los datos localmente
   */
  static async syncFromCloudFile() {
    const urls = this.buildCandidateUrls();
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.users || data.settings)) {
            console.log('CloudSync: datos cargados desde', url);
            return this.applyCloudData(data);
          }
        }
      } catch (_) {
        // Probar la siguiente URL
      }
    }
    return false;
  }

  /**
   * Aplica los datos descargados del JSON a la base de datos local
   */
  static applyCloudData(cloudData) {
    if (!cloudData) return false;
    let hasChanges = false;

    // 1. Usuarios VIP (Sincronización fidedigna con la nube)
    if (Array.isArray(cloudData.users) && typeof AuthManager !== 'undefined') {
      const localUsers = AuthManager.getUsers();
      const localMap = new Map();
      localUsers.forEach(u => {
        if (u && u.username) {
          localMap.set(AuthManager.normalizeText(u.username), u);
        }
      });

      // La nube es la fuente autorizada de qué usuarios existen
      const updatedUsers = cloudData.users.map(cUser => {
        if (!cUser || !cUser.username) return null;
        const norm = AuthManager.normalizeText(cUser.username);
        const local = localMap.get(norm);
        return {
          ...cUser,
          // Conservar dispositivo vinculado local si la nube no tiene uno o si ya estaba vinculado localmente
          dispositivo_vinculado: (local && local.dispositivo_vinculado)
            ? local.dispositivo_vinculado
            : (cUser.dispositivo_vinculado || null),
          lastLoginAt: (local && local.lastLoginAt) ? local.lastLoginAt : (cUser.lastLoginAt || null)
        };
      }).filter(Boolean);

      // Asegurar que el administrador principal siempre exista
      const hasAdmin = updatedUsers.some(u => AuthManager.normalizeText(u.username) === 'admin');
      if (!hasAdmin) {
        const localAdmin = localMap.get('admin') || AuthManager.INITIAL_DEFAULT_USERS[0];
        updatedUsers.unshift(localAdmin);
      }

      // Comprobar si hubo cambios respecto a la lista local
      const isDifferent = updatedUsers.length !== localUsers.length ||
        updatedUsers.some((u, i) => {
          const l = localUsers[i];
          if (!l) return true;
          return u.username !== l.username ||
                 u.password !== l.password ||
                 u.status !== l.status ||
                 u.expiresAt !== l.expiresAt ||
                 u.dispositivo_vinculado !== l.dispositivo_vinculado;
        });

      if (isDifferent) {
        this.saveUsersSafe(updatedUsers);
        hasChanges = true;
      }
    }

    // 2. Configuración bancaria y pagos
    if (cloudData.settings && typeof DatosOrbetDB !== 'undefined') {
      const current = DatosOrbetDB.getSettings();
      const newSettings = {
        ...current,
        ...cloudData.settings,
        payments: { ...(current.payments || {}), ...(cloudData.settings.payments || {}) },
        whatsapp: { ...(current.whatsapp || {}), ...(cloudData.settings.whatsapp || {}) }
      };
      DatosOrbetDB.saveSettings(newSettings);
      hasChanges = true;
    }

    if (hasChanges) {
      localStorage.setItem(this.STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      this.refreshUI();
    }
    return true;
  }

  /**
   * Refresca las vistas que dependen de usuarios/ajustes
   */
  static refreshUI() {
    try { if (typeof loadAppSettings === 'function') loadAppSettings(); } catch (_) {}
    try {
      if (typeof PlaySafeEngine !== 'undefined' && PlaySafeEngine.updatePaymentInfoCard) {
        PlaySafeEngine.updatePaymentInfoCard();
      }
    } catch (_) {}
    try { if (typeof renderUsersListUI === 'function') renderUsersListUI(); } catch (_) {}
  }

  /**
   * Guarda usuarios en localStorage sin re-disparar la subida a Firebase
   */
  static saveUsersSafe(users) {
    if (this.originalSaveUsers) {
      this.originalSaveUsers.call(AuthManager, users);
    } else if (typeof AuthManager !== 'undefined') {
      AuthManager.saveUsers(users);
    }
  }

  /**
   * Listeners de Firebase en tiempo real (tolerante a reglas de seguridad bloqueadas)
   */
  static initFirebase() {
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;

    try {
      const db = firebase.firestore();

      db.collection('appData').doc('globalSettings').onSnapshot(doc => {
        if (doc && doc.exists) {
          const data = doc.data();
          if (data && data.settings) {
            this.applyCloudData({ settings: data.settings });
          }
        }
      }, err => {
        console.warn('Firebase globalSettings no disponible:', err.message);
      });

      db.collection('users').onSnapshot(snapshot => {
        if (typeof AuthManager === 'undefined' || !snapshot) return;
        const cloudUsers = [];
        snapshot.forEach(doc => cloudUsers.push(doc.data()));
        if (cloudUsers.length > 0) {
          this.isSyncing = true;
          this.applyCloudData({ users: cloudUsers });
          this.isSyncing = false;
        }
      }, err => {
        console.warn('Firebase users no disponible:', err.message);
      });

      this.interceptAuthManager(db);
    } catch (e) {
      console.warn('Error conectando a Firebase:', e);
    }
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
          const docRef = db.collection('users').doc(AuthManager.normalizeText(u.username));
          batch.set(docRef, u, { merge: true });
        });
        batch.commit().catch(err => console.warn('Firebase batch:', err.message));
      } catch (_) {}
    };
  }

  static generateCurrentCloudPayload() {
    const users = (typeof AuthManager !== 'undefined') ? AuthManager.getUsers() : [];
    const settings = (typeof DatosOrbetDB !== 'undefined') ? DatosOrbetDB.getSettings() : {};
    const current = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;

    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      updatedBy: current ? current.username : 'admin',
      settings: settings,
      users: users
    };
  }

  /**
   * Descarga app_cloud_data.json para subirlo a la carpeta /data de GitHub
   */
  static downloadCloudDataFile() {
    const jsonStr = JSON.stringify(this.generateCurrentCloudPayload(), null, 2);
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
      PaymentsAndWhatsApp.showToast('✅ app_cloud_data.json descargado. Súbalo a la carpeta /data de GitHub.');
    }
  }

  static copyCloudDataJson() {
    const jsonStr = JSON.stringify(this.generateCurrentCloudPayload(), null, 2);
    if (typeof PaymentsAndWhatsApp !== 'undefined') {
      PaymentsAndWhatsApp.copyText(jsonStr, 'JSON de Configuración Nube');
    }
  }
}

if (typeof window !== 'undefined') {
  window.CloudSync = CloudSync;
}
