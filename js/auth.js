// ==========================================================================
// DATOS ORBET - MÓDULO DE AUTENTICACIÓN Y CREDENCIALES DE ACCESO
// Archivo: js/auth.js
// ==========================================================================

class AuthManager {
  static SESSION_KEY = 'datos_orbet_auth_session_v1';
  static CREDENTIALS_KEY = 'datos_orbet_credentials_v1';

  /**
   * Obtiene las credenciales válidas actuales (por defecto: admin / orbet2026)
   */
  static getCredentials() {
    const raw = localStorage.getItem(this.CREDENTIALS_KEY);
    if (!raw) {
      const defaultCreds = {
        username: 'admin',
        password: 'orbet2026',
        appName: 'Datos Orbet VIP'
      };
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(defaultCreds));
      return defaultCreds;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { username: 'admin', password: 'orbet2026' };
    }
  }

  /**
   * Guarda nuevas credenciales
   */
  static saveCredentials(username, password) {
    const creds = { username: username.trim(), password: password.trim() };
    localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(creds));
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
      // Si seleccionó recordar, la sesión se mantiene activa
      if (session.remember) return true;
      // Si no seleccionó recordar, expira a las 12 horas
      const diffHours = (Date.now() - session.timestamp) / (1000 * 60 * 60);
      return diffHours < 12;
    } catch {
      return false;
    }
  }

  /**
   * Intenta iniciar sesión con usuario y contraseña
   */
  static login(username, password, remember = true) {
    const validCreds = this.getCredentials();
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Por favor ingrese usuario y contraseña.' };
    }

    // Acceso universal con credenciales maestras por defecto (inmune a mayúsculas/minúsculas en móvil)
    const isMaster = (cleanUser.toLowerCase() === 'admin' && cleanPass === 'orbet2026');

    // O acceso con credenciales personalizadas guardadas por el usuario
    const customUser = validCreds && validCreds.username ? String(validCreds.username).trim().toLowerCase() : 'admin';
    const customPass = validCreds && validCreds.password ? String(validCreds.password).trim() : 'orbet2026';
    const isCustom = (cleanUser.toLowerCase() === customUser && cleanPass === customPass);

    if (isMaster || isCustom) {
      const session = {
        token: 'orbet_token_' + Date.now(),
        username: cleanUser,
        remember: !!remember,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { success: true, message: '¡Acceso concedido!' };
    }

    return { success: false, message: 'Credenciales incorrectas. Verifique usuario y contraseña.' };
  }

  /**
   * Cierra la sesión activa
   */
  static logout() {
    localStorage.removeItem(this.SESSION_KEY);
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
    const authOverlay = document.getElementById('auth-overlay');
    if (!authOverlay) return;

    if (this.isAuthenticated()) {
      authOverlay.classList.add('hidden');
      authOverlay.style.display = 'none';
    } else {
      authOverlay.classList.remove('hidden');
      authOverlay.style.display = 'flex';
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
 * Función global de envío para el formulario de inicio de sesión
 */
function handleAuthSubmit(event) {
  if (event) {
    try { event.preventDefault(); } catch (_) {}
    try { event.stopPropagation(); } catch (_) {}
  }

  const userEl = document.getElementById('auth-username');
  const passEl = document.getElementById('auth-password');
  const remEl = document.getElementById('auth-remember');
  const errorMsg = document.getElementById('auth-error-msg');

  const username = userEl ? userEl.value : '';
  const password = passEl ? passEl.value : '';
  const remember = remEl ? remEl.checked : true;

  const res = AuthManager.login(username, password, remember);
  if (res.success) {
    if (errorMsg) errorMsg.style.display = 'none';
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('¡Bienvenido a Datos Orbet!');
    }
    if (typeof renderLotteryView === 'function') {
      try {
        renderLotteryView();
      } catch (err) {
        console.warn('Error no bloqueante al renderizar vista:', err);
      }
    }
  } else {
    if (errorMsg) {
      errorMsg.textContent = res.message;
      errorMsg.style.display = 'block';
    }
  }
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
  });
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
  window.handleAuthSubmit = handleAuthSubmit;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, handleAuthSubmit };
}
