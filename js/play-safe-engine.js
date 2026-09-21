// ==========================================================================
// DATOS ORBET - MOTOR "JUEGA Y COBRA SEGURO" (SELLADO DE TICKETS VIP)
// Archivo: js/play-safe-engine.js
// ==========================================================================

class PlaySafeEngine {
  static STORAGE_KEY_TICKETS = 'datos_orbet_my_tickets_v1';

  // Horarios de sorteos habituales
  static DEFAULT_SCHEDULES = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  // Estado de la jugada en curso
  static state = {
    selectedLotteryId: 'guacharoactivo',
    selectedSchedules: ['10:00 AM'],
    selectedNumbers: [
      { num: '34', name: 'Venado' },
      { num: '72', name: 'Gorila' }
    ],
    amountPerNumber: 50,
    referenceNumber: ''
  };

  /**
   * Inicializa el motor al cargar la aplicación
   */
  static init() {
    this.populateLotteriesSelect();
    this.renderSchedulesPills();
    this.renderSelectedChips();
    this.updatePaymentInfoCard();
    this.calculateAndRenderTotal();
    this.renderTicketsHistory();
  }

  /**
   * Llena el selector de operadoras con las configuradas en LOTERIAS_CONFIG
   */
  static populateLotteriesSelect() {
    const select = document.getElementById('play-lottery-select');
    if (!select) return;

    if (typeof LOTERIAS_CONFIG === 'undefined') {
      select.innerHTML = `
        <option value="guacharoactivo">Guácharo Activo</option>
        <option value="lottoactivo">Lotto Activo</option>
        <option value="lagranjita">La Granjita</option>
      `;
      return;
    }

    const options = Object.keys(LOTERIAS_CONFIG).map(id => {
      const lot = LOTERIAS_CONFIG[id];
      const isSelected = id === this.state.selectedLotteryId ? 'selected' : '';
      return `<option value="${id}" ${isSelected}>${lot.nombre || id}</option>`;
    }).join('');

    select.innerHTML = options;
  }

  /**
   * Cambia la operadora actual
   */
  static onLotteryChange(lotteryId) {
    this.state.selectedLotteryId = lotteryId;
    this.calculateAndRenderTotal();
  }

  /**
   * Renderiza las píldoras interactivas de horarios
   */
  static renderSchedulesPills() {
    const container = document.getElementById('play-schedules-container');
    if (!container) return;

    container.innerHTML = this.DEFAULT_SCHEDULES.map(time => {
      const isSelected = this.state.selectedSchedules.includes(time);
      return `
        <button type="button" class="btn-schedule-pill ${isSelected ? 'active' : ''}" 
          onclick="PlaySafeEngine.toggleSchedule('${time}')">
          ${time}
        </button>
      `;
    }).join('');
  }

  /**
   * Alterna la selección de un horario
   */
  static toggleSchedule(time) {
    const idx = this.state.selectedSchedules.indexOf(time);
    if (idx > -1) {
      if (this.state.selectedSchedules.length > 1) {
        this.state.selectedSchedules.splice(idx, 1);
      } else {
        if (typeof PaymentsAndWhatsApp !== 'undefined') {
          PaymentsAndWhatsApp.showToast('Debe seleccionar al menos un horario para la jugada.');
        }
        return;
      }
    } else {
      this.state.selectedSchedules.push(time);
    }
    this.renderSchedulesPills();
    this.calculateAndRenderTotal();
  }

  /**
   * Obtiene la lista completa de animalitos para la operadora actual
   */
  static getAnimalitosList() {
    if (typeof LOTERIAS_CONFIG !== 'undefined' && this.state.selectedLotteryId) {
      const cfg = LOTERIAS_CONFIG[this.state.selectedLotteryId];
      if (cfg) {
        if (cfg.type === 'animalitos_75' && typeof ANIMALITOS_75_LIST !== 'undefined') {
          return ANIMALITOS_75_LIST;
        }
        if (cfg.type === 'animalitos_40' && typeof ANIMALITOS_40_LIST !== 'undefined') {
          return ANIMALITOS_40_LIST;
        }
        if (typeof ANIMALITOS_38_LIST !== 'undefined') {
          return ANIMALITOS_38_LIST;
        }
      }
    }
    if (typeof ANIMALITOS_75_LIST !== 'undefined') {
      return ANIMALITOS_75_LIST;
    }
    if (typeof ANIMALITOS_38_LIST !== 'undefined') {
      return ANIMALITOS_38_LIST;
    }
    return [
      { num: '00', name: 'Ballena' }, { num: '0', name: 'Delfín' },
      { num: '01', name: 'Carnero' }, { num: '02', name: 'Toro' },
      { num: '34', name: 'Venado' }, { num: '72', name: 'Gorila' }
    ];
  }

