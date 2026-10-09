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
  firebase.initializeApp(firebaseConfig);
}

class CloudSync {
  static STORAGE_KEY_LAST_SYNC = 'datos_orbet_last_cloud_sync';
  static isSyncing = false;

  static async init() {
    if (typeof firebase === 'undefined') {
      console.warn("Firebase no cargado, saltando sync");
      return;
    }
    const db = firebase.firestore();
    
    // 1. Escuchar configuraciones globales
    db.collection('appData').doc('globalSettings').onSnapshot(doc => {
      if (doc.exists) {
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
    });

    // 2. Escuchar cambios de Usuarios
    db.collection('users').onSnapshot(snapshot => {
      if (typeof AuthManager === 'undefined') return;
      const cloudUsers = [];
      snapshot.forEach(doc => cloudUsers.push(doc.data()));
      this.applyCloudUsers(cloudUsers);
    });
    
    this.interceptAuthManager(db);
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
      this.originalSaveUsers.call(AuthManager, localUsers);
      localStorage.setItem(this.STORAGE_KEY_LAST_SYNC, new Date().toISOString());
      if (typeof renderUsersTable === 'function') renderUsersTable();
    }
    
    this.isSyncing = false;
    return true;
  }

  static interceptAuthManager(db) {
    if (this.originalSaveUsers) return;
    this.originalSaveUsers = AuthManager.saveUsers;
    
    AuthManager.saveUsers = (users) => {
      this.originalSaveUsers.call(AuthManager, users);
      if (this.isSyncing) return;
      
      const batch = db.batch();
      users.forEach(u => {
        const docId = AuthManager.normalizeText(u.username);
        const docRef = db.collection('users').doc(docId);
        batch.set(docRef, u, { merge: true });
      });
      batch.commit().catch(err => console.error("Error Firebase:", err));
    };
  }

  static async syncFromCloudFile() { return true; }

  static downloadCloudDataFile() {
    const users = AuthManager.getUsers();
    AuthManager.saveUsers(users); // Dispara el trigger a Firebase
    
    if (typeof firebase !== 'undefined') {
      const db = firebase.firestore();
      const settings = typeof DatosOrbetDB !== 'undefined' ? DatosOrbetDB.getSettings() : {};
      db.collection('appData').doc('globalSettings').set({ settings }, { merge: true })
        .then(() => {
          if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
            PaymentsAndWhatsApp.showToast('✅ Sincronizado con Firebase correctamente.');
          }
        });
    }
  }

  static copyCloudDataJson() {
    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('ℹ️ Con Firebase la sincronización es automática.');
    }
  }
}

if (typeof window !== 'undefined') window.CloudSync = CloudSync;
