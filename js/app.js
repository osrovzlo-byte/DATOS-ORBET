// ==========================================================================
// DATOS ORBET - CONTROLADOR PRINCIPAL DE LA APLICACIÓN
// Organizado con las 14 Loterías de LOTERIAS_CONFIG y Pronósticos Dinámicos
// Archivo: js/app.js
// ==========================================================================

let currentLotteryId = 'guacharoactivo'; // Inicia en Guácharo Activo por defecto
let currentFilter = {
  type: '1_day',
  customDays: 3,
  startDate: null,
  endDate: null
};
let currentPyramidMode = 'dia_actual';

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 0. Inicializar sincronización en la nube (CloudSync)
  if (typeof CloudSync !== 'undefined') {
    CloudSync.init();
  }

  // 1. Inicializar autenticación y pantalla de acceso
  if (typeof AuthManager !== 'undefined') {
    AuthManager.initUI();
  }

  // 2. Inicializar base de datos local
  DatosOrbetDB.init();

  // 3. Cargar opciones en los selectores de loterías
  populateLotterySelects();

  // 4. Cargar ajustes (WhatsApp, bancos, fuente, credenciales)
  loadAppSettings();

  // 5. Establecer fechas por defecto en selectores de fecha
  const today = new Date().toISOString().split('T')[0];
  const dateStartInput = document.getElementById('date-start');
  const dateEndInput = document.getElementById('date-end');
  const manualDateInput = document.getElementById('manual-date-input');

  if (dateStartInput) dateStartInput.value = today;
  if (dateEndInput) dateEndInput.value = today;
  if (manualDateInput) manualDateInput.value = today;

  // 6. Renderizar vista de resultados inicial si está autenticado
  if (typeof AuthManager === 'undefined' || AuthManager.isAuthenticated()) {
    renderLotteryView();
  }

  // 7. Generar triángulo inicial con fecha de hoy
  generatePyramidAction();

  // 8. Registrar Service Worker para PWA en Android
  registerServiceWorker();

  // 9. Inicializar Pull-to-Refresh y sincronización horaria
  initPullToRefresh();
  setupHourlyAutoRefresh();

  // 10. Inicializar motor Juega y Cobra Seguro
  if (typeof PlaySafeEngine !== 'undefined') {
    PlaySafeEngine.init();
  }
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        console.log('Datos Orbet PWA lista para operar sin conexión', reg.scope);
      })
      .catch((err) => {
        console.warn('Registro de Service Worker omitido:', err);
      });
  }
}

// ==========================================================================
// NOTA: La autenticación y gestión VIP se controlan desde js/auth.js
// ==========================================================================

// ==========================================================================
// NAVEGACIÓN ENTRE PESTAÑAS (TABS ANDROID)
// ==========================================================================
function switchView(viewId, tabBtn) {
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.remove('active');
  });

  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.remove('active');
  });

  const targetSec = document.getElementById(viewId);
  if (targetSec) targetSec.classList.add('active');

  if (tabBtn) {
    tabBtn.classList.add('active');
  } else {
    const matchingTab = document.querySelector(`.nav-tab[data-view="${viewId}"]`);
    if (matchingTab) matchingTab.classList.add('active');
  }

  if (viewId === 'view-hot-numbers') {
    renderHotNumbersView();
  } else if (viewId === 'view-juego-activo') {
    renderJuegoActivoView();
  } else if (viewId === 'view-lotteries') {
    renderLotteryView();
  } else if (viewId === 'view-play-safe') {
    if (typeof PlaySafeEngine !== 'undefined') {
      PlaySafeEngine.init();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToHotNumbersView() {
  switchView('view-hot-numbers', null);
}

function goToJuegoActivoView() {
  switchView('view-juego-activo', null);
}

// ==========================================================================
// SELECTORES Y ORGANIZACIÓN DE "LOTERÍA EN ANÁLISIS"
// ==========================================================================
function populateLotterySelects() {
  const lotteries = DatosOrbetDB.getLotteries();
  const selectMain = document.getElementById('lottery-select');
  const selectHot = document.getElementById('hot-lottery-select');
  const selectJA = document.getElementById('ja-lottery-select');
  const selectManual = document.getElementById('manual-lottery-select');

  if (!selectMain) return;

  const animalitosList = lotteries.filter((l) => l.category === 'Animalitos');
  const tradicionalesList = lotteries.filter((l) => l.category !== 'Animalitos');

  const buildOptions = () => `
    <optgroup label="🐾 Animalitos Oficiales (${animalitosList.length} Loterías)">
      ${animalitosList
        .map((l) => `<option value="${l.id}">${l.flag} ${l.name} (${l.schedules.length} sorteos)</option>`)
        .join('')}
    </optgroup>
    ${
      tradicionalesList.length > 0
        ? `
      <optgroup label="🎟️ Loterías Tradicionales">
        ${tradicionalesList
          .map((l) => `<option value="${l.id}">${l.flag} ${l.name}</option>`)
          .join('')}
      </optgroup>
    `
        : ''
    }
  `;

  const optionsHtml = buildOptions();
  selectMain.innerHTML = optionsHtml;
  selectMain.value = currentLotteryId;

  if (selectHot) {
    selectHot.innerHTML = optionsHtml;
    selectHot.value = currentLotteryId;
  }

  if (selectJA) {
    selectJA.innerHTML = optionsHtml;
    selectJA.value = currentLotteryId;
  }

  if (selectManual) {
    selectManual.innerHTML = optionsHtml;
    selectManual.value = currentLotteryId;
  }
}

/**
 * 3. Gestión de Estado e Interfaz de Usuario (UI):
 * Evento onChange al cambiar la opción en el menú desplegable:
 * - Oculta la tabla anterior
 * - Muestra el Loading Spinner: 'Cargando estadísticas de [Nombre]...'
 * - Ejecuta obtenerEstadisticasPorLoteria(e.target.value)
 * - Manejo de errores con mensaje claro si falla
 */
async function onLotteryChange(event) {
  const selectedKey = event ? event.target.value : document.getElementById('lottery-select').value;
  currentLotteryId = (typeof normalizarLoteriaKey === 'function')
    ? normalizarLoteriaKey(selectedKey)
    : selectedKey;

  // Sincronizar otros selectores
  const selectHot = document.getElementById('hot-lottery-select');
  if (selectHot) selectHot.value = currentLotteryId;
  const selectJA = document.getElementById('ja-lottery-select');
  if (selectJA) selectJA.value = currentLotteryId;

  const contentBox = document.getElementById('lottery-stats-content');
  const loadingBox = document.getElementById('stats-loading-box');
  const errorBox = document.getElementById('stats-error-box');
  const loadingName = document.getElementById('loading-lottery-name');

  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[currentLotteryId] : null;
  const lotteryName = config ? config.nombre : currentLotteryId;

  // Ocultar contenido anterior para evitar confusión y mostrar spinner
  if (contentBox) contentBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (loadingName) loadingName.textContent = lotteryName;
  if (loadingBox) loadingBox.style.display = 'block';

  try {
    // Extracción en vivo desde la web oficial con DOMParser
    await cargarEstadisticasOficiales(currentLotteryId);
    await renderLotteryView();
  } catch (err) {
    console.error('Error al obtener estadísticas de lotería en tiempo real:', err);
    if (loadingBox) loadingBox.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'block';
      const errText = errorBox.querySelector('.error-text');
      if (errText) {
        errText.textContent = 'No se pudieron sincronizar las estadísticas en tiempo real desde la web oficial. Verifique su conexión e intente de nuevo.';
      }
    }
  }
}

async function onHotLotteryChange(event) {
  const selectedKey = event ? event.target.value : document.getElementById('hot-lottery-select').value;
  currentLotteryId = (typeof normalizarLoteriaKey === 'function')
    ? normalizarLoteriaKey(selectedKey)
    : selectedKey;

  const selectMain = document.getElementById('lottery-select');
  if (selectMain) selectMain.value = currentLotteryId;
  const selectJA = document.getElementById('ja-lottery-select');
  if (selectJA) selectJA.value = currentLotteryId;

  const contentBox = document.getElementById('hot-numbers-content');
  const loadingBox = document.getElementById('hot-loading-box');
  const errorBox = document.getElementById('hot-error-box');
  const loadingName = document.getElementById('hot-loading-lottery-name');

  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[currentLotteryId] : null;
  const lotteryName = config ? config.nombre : currentLotteryId;

  if (contentBox) contentBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (loadingName) loadingName.textContent = lotteryName;
  if (loadingBox) loadingBox.style.display = 'block';

  try {
    await cargarEstadisticasOficiales(currentLotteryId);
    await renderHotNumbersView();
  } catch (err) {
    console.error('Error en números calientes oficiales:', err);
    if (loadingBox) loadingBox.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'block';
      const errText = errorBox.querySelector('.error-text');
      if (errText) {
        errText.textContent = 'No se pudieron sincronizar las estadísticas en tiempo real desde la web oficial. Verifique su conexión e intente de nuevo.';
      }
    }
  }
}