  /**
   * Normaliza un identificador de número para animalitos respetando la regla clave:
   * '0' es Delfín (un solo cero)
   * '00' es Ballena (doble cero)
   * '1'..'9' se normaliza a '01'..'09'
   * '10'..'75' se normaliza a '10'..'75'
   */
  static normalizeNum(input) {
    if (input === null || input === undefined) return '';
    const str = String(input).trim();
    if (str === '00') return '00';
    if (str === '0') return '0';
    
    // Si es un número del 1 al 9 (ej: "1" o "01")
    const numInt = parseInt(str, 10);
    if (!isNaN(numInt) && numInt >= 1 && numInt <= 9) {
      return str.padStart(2, '0');
    }
    if (!isNaN(numInt) && numInt >= 10) {
      return String(numInt);
    }
    return str;
  }

  /**
   * Busca un animalito en el catálogo oficial por número o por nombre
   */
  static findAnimalito(query) {
    if (!query) return null;
    const raw = String(query).trim();
    const cleanLower = raw.toLowerCase();
    
    // Función auxiliar para quitar acentos
    const removeAccents = (s) => (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = removeAccents(cleanLower);

    const list = this.getAnimalitosList();

    // 1. REGLA ESTRICTA 0 vs 00:
    if (raw === '00') {
      const b = list.find(item => item.num === '00');
      return b || { num: '00', name: 'Ballena' };
    }
    if (raw === '0') {
      const d = list.find(item => item.num === '0');
      return d || { num: '0', name: 'Delfín' };
    }

    // 2. Coincidencia por nombre exacto (con o sin acentos)
    const exactNameMatch = list.find(item => removeAccents(item.name) === queryNorm);
    if (exactNameMatch) return exactNameMatch;

    // 3. Coincidencia por número normalizado (1 -> 01, 01 -> 01, 34 -> 34)
    const normalizedQueryNum = this.normalizeNum(raw);
    const numMatch = list.find(item => item.num === normalizedQueryNum);
    if (numMatch) return numMatch;

    // 4. Coincidencia parcial por nombre (ej: "delf", "ballen", "venad")
    const partialNameMatch = list.find(item => removeAccents(item.name).includes(queryNorm));
    if (partialNameMatch) return partialNameMatch;

    return null;
  }

  /**
   * Agrega un animalito a la jugada
   */
  static addNumber(num, name) {
    const cleanNum = this.normalizeNum(num);
    if (!cleanNum) return;

    let cleanName = String(name || '').trim();
    if (!cleanName || cleanName.startsWith('Jugada #')) {
      const found = this.findAnimalito(cleanNum);
      if (found) {
        cleanName = found.name;
      } else if (!cleanName) {
        cleanName = `Jugada #${cleanNum}`;
      }
    }

    // Regla estricta e inmutable: 0 es Delfín, 00 es Ballena
    if (cleanNum === '00') {
      cleanName = 'Ballena';
    } else if (cleanNum === '0') {
      cleanName = 'Delfín';
    }

    const exists = this.state.selectedNumbers.some(item => item.num === cleanNum);
    if (exists) {
      if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
        PaymentsAndWhatsApp.showToast(`El número ${cleanNum} (${cleanName}) ya está en tu ticket.`);
      }
      return;
    }

    this.state.selectedNumbers.push({ num: cleanNum, name: cleanName });
    this.renderSelectedChips();
    this.calculateAndRenderTotal();
  }

  /**
   * Elimina un número de la jugada
   */
  static removeNumber(num) {
    const cleanNum = this.normalizeNum(num);
    this.state.selectedNumbers = this.state.selectedNumbers.filter(item => item.num !== cleanNum);
    this.renderSelectedChips();
    this.calculateAndRenderTotal();

    // Sincronizar el botón en el modal si está abierto
    const modalBtn = document.querySelector(`.animalito-modal-btn[data-num="${cleanNum}"]`);
    if (modalBtn) modalBtn.classList.remove('selected');
  }

