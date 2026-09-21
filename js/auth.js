// ==========================================================================
// DATOS ORBET - MÓDULO DE AUTENTICACIÓN, CONTROL VIP Y RESTRICCIÓN DE IP
// Archivo: js/auth.js
// ==========================================================================

class AuthManager {
  static SESSION_KEY = 'datos_orbet_auth_session_v1';
  static CREDENTIALS_KEY = 'datos_orbet_credentials_v1';
  static USERS_KEY = 'datos_orbet_users_v2';
  static DELETED_USERS_KEY = 'datos_orbet_deleted_users_v1';
  static DEVICE_KEY = 'datos_orbet_device_v1';
  static cachedIp = null;
  static ipFetchPromise = null;

  /**
   * Normaliza cadenas para comparación insensible a mayúsculas, minúsculas, acentos y espacios
   */
  static normalizeText(str) {
    return String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  /**
   * Obtiene la lista de nombres de usuarios eliminados explícitamente para evitar su re-creación automática
   */
  static getDeletedUsers() {
    try {
      const raw = localStorage.getItem(this.DELETED_USERS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * Registra un usuario en la lista de eliminados permanentes
   */
  static addDeletedUser(username) {
    const norm = this.normalizeText(username);
    if (!norm || norm === 'admin') return;
    const deleted = this.getDeletedUsers();
    if (!deleted.includes(norm)) {
      deleted.push(norm);
      localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(deleted));
    }
  }

  /**
   * Remueve un usuario de la lista de eliminados si el administrador decide crearlo de nuevo
   */
  static unmarkDeletedUser(username) {
    const norm = this.normalizeText(username);
    if (!norm) return;
    const deleted = this.getDeletedUsers().filter(n => n !== norm);
    localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(deleted));
  }

  /**
   * Obtiene la sesión actual
   */
  static getCurrentUser() {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  static getTodayDateStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calcula una fecha futura en formato YYYY-MM-DD sumando días
   */
  static addDaysToDate(dateStr, days) {
    let baseDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    if (isNaN(baseDate.getTime())) baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + Number(days));
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtiene un identificador persistente de dispositivo / huella local
   */
  static getDeviceIdentifier() {
    let devId = localStorage.getItem(this.DEVICE_KEY);
    if (!devId) {
      devId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(this.DEVICE_KEY, devId);
    }
    return devId;
  }

  /**
   * Detecta la IP pública del usuario con timeout rápido y respaldo seguro
   */
  static async getClientIP(forceRefresh = false) {
    if (!forceRefresh && this.cachedIp) return this.cachedIp;
    if (this.ipFetchPromise && !forceRefresh) return this.ipFetchPromise;

    this.ipFetchPromise = (async () => {
      // Función auxiliar con timeout configurado (2500ms)
      const fetchFastIp = async (url, jsonKey = 'ip') => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data[jsonKey]) {
              return String(data[jsonKey]).trim();
            }
          }
        } catch (_) {}
        return null;
      };

      const fetchTextIp = async (url) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timeoutId);
          if (res.ok) {
            const text = (await res.text()).trim();
            if (text && /^[\d\.:a-fA-F]+$/.test(text)) {
              return text;
            }
          }
        } catch (_) {}
        return null;
      };

      // Consultar múltiples proveedores en paralelo para máxima velocidad y fiabilidad
      try {
        const ipResults = await Promise.allSettled([
          fetchFastIp('https://api.ipify.org?format=json', 'ip'),
          fetchFastIp('https://api64.ipify.org?format=json', 'ip'),
          fetchFastIp('https://api.ip.sb/jsonip', 'ip'),
          fetchFastIp('https://api.my-ip.io/v2/ip.json', 'ip'),
          fetchFastIp('https://ipwho.is/', 'ip'),
          fetchFastIp('https://ipapi.co/json/', 'ip'),
          fetchTextIp('https://icanhazip.com')
        ]);

        for (const r of ipResults) {
          if (r.status === 'fulfilled' && r.value) {
            this.cachedIp = r.value;
            return this.cachedIp;
          }
        }
      } catch (_) {}

      // Respaldo de red local si se accede desde IP de red LAN (ej: 172.16.0.49)
      if (typeof window !== 'undefined' && window.location && window.location.hostname && 
          window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const lanIp = 'LAN-' + window.location.hostname;
        this.cachedIp = lanIp;
        return lanIp;
      }

      // Respaldo de dispositivo único si no hay internet
      const fallbackId = 'DISP-' + this.getDeviceIdentifier().substring(0, 12);
      this.cachedIp = fallbackId;
      return fallbackId;
    })();

    const result = await this.ipFetchPromise;
    this.ipFetchPromise = null;
    return result;
  }

  /**
   * Comprueba suscripciones vencidas y resetea automáticamente la contraseña a 'orbet2026'
   */
  static checkExpirations() {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) return [];

    let users = [];
    try {
      users = JSON.parse(raw);
    } catch (e) {
      return [];
    }

    if (!Array.isArray(users)) return [];

    const today = this.getTodayDateStr();
    let hasChanged = false;
    const expiredUsers = [];

    users.forEach(user => {
      // La cuenta maestra de administrador nunca vence
      if (this.normalizeText(user.username) === 'admin' || user.role === 'admin') {
        return;
      }

      // Comprobar si tiene fecha de vencimiento y si ya expiró
      if (user.expiresAt && today > user.expiresAt) {
        const wasActive = (user.status === 'active');
        const hadCustomPass = (user.password !== 'orbet2026');

        if (wasActive || hadCustomPass) {
          user.status = 'inactive';
          user.password = 'orbet2026'; // RESET AUTOMÁTICO REQUERIDO
          user.expiredAtNotice = today;
          hasChanged = true;
          expiredUsers.push(user.username);
        }
      }
    });

    if (hasChanged) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    return expiredUsers;
  }

  /**
   * Usuarios iniciales del sistema
   */
  static INITIAL_DEFAULT_USERS = [
    {
      id: 'usr_admin_master',
      username: 'admin',
      password: 'orbet2026',
      name: 'Administrador Principal',
      role: 'admin',
      status: 'active',
      expiresAt: '2099-12-31',
      registeredIp: null,
      createdAt: '2026-09-01'
    },
    {
      id: 'usr_jesus_vip',
      username: 'JESUS',
      password: '12345',
      name: 'JESUS / RECEPTOR',
      role: 'vip',
      status: 'active',
      expiresAt: '2026-10-21',
      registeredIp: null,
      createdAt: '2026-09-21'
    }
  ];

  /**
   * Obtiene la lista completa de usuarios VIP y administradores
   */
  static getUsers() {
    this.checkExpirations();

    const raw = localStorage.getItem(this.USERS_KEY);
    const deletedUsers = this.getDeletedUsers();
    let users = [];
    if (raw) {
      try {
        users = JSON.parse(raw);
      } catch (e) {
        users = [];
      }
    }

    if (!Array.isArray(users) || users.length === 0) {
      // Filtrar aquellos que hayan sido eliminados explícitamente
      users = this.INITIAL_DEFAULT_USERS
        .filter(defUser => !deletedUsers.includes(this.normalizeText(defUser.username)))
        .map(u => ({ ...u }));
      this.saveUsers(users);
      return users;
    }

    // Filtrar usuarios borrados que pudieran haber quedado en la lista por error
    if (deletedUsers.length > 0) {
      const filtered = users.filter(u => !deletedUsers.includes(this.normalizeText(u.username)));
      if (filtered.length !== users.length) {
        users = filtered;
        this.saveUsers(users);
      }
    }

    // Asegurar que el usuario maestro admin siempre exista
    const hasAdmin = users.some(u => this.normalizeText(u.username) === 'admin');
    if (!hasAdmin) {
      users.unshift({ ...this.INITIAL_DEFAULT_USERS[0] });
      this.saveUsers(users);
    }

    return users;
  }

  /**
   * Guarda la lista de usuarios en localStorage
   */
  static saveUsers(users) {
    if (!Array.isArray(users)) return;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Agrega un nuevo usuario VIP con fecha de suscripción y control de IP
   */
  static addUser(username, password, name = '', role = 'vip', expiresAt = null) {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();
    const cleanName = String(name || '').trim() || cleanUser;

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'El usuario y la contraseña son obligatorios.' };
    }

    if (cleanUser.length < 3) {
      return { success: false, message: 'El usuario debe tener al menos 3 caracteres.' };
    }

    const norm = this.normalizeText(cleanUser);
    const users = this.getUsers();
    const exists = users.some(u => this.normalizeText(u.username) === norm);
    if (exists) {
      return { success: false, message: `El usuario "${cleanUser}" ya existe. Elija otro nombre.` };
    }

    // Si había sido eliminado anteriormente, rehabilitar en lista de eliminados
    this.unmarkDeletedUser(cleanUser);

    // Por defecto 30 días de suscripción si no se especifica
    const expiryDate = expiresAt || this.addDaysToDate(this.getTodayDateStr(), 30);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      role: role || 'vip',
      status: 'active',
      expiresAt: expiryDate,
      registeredIp: null, // Se fijará en su primer inicio de sesión
      lastLoginIp: null,
      lastLoginAt: null,
      createdAt: this.getTodayDateStr()
    };

    users.push(newUser);
    this.saveUsers(users);
    return { 
      success: true, 
      message: `¡Usuario VIP "${cleanUser}" creado con éxito! Vence el ${expiryDate}.`, 
      user: newUser 
    };
  }

  /**
   * Elimina un usuario (excepto el administrador principal) permanentemente
   */
  static deleteUser(userId) {
    let users = this.getUsers();
    const normTarget = this.normalizeText(userId);
    const target = users.find(u => u.id === userId || this.normalizeText(u.username) === normTarget);
    if (!target) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    if (this.normalizeText(target.username) === 'admin' || target.id === 'usr_admin_master') {
      return { success: false, message: 'No se puede eliminar el usuario Administrador Principal.' };
    }

    // Registrar en la lista de eliminados para que no vuelva a regenerarse
    this.addDeletedUser(target.username);

    users = users.filter(u => u.id !== target.id);
    this.saveUsers(users);
    return { success: true, message: `Usuario "${target.username}" eliminado correctamente.` };
  }

  /**
   * Alterna el estado activo / inactivo de un usuario
   */
  static toggleUserStatus(userId) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
    if (!target) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    if (target.username.toLowerCase() === 'admin') {
      return { success: false, message: 'El Administrador Principal siempre debe estar activo.' };
    }

    target.status = target.status === 'active' ? 'inactive' : 'active';
    this.saveUsers(users);
    return { 
      success: true, 
      status: target.status, 
      message: `Usuario "${target.username}" ahora está ${target.status === 'active' ? 'ACTIVO 🟢' : 'INACTIVO 🔴'}.` 
    };
  }

  /**
   * Libera la IP registrada de un usuario VIP para permitir cambiar de dispositivo/red
   */
  static releaseUserIP(userId) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
    if (!target) return { success: false, message: 'Usuario no encontrado.' };

    target.registeredIp = null;
    this.saveUsers(users);
    return { 
      success: true, 
      message: `IP liberada para "${target.username}". El usuario podrá iniciar sesión desde su nueva red o dispositivo.` 
    };
  }

  /**
   * Renueva o extiende la suscripción de un usuario por N días
   */
  static renewUserSubscription(userId, days = 30, newPassword = null) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
    if (!target) return { success: false, message: 'Usuario no encontrado.' };

    const today = this.getTodayDateStr();
    // Si la fecha actual aún no vence, sumar desde la fecha existente; si ya venció, sumar desde hoy
    const baseDate = (target.expiresAt && target.expiresAt > today) ? target.expiresAt : today;
    target.expiresAt = this.addDaysToDate(baseDate, days);
    target.status = 'active';

    if (newPassword && String(newPassword).trim()) {
      target.password = String(newPassword).trim();
    }

    this.saveUsers(users);
    return { 
      success: true, 
      message: `Suscripción de "${target.username}" extendida hasta el ${target.expiresAt} (+${days} días).`,
      user: target 
    };
  }

  /**
   * Actualiza la clave de un usuario específico
   */
  static updateUserPassword(userId, newPassword) {
    const cleanPass = String(newPassword || '').trim();
    if (!cleanPass) return { success: false, message: 'La contraseña no puede estar vacía.' };

    const users = this.getUsers();
    const target = users.find(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
    if (!target) return { success: false, message: 'Usuario no encontrado.' };

    target.password = cleanPass;
    this.saveUsers(users);
    return { success: true, message: `Contraseña de "${target.username}" actualizada correctamente.` };
  }

  /**
   * Asigna, actualiza o libera manualmente la IP autorizada de un usuario
   */
  static setUserIP(userId, newIp) {
    const users = this.getUsers();
    const normTarget = this.normalizeText(userId);
    const target = users.find(u => u.id === userId || this.normalizeText(u.username) === normTarget);
    if (!target) return { success: false, message: 'Usuario no encontrado.' };

    const cleanIp = String(newIp || '').trim();
    target.registeredIp = cleanIp || null;
    if (cleanIp) {
      target.lastLoginIp = cleanIp;
      target.lastLoginAt = new Date().toISOString();
    }
    this.saveUsers(users);
    return {
      success: true,
      message: cleanIp ? `IP "${cleanIp}" asignada correctamente a ${target.username}.` : `IP liberada para ${target.username}.`
    };
  }

  /**
   * Obtiene información detallada del estado de la suscripción de un usuario
   */
  static getSubscriptionStatus(user) {
    if (!user) return { isExpired: true, daysRemaining: 0, label: 'Desconocido', badgeClass: 'badge-sub-expired' };

    if (user.username.toLowerCase() === 'admin' || user.role === 'admin') {
      return { isExpired: false, daysRemaining: 9999, label: 'Acceso Ilimitado', badgeClass: 'badge-role-admin' };
    }

    if (!user.expiresAt) {
      return { isExpired: false, daysRemaining: 30, label: 'Sin límite', badgeClass: 'badge-status-active' };
    }

    const today = this.getTodayDateStr();
    const tToday = new Date(today + 'T00:00:00').getTime();
    const tExpiry = new Date(user.expiresAt + 'T00:00:00').getTime();
    const diffDays = Math.round((tExpiry - tToday) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || user.status !== 'active') {
      return {
        isExpired: true,
        daysRemaining: 0,
        label: 'Vencida / Inactiva',
        badgeClass: 'badge-sub-expired'
      };
    }

    if (diffDays <= 3) {
      return {
        isExpired: false,
        daysRemaining: diffDays,
        label: diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} día${diffDays > 1 ? 's' : ''}`,
        badgeClass: 'badge-sub-warning'
      };
    }

    return {
      isExpired: false,
      daysRemaining: diffDays,
      label: `${diffDays} días restantes`,
      badgeClass: 'badge-sub-active'
    };
  }

  /**
   * Obtiene las credenciales del admin por defecto (compatibilidad)
   */
  static getCredentials() {
    const users = this.getUsers();
    const admin = users.find(u => u.username.toLowerCase() === 'admin');
    if (admin) {
      return { username: admin.username, password: admin.password, appName: 'Datos Orbet VIP' };
    }
    return { username: 'admin', password: 'orbet2026', appName: 'Datos Orbet VIP' };
  }

  /**
   * Guarda credenciales del admin principal
   */
  static saveCredentials(username, password) {
    const users = this.getUsers();
    const admin = users.find(u => u.username.toLowerCase() === 'admin');
    if (admin) {
      admin.password = String(password || '').trim();
      if (username && username.trim()) admin.username = username.trim();
      this.saveUsers(users);
    }
    return true;
  }

  /**
   * Verifica si existe una sesión activa válida
   */
  static isAuthenticated() {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      if (!session || !session.token) return false;
      if (session.remember) return true;
      const diffHours = (Date.now() - session.timestamp) / (1000 * 60 * 60);
      return diffHours < 12;
    } catch {
      return false;
    }
  }

  /**
   * Intenta iniciar sesión con usuario, contraseña y validación estricta de IP única
   */
  static login(username, password, remember = true, clientIp = null) {
    // 1. Ejecutar reseteo de vencidos primero
    this.checkExpirations();

    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { 
        success: false, 
        reason: 'empty_fields',
        message: 'Por favor ingrese usuario y contraseña.' 
      };
    }

    const normInput = this.normalizeText(cleanUser);

    // Comprobación de superusuario maestro admin (siempre tiene acceso sin restricción de IP)
    const isMasterAdmin = (normInput === 'admin' && cleanPass === 'orbet2026');

    // 2. Buscar en el registro de usuarios con tolerancia de mayúsculas/minúsculas y acentos
    const users = this.getUsers();
    const matchedUser = users.find(u => this.normalizeText(u.username) === normInput);

    if (matchedUser) {
      // Comparar contraseñas limpias
      const storedPass = String(matchedUser.password || '').trim();
      const isPasswordCorrect = (storedPass === cleanPass || (this.normalizeText(matchedUser.username) === 'admin' && isMasterAdmin));

      if (!isPasswordCorrect) {
        return { 
          success: false, 
          reason: 'bad_password',
          username: cleanUser,
          message: '❌ Contraseña incorrecta. Verifique sus datos de acceso.' 
        };
      }

      // Comprobar vencimiento de suscripción
      const today = this.getTodayDateStr();
      const isExpired = (matchedUser.role !== 'admin' && matchedUser.expiresAt && today > matchedUser.expiresAt);

      if (isExpired || matchedUser.status !== 'active') {
        // Asegurar reseteo de contraseña a orbet2026 si venció
        matchedUser.status = 'inactive';
        matchedUser.password = 'orbet2026';
        this.saveUsers(users);

        return { 
          success: false, 
          reason: 'expired',
          username: matchedUser.username,
          message: '🔒 Su suscripción VIP ha finalizado o se encuentra suspendida. La clave ha sido reseteada a orbet2026 por seguridad.' 
        };
      }

      // 3. Captura y Validación de IP (Tanto Administrador como VIPs)
      const detectedIp = clientIp || this.cachedIp || ('DISP-' + this.getDeviceIdentifier().substring(0, 12));
      const isAdminUser = (matchedUser.role === 'admin' || this.normalizeText(matchedUser.username) === 'admin');

      if (isAdminUser) {
        // ADMINISTRADOR: Guardar su IP activa de conexión (sin restringirlo a una única IP)
        matchedUser.registeredIp = detectedIp;
        matchedUser.lastLoginIp = detectedIp;
        matchedUser.lastLoginAt = new Date().toISOString();
        this.saveUsers(users);
      } else {
        // CLIENTES VIP: Validación estricta de IP única (Anti-compartición)
        if (!matchedUser.registeredIp) {
          // Primer inicio de sesión: se vincula a esta IP/dispositivo automáticamente
          matchedUser.registeredIp = detectedIp;
          matchedUser.lastLoginIp = detectedIp;
          matchedUser.lastLoginAt = new Date().toISOString();
          this.saveUsers(users);
        } else if (matchedUser.registeredIp !== detectedIp) {
          // Intento de inicio desde OTRA IP / OTRO dispositivo
          return {
            success: false,
            reason: 'ip_mismatch',
            username: matchedUser.username,
            registeredIp: matchedUser.registeredIp,
            detectedIp: detectedIp,
            message: `🚫 Acceso bloqueado por seguridad: Esta cuenta VIP ya está vinculada a otra dirección IP o dispositivo (${matchedUser.registeredIp}). No se permite compartir cuentas.`
          };
        } else {
          // Misma IP registrada: actualizar timestamp
          matchedUser.lastLoginIp = detectedIp;
          matchedUser.lastLoginAt = new Date().toISOString();
          this.saveUsers(users);
        }
      }

      // Credenciales y validaciones correctas -> Iniciar Sesión
      const session = {
        token: 'orbet_token_' + Date.now(),
        userId: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name || matchedUser.username,
        role: matchedUser.role || 'vip',
        expiresAt: matchedUser.expiresAt,
        registeredIp: matchedUser.registeredIp,
        lastLoginIp: detectedIp,
        remember: !!remember,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return { 
        success: true, 
        message: `¡Bienvenido, ${matchedUser.name || matchedUser.username}!`,
        user: matchedUser
      };
    }

    if (isMasterAdmin) {
      const detectedIp = clientIp || this.cachedIp || ('DISP-' + this.getDeviceIdentifier().substring(0, 12));
      const session = {
        token: 'orbet_token_' + Date.now(),
        userId: 'usr_admin_master',
        username: 'admin',
        name: 'Administrador Principal',
        role: 'admin',
        expiresAt: '2099-12-31',
        registeredIp: detectedIp,
        lastLoginIp: detectedIp,
        remember: !!remember,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      const users = this.getUsers();
      const adminUser = users.find(u => this.normalizeText(u.username) === 'admin');
      if (adminUser) {
        adminUser.registeredIp = detectedIp;
        adminUser.lastLoginIp = detectedIp;
        adminUser.lastLoginAt = new Date().toISOString();
        this.saveUsers(users);
      }

      return { success: true, message: '¡Acceso concedido como Administrador!', user: session };
    }

    return { 
      success: false, 
      reason: 'user_not_found',
      username: cleanUser,
      message: '❌ El usuario ingresado no existe en el sistema VIP.' 
    };
  }

  /**
   * Controla la visibilidad del botón de configuración:
   * Solo visible para el rol 'admin', oculto para usuarios VIP y usuarios no autenticados
   */
  static updateAdminUIControls() {
    const user = this.getCurrentUser();
    const isAdmin = user && (user.role === 'admin' || this.normalizeText(user.username) === 'admin');
    const btnSettings = document.getElementById('btn-header-settings');
    if (btnSettings) {
      btnSettings.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    // Si no es admin y el modal de configuración estuviera activo, cerrarlo
    if (!isAdmin) {
      const modal = document.getElementById('settings-modal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    }
  }

  /**
   * Actualiza en vivo la IP de la sesión conectada en los registros y en la interfaz
   */
  static async updateCurrentSessionIp() {
    const session = this.getCurrentUser();
    if (!session) return;
    try {
      const ip = await this.getClientIP();
      if (!ip) return;

      // Actualizar sesión activa
      session.lastLoginIp = ip;
      if (!session.registeredIp) {
        session.registeredIp = ip;
      }
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // Actualizar registro en lista de usuarios
      const users = this.getUsers();
      const user = users.find(u => this.normalizeText(u.username) === this.normalizeText(session.username));
      if (user) {
        let changed = false;
        if (user.lastLoginIp !== ip) {
          user.lastLoginIp = ip;
          changed = true;
        }
        if (!user.registeredIp) {
          user.registeredIp = ip;
          changed = true;
        }
        user.lastLoginAt = new Date().toISOString();
        if (changed) {
          this.saveUsers(users);
        }
      }

      // Actualizar banner en vivo del admin si está presente
      const bannerEl = document.getElementById('admin-detected-ip-val');
      if (bannerEl) {
        bannerEl.textContent = ip;
      }

      if (typeof renderUsersListUI === 'function') {
        renderUsersListUI();
      }
    } catch (_) {}
  }

  /**
   * Cierra la sesión activa
   */
  static logout() {
    localStorage.removeItem(this.SESSION_KEY);
    this.updateAdminUIControls();
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) {
      authOverlay.classList.remove('hidden');
      authOverlay.style.display = 'flex';
      const userInp = document.getElementById('auth-username');
      const passInp = document.getElementById('auth-password');
      if (userInp) userInp.value = '';
      if (passInp) passInp.value = '';
    }
    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('Sesión cerrada correctamente');
    }
  }

  /**
   * Inicializa la comprobación de autenticación en la interfaz
   */
  static initUI() {
    // 1. Verificar vencimientos de forma silenciosa
    this.checkExpirations();

    // 2. Controlar visibilidad del botón de configuración (Solo Admin)
    this.updateAdminUIControls();

    const authOverlay = document.getElementById('auth-overlay');
    if (!authOverlay) return;

    if (this.isAuthenticated()) {
      authOverlay.classList.add('hidden');
      authOverlay.style.display = 'none';
      // Detectar y actualizar IP de la sesión conectada
      this.updateCurrentSessionIp().catch(() => {});
    } else {
      authOverlay.classList.remove('hidden');
      authOverlay.style.display = 'flex';
      this.getClientIP().catch(() => {});
    }
  }

  /**
   * Alternar visibilidad de contraseña
   */
  static togglePasswordVisibility(inputId = 'auth-password', btnId = 'toggle-pass-btn') {
    const passInput = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!passInput) return;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      if (btn) btn.textContent = '🙈';
    } else {
      passInput.type = 'password';
      if (btn) btn.textContent = '👁️';
    }
  }
}

/**
 * Función global de envío para el formulario de inicio de sesión con soporte de IP y WhatsApp CTA
 */
async function handleAuthSubmit(event) {
  if (event) {
    try { event.preventDefault(); } catch (_) {}
    try { event.stopPropagation(); } catch (_) {}
  }

  const userEl = document.getElementById('auth-username');
  const passEl = document.getElementById('auth-password');
  const remEl = document.getElementById('auth-remember');
  const submitBtn = document.getElementById('auth-submit-btn');
  const errorMsg = document.getElementById('auth-error-msg');

  const username = userEl ? userEl.value.trim() : '';
  const password = passEl ? passEl.value.trim() : '';
  const remember = remEl ? remEl.checked : true;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verificando acceso seguro...</span> ⏳';
  }

  try {
    // Obtener IP pública en tiempo real
    const clientIp = await AuthManager.getClientIP();

    const res = AuthManager.login(username, password, remember, clientIp);

    if (res.success) {
      if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.innerHTML = '';
      }
      const overlay = document.getElementById('auth-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }

      // Actualizar botón de ajustes según rol (Solo Admin)
      AuthManager.updateAdminUIControls();
      AuthManager.updateCurrentSessionIp().catch(() => {});

      if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
        PaymentsAndWhatsApp.showToast('¡Bienvenido a Datos Orbet!');
      }
      if (typeof renderUsersListUI === 'function') {
        try { renderUsersListUI(); } catch (_) {}
      }
      if (typeof renderLotteryView === 'function') {
        try {
          renderLotteryView();
        } catch (err) {
          console.warn('Error no bloqueante al renderizar vista:', err);
        }
      }
    } else {
      // Mostrar alerta con información detallada y botón directo de WhatsApp si procede
      if (errorMsg) {
        // Obtener teléfono de WhatsApp oficial configurado en la app
        let adminPhone = '+584247848287';
        if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
          const cfg = DatosOrbetDB.getSettings();
          if (cfg && cfg.whatsapp && cfg.whatsapp.phone) {
            adminPhone = cfg.whatsapp.phone;
          } else if (cfg && cfg.whatsappNumber) {
            adminPhone = cfg.whatsappNumber;
          }
        }
        const cleanPhone = adminPhone.replace(/[^0-9]/g, '');

        let waMsg = `Hola, necesito asistencia con el acceso a mi cuenta VIP en Datos Orbet.`;
        if (res.reason === 'expired') {
          waMsg = `Hola, deseo renovar mi suscripción VIP en Datos Orbet para el usuario: "${username}".`;
        } else if (res.reason === 'ip_mismatch') {
          waMsg = `Hola, mi cuenta VIP "${username}" en Datos Orbet tiene bloqueo por cambio de IP/dispositivo. Solicito autorización o liberación de IP por favor.`;
        } else if (res.reason === 'user_not_found') {
          waMsg = `Hola, deseo contratar una suscripción VIP en Datos Orbet.`;
        }

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;

        errorMsg.innerHTML = `
          <div class="auth-error-header">
            <strong>${res.message}</strong>
          </div>
          <div class="auth-error-help">
            Para activar su suscripción o autorizar un nuevo dispositivo, comuníquese directamente con el administrador:
          </div>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="auth-wa-contact-btn">
            <span class="auth-wa-icon">💬</span>
            <span>Contactar Administrador (${adminPhone})</span>
          </a>
        `;
        errorMsg.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Error durante autenticación:', err);
    if (errorMsg) {
      errorMsg.textContent = 'Ocurrió un error inesperado al comprobar credenciales. Intente nuevamente.';
      errorMsg.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Ingresar a Datos Orbet</span> ➔';
    }
  }
}

/**
 * Redirige al WhatsApp del Administrador solicitando información para realizar pagos y activar cuenta VIP
 */
function openWhatsAppSubscriptionRequest() {
  let adminPhone = '+584247848287';
  if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
    const cfg = DatosOrbetDB.getSettings();
    if (cfg && cfg.whatsapp && cfg.whatsapp.phone) {
      adminPhone = cfg.whatsapp.phone;
    } else if (cfg && cfg.whatsappNumber) {
      adminPhone = cfg.whatsappNumber;
    }
  }
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
  const msg = `¡Hola Datos Orbet! Deseo solicitar información sobre la suscripción VIP, precios y los datos de Pago Móvil / Transferencia para realizar el pago y activar mi cuenta en la aplicación.`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// Inicializar listeners tan pronto cargue el DOM
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('submit', handleAuthSubmit);
    }
    const btn = document.getElementById('auth-submit-btn');
    if (btn) {
      btn.addEventListener('click', handleAuthSubmit);
    }
    // Inicializar UI
    AuthManager.initUI();
  });
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
  window.handleAuthSubmit = handleAuthSubmit;
  window.openWhatsAppSubscriptionRequest = openWhatsAppSubscriptionRequest;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, handleAuthSubmit, openWhatsAppSubscriptionRequest };
}
