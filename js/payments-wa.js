// Datos Orbet - Módulo de WhatsApp y Métodos de Pago
// Facilita la contratación de servicios y el pago en Bolívares, Pesos y Dólares

class PaymentsAndWhatsApp {
  /**
   * Abre la conversación de WhatsApp con el mensaje predeterminado
   */
  static openWhatsApp(customMsg = null) {
    const settings = DatosOrbetDB.getSettings();
    const phone = settings.whatsapp ? settings.whatsapp.phone.replace(/[^0-9]/g, '') : '584121234567';
    const message = customMsg || (settings.whatsapp ? settings.whatsapp.message : '¡Hola Datos Orbet! Deseo adquirir sus servicios y suscripción VIP de la suerte.');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  /**
   * Copia texto al portapapeles con confirmación visual
   */
  static copyToClipboard(text, btnElement) {
    if (!navigator.clipboard) {
      // Fallback para navegadores antiguos
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } else {
      navigator.clipboard.writeText(text);
    }

    if (btnElement) {
      const originalHtml = btnElement.innerHTML;
      btnElement.innerHTML = '✅ ¡Copiado!';
      btnElement.classList.add('copied-btn');
      setTimeout(() => {
        btnElement.innerHTML = originalHtml;
        btnElement.classList.remove('copied-btn');
      }, 1800);
    }

    this.showToast(`Copiado: "${text}"`);
  }

  /**
   * Copia texto desde tarjetas de pago con mensaje personalizado
   */
  static copyText(text, label = '') {
    if (!text) return;
    this.copyToClipboard(text);
    if (label) {
      this.showToast(`¡${label} copiado con éxito!`);
    }
  }

  /**
   * Muestra notificación flotante (Toast)
   */
  static showToast(message) {
    let toast = document.getElementById('orbet-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'orbet-toast';
      toast.className = 'orbet-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

window.PaymentsAndWhatsApp = PaymentsAndWhatsApp;