  /**
   * Agrega un número ingresado desde el buscador o input rápido
   */
  static addFromSearchInput() {
    const input = document.getElementById('play-number-input');
    if (!input) return;
    const rawVal = input.value.trim();
    if (!rawVal) return;

    // 1. Intentar buscar en el catálogo oficial (por nombre, acentos o número)
    const match = this.findAnimalito(rawVal);
    if (match) {
      this.addNumber(match.num, match.name);
      input.value = '';
      return;
    }

    // 2. Si no es un animalito conocido pero es un número válido (ej: 95)
    let numOnly = rawVal.replace(/[^0-9]/g, '');
    if (rawVal === '00') numOnly = '00';
    if (rawVal === '0') numOnly = '0';

    if (numOnly) {
      const normalizedNum = this.normalizeNum(numOnly);
      const reCheck = this.findAnimalito(normalizedNum);
      if (reCheck) {
        this.addNumber(reCheck.num, reCheck.name);
      } else {
        this.addNumber(normalizedNum, `Jugada #${normalizedNum}`);
      }
      input.value = '';
    } else {
      alert(`No se encontró "${rawVal}". Puedes ingresar números (ej: 0, 00, 34) o nombres (ej: Delfín, Ballena, Venado).`);
    }
  }

  /**
   * Renderiza los chips de números seleccionados
   */
  static renderSelectedChips() {
    const container = document.getElementById('play-selected-chips');
    const countEl = document.getElementById('play-numbers-count');
    if (!container) return;

    if (countEl) {
      const len = this.state.selectedNumbers.length;
      countEl.textContent = `${len} número${len !== 1 ? 's' : ''}`;
    }

    if (this.state.selectedNumbers.length === 0) {
      container.innerHTML = `
        <div class="empty-chips-msg">
          🎯 No hay números agregados aún. Escriba o seleccione sus animalitos abajo.
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.selectedNumbers.map(item => `
      <div class="selected-number-chip">
        <span class="chip-num">${item.num}</span>
        <span class="chip-name">${item.name}</span>
        <button type="button" class="chip-remove-btn" onclick="PlaySafeEngine.removeNumber('${item.num}')" title="Quitar">✕</button>
      </div>
    `).join('');
  }

  static MIN_AMOUNT = 50;

  /**
   * Ajusta el monto por número
   */
  static setAmount(val) {
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal <= 0) return;
    this.state.amountPerNumber = numVal;

    const inp = document.getElementById('play-amount-input');
    if (inp && parseFloat(inp.value) !== numVal) {
      inp.value = numVal;
    }

    document.querySelectorAll('.amount-quick-pills .btn-amount-pill').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.amount) === numVal);
    });

    this.calculateAndRenderTotal();
  }

  /**
   * Valida que el monto ingresado no sea inferior a la jugada mínima (50 Bs)
   */
  static validateMinAmount(input) {
    if (!input) return;
    const numVal = parseFloat(input.value);
    if (isNaN(numVal) || numVal < this.MIN_AMOUNT) {
      if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
        PaymentsAndWhatsApp.showToast(`La jugada mínima es de ${this.MIN_AMOUNT} Bs por número.`);
      }
      this.setAmount(this.MIN_AMOUNT);
    }
  }

  /**
   * Calcula el total a pagar y actualiza la tarjeta resumen
   */
  static calculateAndRenderTotal() {
    const numCount = this.state.selectedNumbers.length;
    const schedCount = this.state.selectedSchedules.length;
    const amount = this.state.amountPerNumber;

    const totalBs = numCount * schedCount * amount;

    const totalEl = document.getElementById('play-total-bs');
    const breakdownEl = document.getElementById('play-breakdown-text');
    const pmAmountEl = document.getElementById('pm-copy-amount');

    if (totalEl) {
      totalEl.textContent = `${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
    }

    if (breakdownEl) {
      breakdownEl.textContent = `${numCount} número(s) × ${schedCount} horario(s) × ${amount.toFixed(2)} Bs = Total a Pagar: ${totalBs.toFixed(2)} Bs`;
    }

    if (pmAmountEl) {
      pmAmountEl.textContent = `${totalBs.toFixed(2)} Bs`;
    }

    return totalBs;
  }

  /**
   * Actualiza la tarjeta con los datos vigentes de Pago Móvil
   */
  static updatePaymentInfoCard() {
    let settings = null;
    if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
      settings = DatosOrbetDB.getSettings();
    }

    const pm = (settings && settings.payments && settings.payments.pagoMovil) ? settings.payments.pagoMovil : {
      bank: 'Banco de Venezuela (0102)',
      phone: '0424-7848287',
      ci: 'V-17.273.190',
      holder: 'Oscar Omar Díaz / Orbet VIP'
    };

    const bankEl = document.getElementById('pm-card-bank');
    const phoneEl = document.getElementById('pm-card-phone');
    const ciEl = document.getElementById('pm-card-ci');
    const holderEl = document.getElementById('pm-card-holder');

    if (bankEl) bankEl.textContent = pm.bank || 'Banco de Venezuela (0102)';
    if (phoneEl) phoneEl.textContent = pm.phone || '0424-7848287';
    if (ciEl) ciEl.textContent = pm.ci || 'V-17.273.190';
    if (holderEl) holderEl.textContent = pm.holder || 'Oscar Omar Díaz / Orbet VIP';
  }