async function onJALotteryChange(event) {
  const selectedKey = event ? event.target.value : document.getElementById('ja-lottery-select').value;
  currentLotteryId = (typeof normalizarLoteriaKey === 'function')
    ? normalizarLoteriaKey(selectedKey)
    : selectedKey;

  const selectMain = document.getElementById('lottery-select');
  if (selectMain) selectMain.value = currentLotteryId;
  const selectHot = document.getElementById('hot-lottery-select');
  if (selectHot) selectHot.value = currentLotteryId;

  renderJuegoActivoView();
}

async function retryFetchCurrentLottery() {
  await onLotteryChange({ target: { value: currentLotteryId } });
}

// ==========================================================================
// FILTROS TEMPORALES (1 DÍA, 2 DÍAS, SEMANA, MES, AÑO, PERSONALIZADO)
// ==========================================================================
function setTimeFilter(filterType, pillBtn) {
  currentFilter.type = filterType;

  document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
  if (pillBtn) pillBtn.classList.add('active');

  const customDaysBox = document.getElementById('custom-days-box');
  const customRangeBox = document.getElementById('custom-range-box');

  if (customDaysBox) customDaysBox.classList.remove('active');
  if (customRangeBox) customRangeBox.classList.remove('active');

  if (filterType === 'custom_days') {
    if (customDaysBox) customDaysBox.classList.add('active');
    return;
  }

  if (filterType === 'custom_range') {
    if (customRangeBox) customRangeBox.classList.add('active');
    return;
  }

  renderLotteryView();
}

function applyCustomDays() {
  const input = document.getElementById('input-custom-days');
  const days = parseInt(input.value, 10) || 1;
  currentFilter.customDays = days;
  renderLotteryView();
  PaymentsAndWhatsApp.showToast(`Consultando últimos ${days} días`);
}

function applyCustomDateRange() {
  const start = document.getElementById('date-start').value;
  const end = document.getElementById('date-end').value;

  if (!start) {
    alert('Por favor seleccione la fecha inicial');
    return;
  }

  currentFilter.startDate = start;
  currentFilter.endDate = end || start;
  renderLotteryView();
  PaymentsAndWhatsApp.showToast(`Rango aplicado: ${start} a ${end}`);
}