  /**
   * Construye el texto formateado del ticket para enviar por WhatsApp
   */
  static buildWhatsAppTicketMessage(refNumber) {
    let lotteryName = 'Guácharo Activo';
    if (typeof LOTERIAS_CONFIG !== 'undefined' && LOTERIAS_CONFIG[this.state.selectedLotteryId]) {
      lotteryName = LOTERIAS_CONFIG[this.state.selectedLotteryId].nombre;
    }

    const todayStr = new Date().toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    const schedulesList = this.state.selectedSchedules.join(', ');
    const numCount = this.state.selectedNumbers.length;
    const schedCount = this.state.selectedSchedules.length;
    const amount = this.state.amountPerNumber;
    const totalBs = numCount * schedCount * amount;

    const numbersFormatted = this.state.selectedNumbers.map(item => 
      `  • [${item.num}] ${item.name} (${amount.toFixed(2)} Bs)`
    ).join('\n');

    let settings = null;
    if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
      settings = DatosOrbetDB.getSettings();
    }
    const pmBank = (settings && settings.payments && settings.payments.pagoMovil && settings.payments.pagoMovil.bank) 
      ? settings.payments.pagoMovil.bank 
      : 'Banco de Venezuela (0102)';

    return `🎟️ *TICKET DE JUGADA - DATOS ORBET* 🎟️\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎰 *Operadora:* ${lotteryName}\n` +
      `📅 *Fecha:* ${todayStr}\n` +
      `⏰ *Horario(s):* ${schedulesList}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Animalitos Seleccionados (${numCount}):*\n` +
      `${numbersFormatted}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Monto por Número:* ${amount.toFixed(2)} Bs\n` +
      `🔢 *Total Apuestas:* ${numCount} num × ${schedCount} hora(s)\n` +
      `💵 *MONTO TOTAL A PAGAR:* ${totalBs.toFixed(2)} Bs\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *Pago Móvil Realizado:*\n` +
      `• *Banco:* ${pmBank}\n` +
      `• *Referencia:* #${refNumber || 'POR ENVIAR'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📎 *ADJUNTO EL CAPTURE DEL COMPROBANTE DE PAGO MÓVIL A ESTE MENSAJE PARA VALIDAR Y SELLAR MI TICKET OFICIAL.* ¡Gracias!`;
  }

  /**
   * Procesa el envío del ticket y comprobante a través de WhatsApp
   */
  static submitPlaySafeTicket() {
    if (this.state.selectedNumbers.length === 0) {
      alert('Por favor agregue al menos un animalito o número para jugar.');
      return;
    }

    if (this.state.selectedSchedules.length === 0) {
      alert('Por favor seleccione al menos un horario para la jugada.');
      return;
    }

    if (this.state.amountPerNumber < this.MIN_AMOUNT) {
      alert(`⚠️ La jugada mínima es de ${this.MIN_AMOUNT} Bs por cada animalito.`);
      this.setAmount(this.MIN_AMOUNT);
      return;
    }

    const refInput = document.getElementById('play-reference-input');
    const ref = refInput ? refInput.value.trim() : '';

    if (!ref) {
      const confirmContinue = confirm(
        '⚠️ Aún no ha ingresado el número de referencia del Pago Móvil.\n\n¿Desea abrir WhatsApp ahora para enviar el ticket y adjuntar el capture?'
      );
      if (!confirmContinue) {
        if (refInput) refInput.focus();
        return;
      }
    }

    const totalBs = this.calculateAndRenderTotal();
    const message = this.buildWhatsAppTicketMessage(ref);

    // Obtener teléfono de WhatsApp configurado
    let phone = '+584247848287';
    if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
      const s = DatosOrbetDB.getSettings();
      if (s && s.whatsapp && s.whatsapp.phone) phone = s.whatsapp.phone;
      else if (s && s.whatsappNumber) phone = s.whatsappNumber;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Guardar en historial local
    this.saveTicketToHistory({
      id: 'tkt_' + Date.now(),
      date: new Date().toLocaleDateString('es-VE'),
      time: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      lotteryId: this.state.selectedLotteryId,
      schedules: [...this.state.selectedSchedules],
      numbers: [...this.state.selectedNumbers],
      amountPerNumber: this.state.amountPerNumber,
      totalBs: totalBs,
      reference: ref || 'Enviado con capture',
      ticketText: message
    });

    // Abrir WhatsApp con el mensaje preformateado
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    if (typeof PaymentsAndWhatsApp !== 'undefined' && PaymentsAndWhatsApp.showToast) {
      PaymentsAndWhatsApp.showToast('¡Ticket generado! Envíe el capture en la ventana de WhatsApp.');
    }

    // Refrescar historial en la UI
    this.renderTicketsHistory();
  }

  /**
   * Guarda un ticket en el historial local
   */
  static saveTicketToHistory(ticket) {
    let tickets = [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_TICKETS);
      if (raw) tickets = JSON.parse(raw);
    } catch (_) {}

    tickets.unshift(ticket);
    // Conservar los últimos 20 tickets
    if (tickets.length > 20) tickets = tickets.slice(0, 20);
    localStorage.setItem(this.STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }

  /**
   * Renderiza el historial de tickets
   */
  static renderTicketsHistory() {
    const container = document.getElementById('play-tickets-history');
    if (!container) return;

    let tickets = [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_TICKETS);
      if (raw) tickets = JSON.parse(raw);
    } catch (_) {}

    if (tickets.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #64748b; font-size: 0.8rem; padding: 12px;">
          No tienes tickets jugados aún. ¡Arma tu primera jugada arriba!
        </div>
      `;
      return;
    }

    container.innerHTML = tickets.map(tkt => `
      <div class="ticket-history-card">
        <div class="ticket-history-header">
          <strong>🎟️ ${tkt.lotteryId ? tkt.lotteryId.toUpperCase() : 'JUGADA'}</strong>
          <span class="ticket-history-date">${tkt.date} ${tkt.time}</span>
        </div>
        <div class="ticket-history-body">
          <div><strong>Sorteos:</strong> ${tkt.schedules.join(', ')}</div>
          <div><strong>Números:</strong> ${tkt.numbers.map(n => `[${n.num} ${n.name}]`).join(' ')}</div>
          <div style="display:flex; justify-content:space-between; margin-top:4px;">
            <span><strong>Total:</strong> ${tkt.totalBs.toFixed(2)} Bs</span>
            <span style="color:#059669;"><strong>Ref:</strong> #${tkt.reference}</span>
          </div>
        </div>
        <div style="margin-top: 6px; display: flex; gap: 6px;">
          <button type="button" class="btn-ticket-copy" onclick="PaymentsAndWhatsApp.copyText(${JSON.stringify(tkt.ticketText)}, 'Ticket de Jugada')">
            📋 Copiar Ticket
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Abre un modal rápido con la lista de animalitos para seleccionar tocando
   */
  static openAnimalitosGridModal() {
    const modal = document.getElementById('animalitos-grid-modal');
    if (!modal) return;

    const list = this.getAnimalitosList();
    const grid = document.getElementById('animalitos-modal-grid');
    if (grid) {
      grid.innerHTML = list.map(item => {
        const cleanNum = this.normalizeNum(item.num);
        const isSelected = this.state.selectedNumbers.some(n => n.num === cleanNum);
        const safeName = (item.name || '').replace(/'/g, "\\'");
        return `
          <button type="button" class="animalito-modal-btn ${isSelected ? 'selected' : ''}" 
            data-num="${cleanNum}"
            onclick="PlaySafeEngine.toggleAnimalitoModal('${cleanNum}', '${safeName}', this)">
            <span class="an-num">${cleanNum}</span>
            <span class="an-name">${item.name}</span>
          </button>
        `;
      }).join('');
    }

    modal.classList.add('active');
  }

  static closeAnimalitosGridModal() {
    const modal = document.getElementById('animalitos-grid-modal');
    if (modal) modal.classList.remove('active');
  }

  static toggleAnimalitoModal(num, name, btn) {
    const cleanNum = this.normalizeNum(num);
    const exists = this.state.selectedNumbers.some(n => n.num === cleanNum);
    if (exists) {
      this.removeNumber(cleanNum);
      if (btn) btn.classList.remove('selected');
    } else {
      this.addNumber(cleanNum, name);
      if (btn) btn.classList.add('selected');
    }
  }
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.PlaySafeEngine = PlaySafeEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlaySafeEngine };
}