// ==========================================================================
// RENDERIZADO DE RESULTADOS Y ESTADÍSTICAS
// ==========================================================================
async function renderLotteryView(forceRefresh = false) {
  const lotto = await DatosOrbetDB.fetchResultados(currentLotteryId, forceRefresh);
  if (!lotto) return;

  const descEl = document.getElementById('lottery-country-desc');
  const countEl = document.getElementById('lottery-schedule-count');
  if (descEl) descEl.textContent = `${lotto.flag} ${lotto.description}`;
  if (countEl) countEl.textContent = `${lotto.schedules.length} Sorteos Diarios`;

  const stats = StatsEngine.analyze(lotto, lotto.results, currentFilter);

  document.getElementById('kpi-drawn-count').textContent = stats.totalDrawnCount;
  document.getElementById('kpi-repeated-count').textContent = stats.totalRepeatedCount;
  document.getElementById('kpi-not-drawn-count').textContent = stats.totalNotDrawnCount;
  document.getElementById('kpi-hot-count').textContent = stats.hotNumbersPorSalir.length;
  document.getElementById('total-draws-label').textContent = stats.totalDraws;

  // Renderizar sorteos recientes
  const drawsContainer = document.getElementById('draws-container');
  if (stats.filteredResults.length === 0) {
    drawsContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--color-gris-texto); background: var(--color-azul-hielo); border-radius: var(--radius-md); border: 1px dashed var(--color-azul-claro);">
        <p style="font-weight: 700; font-size: 1rem;">No hay sorteos registrados en este período.</p>
        <p style="font-size: 0.8rem; margin-top: 4px;">Utilice el botón "Actualizar" o agregue resultados en la pestaña Importar.</p>
      </div>
    `;
  } else {
    drawsContainer.innerHTML = stats.filteredResults
      .slice(0, 20)
      .map((r) => {
        return `
          <div class="draw-card">
            <div class="draw-info">
              <span class="draw-time">⏰ ${r.time}</span>
              <span class="draw-date">📅 ${r.date}</span>
              ${r.extra ? `<span class="draw-extra">🐾 ${r.extra}</span>` : ''}
            </div>
            <div class="draw-number-badge">${r.number}</div>
          </div>
        `;
      })
      .join('');
  }

  // Renderizar números que han salido y repetidos
  const drawnContainer = document.getElementById('stats-drawn-container');
  if (stats.numbersDrawn.length === 0) {
    drawnContainer.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--color-gris-texto);">Sin datos en el período</div>`;
  } else {
    drawnContainer.innerHTML = stats.numbersDrawn
      .slice(0, 30)
      .map((item) => {
        const isRepeat = item.count >= 2;
        return `
          <div class="stats-item">
            <div class="stats-num-tag">
              <div class="num-circle">${item.key}</div>
              <div class="num-meta">
                <div class="name">${item.extra ? item.extra : (item.fullNumber !== item.key ? `Sorteo: ${item.fullNumber}` : 'Número')}</div>
                <div class="desc">${isRepeat ? '⚡ ¡Se repite en el período!' : 'Salida única'}</div>
              </div>
            </div>
            <div class="stats-count-tag">
              <span class="count-badge ${isRepeat ? 'repeat-badge' : ''}">
                ${item.count} vez${item.count > 1 ? 'es' : ''} (${item.percentage}%)
              </span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Renderizar números que NO han salido (enjaulados/ausentes) con datos oficiales en tiempo real
  const notDrawnContainer = document.getElementById('stats-not-drawn-container');
  const enjauladosList = (lotto.statsRealtime && lotto.statsRealtime.length > 0)
    ? lotto.statsRealtime
    : stats.numbersNotDrawn;

  if (!enjauladosList || enjauladosList.length === 0) {
    notDrawnContainer.innerHTML = `<div style="padding: 16px; text-align: center; color: #10b981; font-weight: 700;">¡Todos los números han salido al menos una vez en este lapso!</div>`;
  } else {
    notDrawnContainer.innerHTML = enjauladosList
      .slice(0, 30)
      .map((item) => {
        const num = item.numero || item.key;
        const name = item.animal || item.extra || `Animalito ${num}`;
        const days = (typeof item.diasSinSalir !== 'undefined')
          ? `${item.diasSinSalir} días sin salir`
          : (item.daysAgo || 'Ausente');
        const lastDate = item.fechaUltimaSalida ? ` | Última: ${item.fechaUltimaSalida}` : '';

        return `
          <div class="stats-item">
            <div class="stats-num-tag">
              <div class="num-circle" style="background-color: #64748b; border-color: #94a3b8;">${num}</div>
              <div class="num-meta">
                <div class="name">${num} - ${name}</div>
                <div class="desc" style="color: #ef4444;">Ausente / Enjaulado oficial</div>
              </div>
            </div>
            <div class="stats-count-tag">
              <span class="count-badge" style="background-color: #f1f5f9; color: #475569;">
                ${days}${lastDate}
              </span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Restaurar visibilidad del contenedor y ocultar spinner
  const contentBox = document.getElementById('lottery-stats-content');
  const loadingBox = document.getElementById('stats-loading-box');
  const errorBox = document.getElementById('stats-error-box');
  if (loadingBox) loadingBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (contentBox) contentBox.style.display = 'block';
}

// ==========================================================================
// VISTA: NÚMEROS CALIENTES / POR SALIR (ANIMALITOS ENJAULADOS)
// ==========================================================================
async function renderHotNumbersView(forceRefresh = false) {
  const contentBox = document.getElementById('hot-numbers-content');
  const loadingBox = document.getElementById('hot-loading-box');
  const errorBox = document.getElementById('hot-error-box');
  const loadingName = document.getElementById('hot-loading-lottery-name');

  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[currentLotteryId] : null;
  const lotteryName = config ? config.nombre : currentLotteryId;

  if (contentBox) contentBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (loadingName) loadingName.textContent = lotteryName;
  if (loadingBox) loadingBox.style.display = 'block';

  let statsData;
  try {
    statsData = await cargarEstadisticasOficiales(currentLotteryId, forceRefresh);
  } catch (err) {
    console.error('Error al cargar estadísticas oficiales en tiempo real:', err);
    if (loadingBox) loadingBox.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'block';
      const errText = errorBox.querySelector('.error-text');
      if (errText) {
        errText.textContent = 'No se pudieron sincronizar los números calientes en tiempo real con la web oficial. Verifique su conexión a internet e intente de nuevo.';
      }
    }
    return;
  }

  const container = document.getElementById('hot-numbers-list-container');
  if (!container) return;

  const items = statsData.topDemora || statsData || [];
  container.innerHTML = items
    .map((item, index) => {
      const rank = index + 1;
      const rankBadge = rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`;
      const numKey = item.numero || item.key;
      const name = item.animal || item.extra || `Animal ${numKey}`;
      const days = item.diasSinSalir;
      const lastDate = item.fechaUltimaSalida || 'Reciente';

      return `
        <div class="stats-item hot-number-card">
          <div class="stats-num-tag">
            <div class="num-circle" style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); border-color: #fca5a5;">
              ${numKey}
            </div>
            <div class="num-meta">
              <div class="name">
                <span class="rank-tag">${rankBadge}</span> ${numKey} - ${name}
              </div>
              <div class="desc" style="color: #b91c1c; font-weight: 700;">
                Demora: ${days} días sin salir (Oficial)
              </div>
              <div class="last-seen-date">
                📅 Última salida oficial: <strong>${lastDate}</strong>
              </div>
            </div>
          </div>
          <div class="stats-count-tag">
            <span class="count-badge hot-badge">
              ${item.flameIcon || '🔥'} ${item.heatLevel || 'Caliente'}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  if (loadingBox) loadingBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (contentBox) contentBox.style.display = 'block';

  // Más frecuentes
  const lotto = DatosOrbetDB.getLottery(currentLotteryId);
  if (lotto) {
    const stats = StatsEngine.analyze(lotto, lotto.results, currentFilter);
    const freqContainer = document.getElementById('frequent-numbers-list-container');
    if (freqContainer) {
      freqContainer.innerHTML = stats.mostFrequent
        .map((item) => {
          return `
            <div class="stats-item">
              <div class="stats-num-tag">
                <div class="num-circle" style="background: #1e40af;">${item.key}</div>
                <div class="num-meta">
                  <div class="name">${item.extra || `Número ${item.key}`}</div>
                  <div class="desc">Último: ${item.lastDraw ? item.lastDraw.date : 'N/A'}</div>
                </div>
              </div>
              <div class="stats-count-tag">
                <span class="count-badge" style="background: #dbeafe; color: #1e40af;">
                  ${item.count} salida${item.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  if (loadingBox) loadingBox.style.display = 'none';
  if (errorBox) errorBox.style.display = 'none';
  if (contentBox) contentBox.style.display = 'block';
}

function toggleFrequentNumbers() {
  const box = document.getElementById('frequent-numbers-box');
  if (box) {
    const isHidden = box.style.display === 'none' || box.style.display === '';
    box.style.display = isHidden ? 'block' : 'none';
  }
}

// ==========================================================================
// VISTA: JUEGO ACTIVO (PRONÓSTICOS Y DATOS ALTERNATIVOS)
// ==========================================================================
function renderJuegoActivoView() {
  const container = document.getElementById('juego-activo-container');
  if (!container || typeof JuegoActivoEngine === 'undefined') return;

  const pronostico = JuegoActivoEngine.generatePronosticos(currentLotteryId);

  container.innerHTML = `
    <div class="juego-activo-grid">
      
      <!-- 1. DATO FIJO DEL DÍA -->
      <div class="ja-card" style="border-left: 4px solid #ef4444;">
        <div class="ja-card-header" style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);">
          <span>🎯 DATO FIJO DEL DÍA</span>
          <span>Efectividad: ${pronostico.datoFijo.probabilidad}</span>
        </div>
        <div class="ja-card-body">
          <div class="fijo-display">
            <div class="fijo-num-circle">${pronostico.datoFijo.animal.num}</div>
            <div class="fijo-info">
              <div class="name">${pronostico.datoFijo.animal.name}</div>
              <div class="meta">🔥 Máxima Proyección de Salida</div>
              <div class="horario">⏰ Sorteo sugerido: <strong>${pronostico.datoFijo.horarioRecomendado}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. LOS 2 MÁS FUERTES (LA MOROCHA DE ORO) -->
      <div class="ja-card" style="border-left: 4px solid var(--color-oro-suerte);">
        <div class="ja-card-header" style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%);">
          <span>⚡ LA MOROCHA DE ORO (2 MÁS FUERTES)</span>
          <span>Jugada Cruzada</span>
        </div>
        <div class="ja-card-body">
          <div class="morocha-dupla">
            <div class="morocha-item">
              <div class="num">${pronostico.laMorocha[0].num}</div>
              <div class="name">${pronostico.laMorocha[0].name}</div>
            </div>
            <div class="morocha-item">
              <div class="num">${pronostico.laMorocha[1].num}</div>
              <div class="name">${pronostico.laMorocha[1].name}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. EL BOMBAZO (ANIMALITO SORPRESA) -->
      <div class="ja-card" style="border-left: 4px solid #8b5cf6;">
        <div class="ja-card-header" style="background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);">
          <span>💣 EL BOMBAZO / ANIMALITO SORPRESA</span>
          <span>Dato Tapado</span>
        </div>
        <div class="ja-card-body">
          <div class="fijo-display">
            <div class="fijo-num-circle" style="background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%); border-color: #c4b5fd;">
              ${pronostico.elBombazo.num}
            </div>
            <div class="fijo-info">
              <div class="name">${pronostico.elBombazo.name}</div>
              <div class="meta" style="color: #7c3aed;">⚡ Golpe Sorpresa Numerológico</div>
              <div class="horario">Ideal para apostar a ganador en horarios intermedios</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. LA SERIE CALIENTE DEL DÍA -->
      <div class="ja-card" style="border-left: 4px solid #0284c7;">
        <div class="ja-card-header" style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);">
          <span>${pronostico.serieCaliente.icono} ${pronostico.serieCaliente.nombre}</span>
          <span>Serie del Día</span>
        </div>
        <div class="ja-card-body">
          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">Animalitos en sintonía para hoy:</p>
          <div class="serie-chips">
            ${pronostico.serieCaliente.animales
              .map((a) => `<span class="serie-chip"><strong>${a.num}</strong> - ${a.name}</span>`)
              .join('')}
          </div>
        </div>
      </div>

      <!-- 5. LA ESTRELLA DE LA SUERTE (PENTALFA) -->
      <div class="estrella-pentalfa-wrapper">
        <h3 style="font-size: 1rem; font-weight: 800; color: var(--color-oro-brillo);">
          ⭐ La Estrella de la Suerte (Pentalfa)
        </h3>
        <p style="font-size: 0.78rem; opacity: 0.9; margin-top: 2px;">
          5 animalitos bendecidos para combinar en ${pronostico.loteriaNombre}
        </p>
        <div class="estrella-grid">
          ${pronostico.estrellaSuerte
            .map((a) => `
              <div class="estrella-punta">
                <div class="p-num">${a.num}</div>
                <div class="p-name">${a.name}</div>
              </div>
            `)
            .join('')}
        </div>
      </div>

    </div>
  `;
}

function sharePronosticoWhatsApp() {
  if (typeof JuegoActivoEngine === 'undefined') return;
  const p = JuegoActivoEngine.generatePronosticos(currentLotteryId);

  const text = `🍀 *DATOS ORBET VIP - PRONÓSTICO OFICIAL* 🍀\n` +
    `📅 Fecha: ${p.fecha}\n` +
    `🐾 Lotería: *${p.loteriaNombre}*\n\n` +
    `🔥 *DATO FIJO:* ${p.datoFijo.animal.num} ${p.datoFijo.animal.name} (Probabilidad: ${p.datoFijo.probabilidad} - Sorteo: ${p.datoFijo.horarioRecomendado})\n` +
    `⚡ *LA MOROCHA DE ORO:* ${p.laMorocha[0].num} ${p.laMorocha[0].name} y ${p.laMorocha[1].num} ${p.laMorocha[1].name}\n` +
    `💣 *EL BOMBAZO:* ${p.elBombazo.num} ${p.elBombazo.name}\n` +
    `✨ *SERIE CALIENTE:* ${p.serieCaliente.nombre} (${p.serieCaliente.animales.map((a) => a.num + ' ' + a.name).join(', ')})\n` +
    `⭐ *ESTRELLA DE LA SUERTE:* ${p.estrellaSuerte.map((a) => a.num).join(' - ')}\n\n` +
    `📲 Generado con *Datos Orbet, la app de la suerte*.`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

// ==========================================================================
// VISTA: TRIÁNGULOS NUMEROLÓGICOS Y PIRÁMIDES
// ==========================================================================
function setPyramidMode(mode, btn) {
  currentPyramidMode = mode;
  document.querySelectorAll('.pyramid-mode-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const birthBox = document.getElementById('birthdate-box');
  if (birthBox) {
    if (mode === 'nacimiento') {
      birthBox.classList.add('active');
    } else {
      birthBox.classList.remove('active');
    }
  }

  generatePyramidAction();
}

function generatePyramidAction() {
  const birthInput = document.getElementById('input-birthdate');
  const customDate = birthInput ? birthInput.value : null;

  let isLong = false;
  if (currentPyramidMode === 'fecha_larga' || currentPyramidMode === 'nacimiento') {
    isLong = true;
  }

  const result = PyramidEngine.generate({
    mode: currentPyramidMode,
    customDate: customDate,
    isLong: isLong
  });

  const titleEl = document.getElementById('pyramid-title');
  const descEl = document.getElementById('pyramid-desc');
  const wrapper = document.getElementById('pyramid-bricks-wrapper');

  if (titleEl) titleEl.textContent = result.title;
  if (descEl) descEl.textContent = `${result.description} (${result.dateFormatted})`;
  if (!wrapper) return;

  wrapper.innerHTML = '';

  result.pyramidRows.forEach((row, rowIdx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'pyramid-row';

    const isPeak = rowIdx === result.pyramidRows.length - 1;

    row.forEach((digit) => {
      const brick = document.createElement('div');
      brick.className = `pyramid-brick ${isPeak ? 'peak-brick' : ''}`;
      brick.textContent = digit;
      rowDiv.appendChild(brick);
    });

    wrapper.appendChild(rowDiv);
  });

  document.getElementById('pred-peak').textContent = result.predictions.peak;
  document.getElementById('pred-terminales').textContent = result.predictions.terminales.join(' - ');
  document.getElementById('pred-triples').textContent = result.predictions.triples.join(' - ');
  document.getElementById('pred-cuatro').textContent = result.predictions.cuatroCifras.join(' - ');
  document.getElementById('pred-animalito').textContent = `${result.predictions.animalito.num} ${result.predictions.animalito.name}`;
  document.getElementById('pred-signo').textContent = result.predictions.signo;
}

function generateInstantLuckyNumbers() {
  const rand = PyramidEngine.generateRandomLucky();
  document.getElementById('rand-dos').textContent = rand.dosCifras;
  document.getElementById('rand-tres').textContent = rand.tresCifras;
  document.getElementById('rand-cuatro').textContent = rand.cuatroCifras;
  document.getElementById('rand-extra').textContent = `${rand.animalito.num} ${rand.animalito.name} - ${rand.signo}`;

  const modal = document.getElementById('random-modal');
  if (modal) modal.classList.add('active');
}

function closeRandomModal() {
  const modal = document.getElementById('random-modal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// VISTA: IMPORTADOR Y SINCRONIZACIÓN
// ==========================================================================
async function handleLiveSync() {
  const btn = document.getElementById('btn-live-sync');
  const statusText = document.getElementById('live-status-text');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Sincronizando...';
  }
  if (statusText) statusText.textContent = 'Sincronizando con web oficial...';

  try {
    DatosOrbetDB.invalidateCache(currentLotteryId);
    await obtenerEstadisticasPorLoteria(currentLotteryId);
    await renderLotteryView();
    await renderHotNumbersView();

    if (btn) {
      btn.innerHTML = '✅ Al Día';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '🔄 Actualizar';
      }, 2000);
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
    if (statusText) statusText.textContent = `Actualizado a las ${timeStr}`;
    PaymentsAndWhatsApp.showToast('¡Estadísticas y días sin salir sincronizados en tiempo real!');
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔄 Actualizar';
    }
    alert('Error al sincronizar resultados: ' + err.message);
  }
}

function processTextImport() {
  const textEl = document.getElementById('import-text-input');
  const text = textEl ? textEl.value.trim() : '';

  if (!text) {
    alert('Por favor ingrese o pegue texto con los resultados oficiales.');
    return;
  }

  const parsed = LotteryImporter.parseOfficialResultsText(text, currentLotteryId);
  if (parsed.length === 0) {
    alert('No se detectaron datos válidos en el texto. Puede copiar tablas como "05 - LEON 9" o sorteos "12:00 PM: 14 Paloma".');
    return;
  }

  const count = LotteryImporter.commitBatch(parsed);
  textEl.value = '';
  renderLotteryView();
  PaymentsAndWhatsApp.showToast(`¡Éxito! Se importaron ${count} registros.`);
}

function saveManualDraw() {
  const lottoSelect = document.getElementById('manual-lottery-select');
  const dateInput = document.getElementById('manual-date-input');
  const timeInput = document.getElementById('manual-time-input');
  const numInput = document.getElementById('manual-number-input');
  const extraInput = document.getElementById('manual-extra-input');

  const lottoId = lottoSelect.value;
  const date = dateInput.value;
  const time = timeInput.value.trim();
  const num = numInput.value.trim();
  const extra = extraInput.value.trim();

  if (!date || !time || !num) {
    alert('Por favor complete la fecha, la hora y el número ganador.');
    return;
  }

  const newEntry = {
    id: `${lottoId}-${date}-${time.replace(/[^a-zA-Z0-9]/g, '')}`,
    date: date,
    time: time,
    number: num,
    extra: extra,
    createdAt: new Date().toISOString()
  };

  DatosOrbetDB.addResult(lottoId, newEntry);
  numInput.value = '';
  extraInput.value = '';
  renderLotteryView();
  PaymentsAndWhatsApp.showToast(`Sorteo guardado: ${num} (${time})`);
}

function exportBackupData() {
  const jsonStr = DatosOrbetDB.exportJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `datos-orbet-respaldo-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  PaymentsAndWhatsApp.showToast('Respaldo descargado exitosamente');
}

function confirmResetData() {
  if (confirm('¿Desea restaurar las 14 loterías oficiales y sorteos a la configuración inicial?')) {
    DatosOrbetDB.resetDatabase();
    populateLotterySelects();
    renderLotteryView();
    PaymentsAndWhatsApp.showToast('Base de datos restaurada');
  }
}

// ==========================================================================
// AJUSTES, TAMAÑO DE LETRA, CREDENCIALES Y PAGOS
// ==========================================================================
function setAppFontSize(size) {
  if (document.body) {
    document.body.classList.remove('font-large', 'font-xlarge');
  }
  document.querySelectorAll('.font-btn').forEach((b) => b.classList.remove('active'));

  if (size === 'large') {
    if (document.body) document.body.classList.add('font-large');
    const btn = document.getElementById('btn-font-large');
    if (btn) btn.classList.add('active');
  } else if (size === 'xlarge') {
    if (document.body) document.body.classList.add('font-xlarge');
    const btn = document.getElementById('btn-font-xlarge');
    if (btn) btn.classList.add('active');
  } else {
    const btn = document.getElementById('btn-font-normal');
    if (btn) btn.classList.add('active');
  }

  if (typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.getSettings) {
    const settings = DatosOrbetDB.getSettings();
    settings.fontSize = size;
    DatosOrbetDB.saveSettings(settings);
  }
}

function setNewUserExpiryDays(days) {
  const expiresInput = document.getElementById('new-user-expires');
  if (expiresInput && typeof AuthManager !== 'undefined') {
    expiresInput.value = AuthManager.addDaysToDate(AuthManager.getTodayDateStr(), days);
  }
  document.querySelectorAll('.expiry-quick-pills .btn-pill-quick').forEach(btn => {
    btn.classList.remove('active');
  });
  if (typeof event !== 'undefined' && event && event.target) {
    event.target.classList.add('active');
  }
}

function renderUsersListUI() {
  const container = document.getElementById('users-list-container');
  if (!container || typeof AuthManager === 'undefined') return;

  const users = AuthManager.getUsers();
  const countEl = document.getElementById('users-count-badge');
  if (countEl) {
    countEl.textContent = `${users.length} cuenta${users.length !== 1 ? 's' : ''}`;
  }

  if (users.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:12px; color:#64748b; font-size:0.8rem;">No hay usuarios registrados</div>`;
    return;
  }

  container.innerHTML = users.map(user => {
    const isMaster = (user.username.toLowerCase() === 'admin');
    const isActive = user.status === 'active';
    const subStatus = AuthManager.getSubscriptionStatus(user);

    const roleBadge = isMaster 
      ? '<span class="badge-role-admin">🔒 Administrador</span>' 
      : '<span class="badge-role-vip">⭐ Cliente VIP</span>';
    const statusBadge = isActive 
      ? '<span class="badge-status-active">🟢 Activo</span>' 
      : '<span class="badge-status-inactive">🔴 Inactivo</span>';
    const subBadge = isMaster
      ? '<span class="badge-sub-admin">♾️ Ilimitado</span>'
      : `<span class="${subStatus.badgeClass}">${subStatus.isExpired ? '🔴 Vencida' : '📅 ' + subStatus.label}</span>`;

    const ipInfo = user.registeredIp 
      ? `<span class="user-ip-bound">🌐 IP: <code>${user.registeredIp}</code></span>`
      : `<span class="user-ip-unbound">🌐 IP: <em>Sin vincular (se fijará en 1er login)</em></span>`;

    return `
      <div class="user-item-card ${!isActive ? 'user-item-inactive' : ''}">
        <div class="user-item-header">
          <div class="user-item-identity">
            <span class="user-item-icon">${isMaster ? '👑' : '👤'}</span>
            <div>
              <div class="user-item-title">
                <strong>${user.username}</strong>
                ${roleBadge}
                ${statusBadge}
                ${subBadge}
              </div>
              <div class="user-item-name">${user.name || user.username}</div>
            </div>
          </div>
          <div class="user-item-meta">
            <span class="user-item-date">${!isMaster && user.expiresAt ? `📅 Vence: <strong>${user.expiresAt}</strong>` : (user.createdAt || 'Registrado')}</span>
          </div>
        </div>

        <div class="user-item-creds">
          <div class="user-cred-row">
            <span class="user-cred-label">🔑 Clave:</span>
            <code class="user-cred-val" id="user-pwd-${user.id}">${user.password}</code>
            <button type="button" class="btn-user-action-sm" onclick="PaymentsAndWhatsApp.copyText('${user.password}', 'Clave de ${user.username}')" title="Copiar clave">📋</button>
            <button type="button" class="btn-user-action-sm" onclick="changeUserPasswordPrompt('${user.id}', '${user.username}')" title="Cambiar clave">✏️</button>
          </div>
          <div class="user-cred-row" style="margin-top: 4px; font-size: 0.72rem;">
            ${ipInfo}
            ${user.registeredIp && !isMaster ? `
              <button type="button" class="btn-user-action-sm btn-release-ip-btn" onclick="releaseUserIPAction('${user.id}')" title="Liberar IP para permitir cambio de red o dispositivo">
                🔄 Liberar IP
              </button>
            ` : ''}
          </div>
        </div>

        ${!isMaster ? `
          <div class="user-item-actions">
            <button type="button" class="btn-user-action btn-renew" onclick="renewSubscriptionPrompt('${user.id}', '${user.username}')" title="Extender días de suscripción">
              📅 +30 Días
            </button>
            <button type="button" class="btn-user-action ${isActive ? 'btn-deactivate' : 'btn-activate'}" onclick="toggleUserStatusAction('${user.id}')">
              ${isActive ? '⏸️ Suspender' : '▶️ Activar'}
            </button>
            <button type="button" class="btn-user-action btn-delete" onclick="deleteUserAction('${user.id}')">
              🗑️ Eliminar
            </button>
          </div>
        ` : `
          <div class="user-item-actions">
            <span style="font-size:0.75rem; color:#64748b; font-style:italic;">Cuenta maestra del sistema (Sin límite de IP ni fecha)</span>
          </div>
        `}
      </div>
    `;
  }).join('');
}

function addNewUserAction() {
  const userEl = document.getElementById('new-user-username');
  const passEl = document.getElementById('new-user-password');
  const nameEl = document.getElementById('new-user-name');
  const expiresEl = document.getElementById('new-user-expires');

  const username = userEl ? userEl.value.trim() : '';
  const password = passEl ? passEl.value.trim() : '';
  const name = nameEl ? nameEl.value.trim() : '';
  const expiresAt = expiresEl ? expiresEl.value : null;

  if (!username || !password) {
    alert('Por favor ingrese tanto el nombre de usuario como la contraseña para el nuevo acceso VIP.');
    return;
  }

  const res = AuthManager.addUser(username, password, name, 'vip', expiresAt);
  if (res.success) {
    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';
    if (nameEl) nameEl.value = '';
    if (expiresEl && typeof AuthManager !== 'undefined') {
      expiresEl.value = AuthManager.addDaysToDate(AuthManager.getTodayDateStr(), 30);
    }
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(`¡Usuario VIP "${username}" creado exitosamente!`);
  } else {
    alert(res.message);
  }
}

function toggleUserStatusAction(userId) {
  const res = AuthManager.toggleUserStatus(userId);
  if (res.success) {
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(res.message);
  } else {
    alert(res.message);
  }
}

function releaseUserIPAction(userId) {
  if (!confirm('¿Desea liberar la IP de este usuario? Al hacerlo, el cliente podrá iniciar sesión desde su nueva red o dispositivo y quedará autorizada.')) {
    return;
  }
  const res = AuthManager.releaseUserIP(userId);
  if (res.success) {
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(res.message);
  } else {
    alert(res.message);
  }
}

function renewSubscriptionPrompt(userId, username) {
  const daysStr = prompt(`¿Cuántos días desea agregar a la suscripción de "${username}"?`, "30");
  if (daysStr === null) return;
  const days = parseInt(daysStr, 10);
  if (isNaN(days) || days <= 0) {
    alert('Por favor ingrese una cantidad válida de días (ejemplo: 30).');
    return;
  }
  const res = AuthManager.renewUserSubscription(userId, days);
  if (res.success) {
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(res.message);
  } else {
    alert(res.message);
  }
}

function changeUserPasswordPrompt(userId, username) {
  const newPass = prompt(`Ingrese la nueva clave autorizada para el usuario "${username}":`);
  if (newPass === null) return;
  if (!newPass.trim()) {
    alert('La contraseña no puede estar vacía.');
    return;
  }
  const res = AuthManager.updateUserPassword(userId, newPass.trim());
  if (res.success) {
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(res.message);
  } else {
    alert(res.message);
  }
}

function deleteUserAction(userId) {
  if (!confirm('¿Está seguro de que desea eliminar a este usuario VIP? Ya no podrá ingresar a la app.')) {
    return;
  }
  const res = AuthManager.deleteUser(userId);
  if (res.success) {
    renderUsersListUI();
    PaymentsAndWhatsApp.showToast(res.message);
  } else {
    alert(res.message);
  }
}

function loadAppSettings() {
  const settings = DatosOrbetDB.getSettings();

  if (settings.fontSize) {
    setAppFontSize(settings.fontSize);
  }

  // Cargar lista interactiva de usuarios VIP
  renderUsersListUI();

  // Inicializar fecha de expiración por defecto (+30 días) si está vacía
  const expiresInput = document.getElementById('new-user-expires');
  if (expiresInput && !expiresInput.value && typeof AuthManager !== 'undefined') {
    expiresInput.value = AuthManager.addDaysToDate(AuthManager.getTodayDateStr(), 30);
  }

  // Cargar datos en los inputs del modal de ajustes
  const waInput = document.getElementById('cfg-wa-phone');
  const pmInput = document.getElementById('cfg-pm-info');
  const pmBankInput = document.getElementById('cfg-pm-bank');
  const banColInput = document.getElementById('cfg-bancolombia');
  const nequiInput = document.getElementById('cfg-nequi');
  const zelleInput = document.getElementById('cfg-zelle');
  const binanceInput = document.getElementById('cfg-binance');

  if (waInput && settings.whatsapp) waInput.value = settings.whatsapp.phone || '+584247848287';
  if (pmInput && settings.payments && settings.payments.pagoMovil) {
    const phone = settings.payments.pagoMovil.phone || '0424-7848287';
    const ci = settings.payments.pagoMovil.ci || 'V-17.273.190';
    pmInput.value = `${phone} / ${ci}`;
  }
  if (pmBankInput && settings.payments && settings.payments.pagoMovil) {
    pmBankInput.value = settings.payments.pagoMovil.bank || 'Banco de Venezuela (0102)';
  }
  if (banColInput && settings.payments && settings.payments.bancolombia) {
    banColInput.value = settings.payments.bancolombia.accountNumber || '08862783477 - 1091375151';
  }
  if (nequiInput && settings.payments && settings.payments.bancolombia) {
    nequiInput.value = settings.payments.bancolombia.nequi || '08862783477';
  }
  if (zelleInput && settings.payments && settings.payments.zelle) {
    zelleInput.value = settings.payments.zelle.email || 'oscar_omardiaz@hotmail.com';
  }
  if (binanceInput && settings.payments && settings.payments.binance) {
    binanceInput.value = settings.payments.binance.payId || '298371928';
  }

  // Reflejar datos en las tarjetas visibles de "Pagos / WA"
  if (settings.payments) {
    const p = settings.payments;
    if (p.pagoMovil) {
      const pmBank = document.getElementById('pay-pm-bank');
      const pmPhone = document.getElementById('pay-pm-phone');
      const pmCi = document.getElementById('pay-pm-ci');
      const phoneVal = p.pagoMovil.phone || '0424-7848287';
      const ciVal = p.pagoMovil.ci || 'V-17.273.190';

      if (pmBank) pmBank.textContent = p.pagoMovil.bank || 'Banco de Venezuela (0102)';
      if (pmPhone) {
        pmPhone.textContent = `${phoneVal} 📋`;
        pmPhone.onclick = () => PaymentsAndWhatsApp.copyText(phoneVal, 'Teléfono Pago Móvil');
      }
      if (pmCi) {
        pmCi.textContent = `${ciVal} 📋`;
        pmCi.onclick = () => PaymentsAndWhatsApp.copyText(ciVal, 'Cédula Pago Móvil');
      }
    }
    if (p.bancoBolivares) {
      const veAcc = document.getElementById('pay-ve-account');
      const accVal = p.bancoBolivares.accountNumber || '0134-0000-00-0000000000';
      if (veAcc) {
        veAcc.textContent = `${accVal} 📋`;
        veAcc.onclick = () => PaymentsAndWhatsApp.copyText(accVal, 'Cuenta Banesco');
      }
    }
    if (p.bancolombia) {
      const coAcc = document.getElementById('pay-co-account');
      const coNequi = document.getElementById('pay-co-nequi');
      const accVal = p.bancolombia.accountNumber || '08862783477 - 1091375151';
      const nequiVal = p.bancolombia.nequi || '08862783477';

      if (coAcc) {
        coAcc.textContent = `${accVal} 📋`;
        coAcc.onclick = () => PaymentsAndWhatsApp.copyText(accVal, 'Cuenta Bancolombia');
      }
      if (coNequi) {
        coNequi.textContent = `${nequiVal} 📋`;
        coNequi.onclick = () => PaymentsAndWhatsApp.copyText(nequiVal, 'Nequi');
      }
    }
    if (p.zelle) {
      const usZelle = document.getElementById('pay-us-zelle');
      const zelleVal = p.zelle.email || 'oscar_omardiaz@hotmail.com';
      if (usZelle) {
        usZelle.textContent = `${zelleVal} 📋`;
        usZelle.onclick = () => PaymentsAndWhatsApp.copyText(zelleVal, 'Correo Zelle');
      }
    }
    if (p.binance) {
      const binId = document.getElementById('pay-binance-id');
      const payIdVal = p.binance.payId || '298371928';
      if (binId) {
        binId.textContent = `${payIdVal} 📋`;
        binId.onclick = () => PaymentsAndWhatsApp.copyText(payIdVal, 'Binance Pay ID');
      }
    }
  }
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('active');
    loadAppSettings();
  }
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.classList.remove('active');
}

function saveCustomSettings() {
  const settings = DatosOrbetDB.getSettings();

  const waEl = document.getElementById('cfg-wa-phone');
  const pmInfoEl = document.getElementById('cfg-pm-info');
  const pmBankEl = document.getElementById('cfg-pm-bank');
  const banColEl = document.getElementById('cfg-bancolombia');
  const nequiEl = document.getElementById('cfg-nequi');
  const zelleEl = document.getElementById('cfg-zelle');
  const binanceEl = document.getElementById('cfg-binance');

  // Asegurar estructura
  settings.whatsapp = settings.whatsapp || {};
  settings.payments = settings.payments || {};
  settings.payments.pagoMovil = settings.payments.pagoMovil || {};
  settings.payments.bancolombia = settings.payments.bancolombia || {};
  settings.payments.zelle = settings.payments.zelle || {};
  settings.payments.binance = settings.payments.binance || {};
  settings.payments.bancoBolivares = settings.payments.bancoBolivares || {};

  if (waEl && waEl.value.trim()) {
    settings.whatsapp.phone = waEl.value.trim();
    settings.whatsappNumber = waEl.value.trim();
  }

  if (pmInfoEl && pmInfoEl.value.trim()) {
    const rawVal = pmInfoEl.value.trim();
    if (rawVal.includes('/')) {
      const parts = rawVal.split('/');
      settings.payments.pagoMovil.phone = parts[0].trim();
      settings.payments.pagoMovil.ci = parts[1].trim();
    } else {
      settings.payments.pagoMovil.phone = rawVal;
    }
  }

  if (pmBankEl && pmBankEl.value.trim()) {
    settings.payments.pagoMovil.bank = pmBankEl.value.trim();
  }

  if (banColEl && banColEl.value.trim()) {
    settings.payments.bancolombia.accountNumber = banColEl.value.trim();
  }

  if (nequiEl && nequiEl.value.trim()) {
    settings.payments.bancolombia.nequi = nequiEl.value.trim();
  }

  if (zelleEl && zelleEl.value.trim()) {
    settings.payments.zelle.email = zelleEl.value.trim();
  }

  if (binanceEl && binanceEl.value.trim()) {
    settings.payments.binance.payId = binanceEl.value.trim();
  }

  DatosOrbetDB.saveSettings(settings);
  loadAppSettings();
  if (typeof PlaySafeEngine !== 'undefined') {
    PlaySafeEngine.updatePaymentInfoCard();
    PlaySafeEngine.calculateAndRenderTotal();
  }
  closeSettingsModal();
  PaymentsAndWhatsApp.showToast('¡Ajustes y datos cambiarios guardados con éxito!');
}

// ==========================================================================
// PULL-TO-REFRESH TÁCTIL (MÓVILES ANDROID) & AUTO-REFRESCO HORARIO
// ==========================================================================
let touchStartY = 0;
let touchDiffY = 0;
let isPulling = false;

function initPullToRefresh() {
  const indicator = document.getElementById('pull-refresh-indicator');
  if (!indicator) return;

  window.addEventListener('touchstart', (e) => {
    if (window.scrollY <= 5) {
      touchStartY = e.touches[0].clientY;
      isPulling = true;
    } else {
      isPulling = false;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    touchDiffY = currentY - touchStartY;
    if (touchDiffY > 20 && window.scrollY <= 5) {
      indicator.classList.add('visible');
      const text = indicator.querySelector('.pull-text');
      if (text) {
        text.textContent = touchDiffY > 70 ? '¡Suelta para sincronizar en vivo!' : 'Desliza para actualizar...';
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', async () => {
    if (!isPulling) return;
    isPulling = false;
    if (touchDiffY >= 70 && window.scrollY <= 5) {
      indicator.classList.add('refreshing');
      const text = indicator.querySelector('.pull-text');
      if (text) text.textContent = 'Sincronizando con web oficial...';

      // Invalidar caché forzadamente y consultar datos dinámicos
      DatosOrbetDB.invalidateCache(currentLotteryId);
      await obtenerEstadisticasPorLoteria(currentLotteryId);
      await renderLotteryView();
      await renderHotNumbersView();

      PaymentsAndWhatsApp.showToast('✅ Estadísticas sincronizadas en vivo');
      setTimeout(() => {
        indicator.classList.remove('visible', 'refreshing');
        if (text) text.textContent = 'Desliza hacia abajo para actualizar en vivo';
      }, 500);
    } else {
      indicator.classList.remove('visible', 'refreshing');
    }
    touchDiffY = 0;
  });
}

function setupHourlyAutoRefresh() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkHourlyCacheAndRefresh();
    }
  });

  window.addEventListener('focus', () => {
    checkHourlyCacheAndRefresh();
  });

  setInterval(() => {
    checkHourlyCacheAndRefresh();
  }, 5 * 60 * 1000);
}

async function checkHourlyCacheAndRefresh() {
  if (DatosOrbetDB.isCacheExpired && DatosOrbetDB.isCacheExpired(currentLotteryId)) {
    console.log(`[DatosOrbet] Nueva hora detectada para ${currentLotteryId}. Re-sincronizando estadísticas oficiales...`);
    await obtenerEstadisticasPorLoteria(currentLotteryId);
    await renderLotteryView();
    await renderHotNumbersView();
  }
}
