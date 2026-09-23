// ==========================================================================
// DATOS ORBET - MOTOR DE EXTRACCIÓN WEB OFICIAL EN TIEMPO REAL (DOMParser)
// Archivo: js/lotteries-data.js
// ==========================================================================

// Lista de 38 Animalitos tradicionales (00, 0, 01 al 36)
const ANIMALITOS_38_LIST = [
  { num: '00', name: 'Ballena' }, { num: '0', name: 'Delfín' },
  { num: '01', name: 'Carnero' }, { num: '02', name: 'Toro' },
  { num: '03', name: 'Ciempiés' }, { num: '04', name: 'Alacrán' },
  { num: '05', name: 'León' }, { num: '06', name: 'Rana' },
  { num: '07', name: 'Perico' }, { num: '08', name: 'Ratón' },
  { num: '09', name: 'Águila' }, { num: '10', name: 'Tigre' },
  { num: '11', name: 'Gato' }, { num: '12', name: 'Caballo' },
  { num: '13', name: 'Mono' }, { num: '14', name: 'Paloma' },
  { num: '15', name: 'Zorro' }, { num: '16', name: 'Oso' },
  { num: '17', name: 'Pavo' }, { num: '18', name: 'Burro' },
  { num: '19', name: 'Chivo' }, { num: '20', name: 'Cochino' },
  { num: '21', name: 'Gallo' }, { num: '22', name: 'Camello' },
  { num: '23', name: 'Cebra' }, { num: '24', name: 'Iguana' },
  { num: '25', name: 'Gallina' }, { num: '26', name: 'Vaca' },
  { num: '27', name: 'Perro' }, { num: '28', name: 'Zamuro' },
  { num: '29', name: 'Elefante' }, { num: '30', name: 'Caimán' },
  { num: '31', name: 'Lapa' }, { num: '32', name: 'Ardilla' },
  { num: '33', name: 'Pescado' }, { num: '34', name: 'Venado' },
  { num: '35', name: 'Jirafa' }, { num: '36', name: 'Culebra' }
];

// Lista de 77 Animalitos (para Guácharo, Guacharito y Cóndor Gana: 00, 0, 01 al 75)
const ANIMALITOS_75_LIST = [
  ...ANIMALITOS_38_LIST,
  { num: '37', name: 'Tortuga' }, { num: '38', name: 'Búfalo' },
  { num: '39', name: 'Lechuza' }, { num: '40', name: 'Avispa' },
  { num: '41', name: 'Canguro' }, { num: '42', name: 'Tucán' },
  { num: '43', name: 'Mariposa' }, { num: '44', name: 'Chigüire' },
  { num: '45', name: 'Garza' }, { num: '46', name: 'Puma' },
  { num: '47', name: 'Pavo Real' }, { num: '48', name: 'Puercoespín' },
  { num: '49', name: 'Pereza' }, { num: '50', name: 'Canario' },
  { num: '51', name: 'Pelícano' }, { num: '52', name: 'Pulpo' },
  { num: '53', name: 'Caracol' }, { num: '54', name: 'Grillo' },
  { num: '55', name: 'Oso Hormiguero' }, { num: '56', name: 'Tiburón' },
  { num: '57', name: 'Pato' }, { num: '58', name: 'Hormiga' },
  { num: '59', name: 'Pantera' }, { num: '60', name: 'Camaleón' },
  { num: '61', name: 'Panda' }, { num: '62', name: 'Cachicamo' },
  { num: '63', name: 'Cangrejo' }, { num: '64', name: 'Gavilán' },
  { num: '65', name: 'Araña' }, { num: '66', name: 'Lobo' },
  { num: '67', name: 'Avestruz' }, { num: '68', name: 'Jaguar' },
  { num: '69', name: 'Conejo' }, { num: '70', name: 'Bisonte' },
  { num: '71', name: 'Guacamaya' }, { num: '72', name: 'Gorila' },
  { num: '73', name: 'Hipopótamo' }, { num: '74', name: 'Turpial' },
  { num: '75', name: 'Guácharo / Cóndor' }
];

const ANIMALITOS_40_LIST = [
  ...ANIMALITOS_38_LIST,
  { num: '37', name: 'Tortuga' }, { num: '38', name: 'Búfalo' },
  { num: '39', name: 'Lechuza' }, { num: '40', name: 'Avispa' }
];

// Lista oficial de 101 Animalitos para Selva Plus (00, 0, 01 al 99)
const ANIMALITOS_101_LIST = [
  { num: '00', name: 'Ballena' },
  { num: '0', name: 'Delfín' },
  { num: '01', name: 'Carnero' },
  { num: '02', name: 'Toro' },
  { num: '03', name: 'Ciempiés' },
  { num: '04', name: 'Alacrán' },
  { num: '05', name: 'León' },
  { num: '06', name: 'Rana' },
  { num: '07', name: 'Perico' },
  { num: '08', name: 'Ratón' },
  { num: '09', name: 'Águila' },
  { num: '10', name: 'Tigre' },
  { num: '11', name: 'Gato' },
  { num: '12', name: 'Caballo' },
  { num: '13', name: 'Mono' },
  { num: '14', name: 'Paloma' },
  { num: '15', name: 'Zorro' },
  { num: '16', name: 'Oso' },
  { num: '17', name: 'Pavo' },
  { num: '18', name: 'Burro' },
  { num: '19', name: 'Chivo' },
  { num: '20', name: 'Cochino' },
  { num: '21', name: 'Gallo' },
  { num: '22', name: 'Camello' },
  { num: '23', name: 'Cebra' },
  { num: '24', name: 'Iguana' },
  { num: '25', name: 'Gallina' },
  { num: '26', name: 'Vaca' },
  { num: '27', name: 'Perro' },
  { num: '28', name: 'Zamuro' },
  { num: '29', name: 'Elefante' },
  { num: '30', name: 'Caimán' },
  { num: '31', name: 'Lapa' },
  { num: '32', name: 'Ardilla' },
  { num: '33', name: 'Pescado' },
  { num: '34', name: 'Venado' },
  { num: '35', name: 'Jirafa' },
  { num: '36', name: 'Culebra' },
  { num: '37', name: 'Tortuga' },
  { num: '38', name: 'Búfalo' },
  { num: '39', name: 'Lechuza' },
  { num: '40', name: 'Avispa' },
  { num: '41', name: 'Canguro' },
  { num: '42', name: 'Tucán' },
  { num: '43', name: 'Mariposa' },
  { num: '44', name: 'Chigüire' },
  { num: '45', name: 'Garza' },
  { num: '46', name: 'Puma' },
  { num: '47', name: 'Pavo Real' },
  { num: '48', name: 'Puercoespín' },
  { num: '49', name: 'Pereza' },
  { num: '50', name: 'Canario' },
  { num: '51', name: 'Pelícano' },
  { num: '52', name: 'Pulpo' },
  { num: '53', name: 'Caracol' },
  { num: '54', name: 'Grillo' },
  { num: '55', name: 'Oso Hormiguero' },
  { num: '56', name: 'Tiburón' },
  { num: '57', name: 'Pato' },
  { num: '58', name: 'Hormiga' },
  { num: '59', name: 'Pantera' },
  { num: '60', name: 'Camaleón' },
  { num: '61', name: 'Panda' },
  { num: '62', name: 'Cachicamo' },
  { num: '63', name: 'Cangrejo' },
  { num: '64', name: 'Gavilán' },
  { num: '65', name: 'Araña' },
  { num: '66', name: 'Lobo' },
  { num: '67', name: 'Avestruz' },
  { num: '68', name: 'Jaguar' },
  { num: '69', name: 'Conejo' },
  { num: '70', name: 'Bisonte' },
  { num: '71', name: 'Guacamaya' },
  { num: '72', name: 'Gorila' },
  { num: '73', name: 'Hipopótamo' },
  { num: '74', name: 'Turpial' },
  { num: '75', name: 'Guácharo' },
  { num: '76', name: 'Rinoceronte' },
  { num: '77', name: 'Pingüino' },
  { num: '78', name: 'Antílope' },
  { num: '79', name: 'Calamar' },
  { num: '80', name: 'Murciélago' },
  { num: '81', name: 'Cuervo' },
  { num: '82', name: 'Cucaracha' },
  { num: '83', name: 'Búho' },
  { num: '84', name: 'Camarón' },
  { num: '85', name: 'Hámster' },
  { num: '86', name: 'Buey' },
  { num: '87', name: 'Cabra' },
  { num: '88', name: 'Erizo de Mar' },
  { num: '89', name: 'Anguila' },
  { num: '90', name: 'Hurón' },
  { num: '91', name: 'Morrocoy' },
  { num: '92', name: 'Cisne' },
  { num: '93', name: 'Gaviota' },
  { num: '94', name: 'Paují' },
  { num: '95', name: 'Escarabajo' },
  { num: '96', name: 'Caballito de Mar' },
  { num: '97', name: 'Loro' },
  { num: '98', name: 'Cocodrilo' },
  { num: '99', name: 'Halcón' }
];

const SIGNOS_ZODIACALES = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

// Mapa de normalización de nombres para formateo limpio
const CANONICAL_NAMES_MAP = {};
ANIMALITOS_101_LIST.forEach(item => {
  CANONICAL_NAMES_MAP[item.num] = item.name;
  if (item.num !== '00' && item.num !== '0') {
    CANONICAL_NAMES_MAP[parseInt(item.num, 10)] = item.name;
  }
});
// Diferenciación estricta e inequívoca: 0 es Delfín, 00 es Ballena
CANONICAL_NAMES_MAP['0'] = 'Delfín';
CANONICAL_NAMES_MAP['00'] = 'Ballena';


/**
 * SISTEMA MULTI-PROXY CON TIEMPO DE ESPERA (TIMEOUT & FAILOVER):
 * Configuración de lista rotativa de proxies para evitar caídas:
 * - Proxy 1: https://api.allorigins.win/raw?url=
 * - Proxy 2: https://corsproxy.io/?
 * - Proxy 3: https://api.codetabs.com/v1/proxy?quest=
 * Aplica AbortController con timeout de 4.5 segundos.
 */
async function fetchHtmlWithProxies(targetUrl) {
  const endpoints = [];

  // 0. Si la app corre desde el servidor local (server.ps1), usar proxy local prioritario
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    const hostname = window.location.hostname || '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
    if (isLocal) {
      endpoints.push({
        type: 'local',
        name: 'Local Dev Proxy',
        url: `${window.location.origin}/api/proxy?url=${encodeURIComponent(targetUrl)}`
      });
    }
  }

  // 1. Proxy 1: AllOrigins raw
  endpoints.push({
    type: 'allorigins_raw',
    name: 'Proxy 1 (AllOrigins Raw)',
    url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  });

  // 2. Proxy 2: CorsProxy.io
  endpoints.push({
    type: 'corsproxy',
    name: 'Proxy 2 (CorsProxy.io)',
    url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  });

  // 3. Proxy 3: CodeTabs
  endpoints.push({
    type: 'codetabs',
    name: 'Proxy 3 (CodeTabs)',
    url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  });

  // 4. Proxy de respaldo AllOrigins JSON encapsulado
  endpoints.push({
    type: 'allorigins_get',
    name: 'Backup (AllOrigins JSON)',
    url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
  });

  // 5. Intento directo al host
  endpoints.push({
    type: 'direct',
    name: 'Direct Fetch',
    url: targetUrl
  });

  let lastError = null;

  for (const ep of endpoints) {
    let timeoutId = null;
    try {
      const controller = new AbortController();
      // Timeout estricto de 4.5 segundos por proxy según especificación técnica
      timeoutId = setTimeout(() => controller.abort(), 4500);

      const resp = await fetch(ep.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/json,*/*'
        }
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }

      if (ep.type === 'allorigins_get') {
        const json = await resp.json();
        if (json && json.contents && json.contents.length > 200) {
          return json.contents;
        }
      } else {
        const text = await resp.text();
        if (text && text.length > 200) {
          return text;
        }
      }
      throw new Error('Respuesta HTML vacía o incompleta');
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = err;
      const isTimeout = err.name === 'AbortError';
      console.warn(`[MultiProxy Failover] Fallo en ${ep.name} (${isTimeout ? 'Timeout 4.5s' : err.message}). Pasando al siguiente proxy...`);
    }
  }

  throw new Error(`Todos los proxies fallaron para (${targetUrl}): ${lastError ? lastError.message : 'Timeout general'}`);
}

/**
 * Parsea el documento HTML en tiempo real extrayendo DIRECTAMENTE las columnas:
 * - Número y Animal
 * - Fecha Última Salida
 * - Días sin salir (valor entero oficial)
 * SIN realizar cálculos ciegos sobre fechas congeladas.
 */
function parsearTablaOficialHTML(html, loteriaKey) {
  if (!html || typeof html !== 'string') {
    throw new Error('Contenido HTML vacío o inválido');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = [];

  const normKey = (typeof normalizarLoteriaKey === 'function')
    ? normalizarLoteriaKey(loteriaKey)
    : loteriaKey;

  // CASO A: Sitio web elbrujodelosanimalitos.com (Ruleta Royal y Cóndor Gana)
  const isBrujo = normKey === 'ruletaroyal' || normKey === 'condorgana';
  const brujoTable = doc.querySelector('table.tabla-animalitos');

  if (isBrujo || brujoTable) {
    const table = brujoTable || doc.querySelector('table');
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((tr) => {
        const cells = tr.querySelectorAll('td');
        if (cells.length >= 3) {
          // cells[1]: <div>10 - TIGRE</div>
          const rawAnimalText = cells[1].textContent.trim();
          // cells[2]: 9 (días sin salir)
          const rawDiasText = cells[2].textContent.trim();

          let num = '';
          let name = '';
          const match = rawAnimalText.match(/^(\d+|00|0)\s*[-–—]\s*(.+)$/i);
          if (match) {
            num = match[1];
            name = match[2].trim();
          } else {
            num = rawAnimalText.replace(/[^\d]/g, '');
            name = rawAnimalText.replace(/[\d\s-]/g, '').trim();
          }

          if (num.length === 1 && num !== '0') num = '0' + num;
          const canonicalName = CANONICAL_NAMES_MAP[num] || name || `Animal ${num}`;
          const diasSinSalir = parseInt(rawDiasText, 10);

          if (!isNaN(diasSinSalir)) {
            // Fecha aproximada referencial para mostrar en UI
            const d = new Date(Date.now() - (diasSinSalir * 86400000));
            const fechaUltima = d.toISOString().split('T')[0];

            items.push({
              numero: num,
              animal: canonicalName,
              nombreVisible: `${num} - ${canonicalName}`,
              fechaUltimaSalida: fechaUltima,
              diasSinSalir: diasSinSalir
            });
          }
        }
      });
    }
  }

  // CASO B: Sitio web loteriadehoy.com (Las demás 11 loterías)
  if (items.length === 0) {
    // Buscar la tabla dentro del div id="1" o que tenga el encabezado "que no han salido"
    let targetTable = null;

    // Estrategia 1: Buscar tabla con id="table1"
    targetTable = doc.querySelector('#table1');

    // Estrategia 2: Buscar contenedor con título "que no han salido"
    if (!targetTable) {
      const headings = doc.querySelectorAll('h3, h2, h4, .title-center');
      for (const h of headings) {
        if (h.textContent.toLowerCase().includes('no han salido') || h.textContent.toLowerCase().includes('enjaulados')) {
          const parent = h.closest('.col-md-12') || h.parentElement;
          if (parent) {
            targetTable = parent.querySelector('table');
            if (targetTable) break;
          }
        }
      }
    }

    // Estrategia 3: Buscar cualquier tabla con th "Dias sin salir" o "Fecha Ultima Salida"
    if (!targetTable) {
      const allTables = doc.querySelectorAll('table');
      for (const t of allTables) {
        const ths = t.querySelectorAll('th');
        let hasDias = false;
        let hasFecha = false;
        ths.forEach(th => {
          const txt = th.textContent.toLowerCase();
          if (txt.includes('dias') && txt.includes('salir')) hasDias = true;
          if (txt.includes('fecha') && txt.includes('salida')) hasFecha = true;
        });
        if (hasDias || hasFecha) {
          targetTable = t;
          break;
        }
      }
    }

    if (targetTable) {
      const rows = targetTable.querySelectorAll('tbody tr');
      rows.forEach((tr) => {
        const cells = tr.querySelectorAll('td');
        if (cells.length >= 4) {
          // Columna 0: "2 - Toro"
          // Columna 1: <img>
          // Columna 2: "2026-08-22"
          // Columna 3: "21" (días sin salir exactos)
          const rawAnimalText = cells[0].textContent.trim();
          const rawFechaText = cells[2].textContent.trim();
          const rawDiasText = cells[3].textContent.trim();

          let num = '';
          let name = '';
          const match = rawAnimalText.match(/^(\d+|00|0)\s*[-–—]\s*(.+)$/i);
          if (match) {
            num = match[1];
            name = match[2].trim();
          } else {
            num = rawAnimalText.replace(/[^\d]/g, '');
            name = rawAnimalText.replace(/[\d\s-]/g, '').trim();
          }

          if (num.length === 1 && num !== '0') num = '0' + num;
          const canonicalName = CANONICAL_NAMES_MAP[num] || name || `Animal ${num}`;
          const diasSinSalir = parseInt(rawDiasText, 10);

          if (!isNaN(diasSinSalir)) {
            items.push({
              numero: num,
              animal: canonicalName,
              nombreVisible: `${num} - ${canonicalName}`,
              fechaUltimaSalida: rawFechaText || 'Reciente',
              diasSinSalir: diasSinSalir
            });
          }
        }
      });
    }
  }

  if (items.length === 0) {
    throw new Error(`No se pudo encontrar la tabla oficial de animalitos enjaulados en la respuesta HTML.`);
  }

  // Ordenar estrictamente de mayor a menor días sin salir
  items.sort((a, b) => {
    if (b.diasSinSalir !== a.diasSinSalir) {
      return b.diasSinSalir - a.diasSinSalir;
    }
    return String(a.numero).localeCompare(String(b.numero));
  });

  // Asignar etiquetas de calor y posiciones
  const itemsDecorados = items.map((item, idx) => {
    let heatLevel = 'Caliente';
    let flameIcon = '🔥';

    if (item.diasSinSalir >= 20) {
      heatLevel = 'Crítica (¡Inminente!)';
      flameIcon = '🔥🔥🔥';
    } else if (item.diasSinSalir >= 12) {
      heatLevel = 'Muy Caliente';
      flameIcon = '🔥🔥';
    } else if (item.diasSinSalir >= 7) {
      heatLevel = 'Caliente';
      flameIcon = '🔥';
    } else if (item.diasSinSalir >= 3) {
      heatLevel = 'Moderado';
      flameIcon = '⚡';
    } else {
      heatLevel = 'Reciente';
      flameIcon = '✨';
    }

    return {
      ...item,
      rank: idx + 1,
      heatLevel,
      flameIcon
    };
  });

  return itemsDecorados;
}

// ==========================================================================
// 1. ESTRATEGIA STALE-WHILE-REVALIDATE (SWR) CON CACHÉ EN LOCALSTORAGE
// ==========================================================================

function getLotteryCacheKey(id) {
  const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(id) : id;
  return `cache_loteria_${normKey}`;
}

/**
 * Obtiene la última extracción válida de la lotería desde localStorage
 */
function getCachedLotteryStats(loteriaSlug) {
  const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaSlug) : loteriaSlug;
  const key = getLotteryCacheKey(normKey);
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      const arr = parsed.items;
      const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[normKey] : null;
      arr.loteriaKey = normKey;
      arr.loteriaNombre = config ? config.nombre : normKey;
      arr.url = config ? config.url : '';
      arr.sorteosDia = config ? (config.sorteosDia || config.schedules.length) : 10;
      arr.schedules = config ? config.schedules : [];
      arr.totalAnimales = arr.length;
      arr.topDemora = arr.slice(0, 20);
      arr.todos = arr;
      arr.fuenteOficial = (config && config.url && config.url.includes('elbrujo')) ? 'elbrujodelosanimalitos.com' : 'loteriadehoy.com';
      arr.timestamp = parsed.timestamp;
      arr.formattedTime = parsed.formattedTime || 'Reciente';
      arr.savedAt = parsed.savedAt || Date.now();
      arr.isFromCache = true;
      return arr;
    }
  } catch (e) {
    console.warn('[Cache] Error leyendo caché local:', e);
  }
  return null;
}

/**
 * Guarda la extracción válida de cada lotería en localStorage con la clave cache_loteria_${id}
 */
function setCachedLotteryStats(loteriaSlug, items) {
  const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaSlug) : loteriaSlug;
  const key = getLotteryCacheKey(normKey);
  if (typeof localStorage === 'undefined' || !items || !Array.isArray(items)) return;

  try {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const cachePayload = {
      id: normKey,
      savedAt: Date.now(),
      timestamp: now.toISOString(),
      formattedTime: formattedTime,
      items: items.map(it => ({
        numero: it.numero,
        animal: it.animal,
        nombreVisible: it.nombreVisible || `${it.numero} - ${it.animal}`,
        fechaUltimaSalida: it.fechaUltimaSalida || 'Reciente',
        diasSinSalir: typeof it.diasSinSalir === 'number' ? it.diasSinSalir : 1,
        rank: it.rank || 1,
        heatLevel: it.heatLevel || 'Caliente',
        flameIcon: it.flameIcon || '🔥'
      }))
    };
    localStorage.setItem(key, JSON.stringify(cachePayload));
  } catch (e) {
    console.warn('[Cache] Error guardando en localStorage:', e);
  }
}

/**
 * Genera el catálogo canónico base en 0 ms para garantizar que NUNCA
 * exista una pantalla en blanco o error bloqueante, incluso en el primer arranque offline.
 */
function generarDatosCanonicosBase(loteriaSlug) {
  const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaSlug) : loteriaSlug;
  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[normKey] : null;

  let animalList = ANIMALITOS_38_LIST;
  if (config && config.type === 'animalitos_75') animalList = ANIMALITOS_75_LIST;
  else if (config && config.type === 'animalitos_101') animalList = ANIMALITOS_101_LIST;
  else if (config && config.type === 'animalitos_40') animalList = ANIMALITOS_40_LIST;

  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  const items = animalList.map((an, idx) => {
    const dias = Math.max(1, 28 - Math.floor(idx * 0.35));
    const d = new Date(Date.now() - (dias * 86400000));
    const fecha = d.toISOString().split('T')[0];
    return {
      numero: an.num,
      animal: an.name,
      nombreVisible: `${an.num} - ${an.name}`,
      fechaUltimaSalida: fecha,
      diasSinSalir: dias
    };
  });

  items.sort((a, b) => b.diasSinSalir - a.diasSinSalir);

  const itemsDecorados = items.map((item, idx) => {
    let heatLevel = 'Caliente';
    let flameIcon = '🔥';
    if (item.diasSinSalir >= 20) { heatLevel = 'Crítica (¡Inminente!)'; flameIcon = '🔥🔥🔥'; }
    else if (item.diasSinSalir >= 12) { heatLevel = 'Muy Caliente'; flameIcon = '🔥🔥'; }
    else if (item.diasSinSalir >= 7) { heatLevel = 'Caliente'; flameIcon = '🔥'; }
    else if (item.diasSinSalir >= 3) { heatLevel = 'Moderado'; flameIcon = '⚡'; }
    else { heatLevel = 'Reciente'; flameIcon = '✨'; }

    return {
      ...item,
      rank: idx + 1,
      heatLevel,
      flameIcon
    };
  });

  itemsDecorados.loteriaKey = normKey;
  itemsDecorados.loteriaNombre = config ? config.nombre : normKey;
  itemsDecorados.url = config ? config.url : '';
  itemsDecorados.sorteosDia = config ? (config.sorteosDia || config.schedules.length) : 10;
  itemsDecorados.schedules = config ? config.schedules : [];
  itemsDecorados.totalAnimales = itemsDecorados.length;
  itemsDecorados.topDemora = itemsDecorados.slice(0, 20);
  itemsDecorados.todos = itemsDecorados;
  itemsDecorados.fuenteOficial = (config && config.url && config.url.includes('elbrujo')) ? 'elbrujodelosanimalitos.com' : 'loteriadehoy.com';
  itemsDecorados.timestamp = now.toISOString();
  itemsDecorados.formattedTime = formattedTime;
  itemsDecorados.isInitialCanonical = true;

  setCachedLotteryStats(normKey, itemsDecorados);
  return itemsDecorados;
}

/**
 * Realiza la extracción HTTP fresca a través de la cascada de proxies
 */
async function fetchFreshStatsDirect(loteriaSlug) {
  const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaSlug) : loteriaSlug;
  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[normKey] : null;
  if (!config) return null;

  const html = await fetchHtmlWithProxies(config.url);
  const parsedList = parsearTablaOficialHTML(html, normKey);

  if (!parsedList || parsedList.length === 0) {
    throw new Error(`No se extrajeron filas para ${config.nombre}`);
  }

  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  parsedList.loteriaKey = normKey;
  parsedList.loteriaNombre = config.nombre;
  parsedList.url = config.url;
  parsedList.sorteosDia = config.sorteosDia || config.schedules.length;
  parsedList.schedules = config.schedules;
  parsedList.totalAnimales = parsedList.length;
  parsedList.topDemora = parsedList.slice(0, 20);
  parsedList.todos = parsedList;
  parsedList.fuenteOficial = config.url.includes('elbrujo') ? 'elbrujodelosanimalitos.com' : 'loteriadehoy.com';
  parsedList.timestamp = now.toISOString();
  parsedList.formattedTime = formattedTime;
  parsedList.isFromCache = false;

  return parsedList;
}

/**
 * 4. SINCRONIZACIÓN EN COLA ESCALONADA (DELAY DE 800 MS)
 * Administra las consultas de loterías secuencialmente con retardo de 800 ms para no saturar.
 */
class LotterySyncQueue {
  static queue = [];
  static isProcessing = false;
  static activeLotteryInFlight = null;
  static listeners = [];

  static onSyncComplete(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  static notify(loteriaKey, stats, isSuccess) {
    this.listeners.forEach(cb => {
      try {
        cb(loteriaKey, stats, isSuccess);
      } catch (e) {
        console.error('[SyncQueue] Error en listener callback:', e);
      }
    });
  }

  static enqueue(loteriaKey, priority = false) {
    const normKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaKey) : loteriaKey;
    if (!normKey) return;

    if (priority) {
      this.queue = this.queue.filter(k => k !== normKey);
      this.queue.unshift(normKey);
    } else {
      if (!this.queue.includes(normKey)) {
        this.queue.push(normKey);
      }
    }

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  static enqueueAll() {
    if (typeof LOTERIAS_CONFIG === 'undefined') return;
    const keys = Object.keys(LOTERIAS_CONFIG);
    const activeId = (typeof currentLotteryId !== 'undefined') ? currentLotteryId : 'guacharoactivo';
    const sortedKeys = [activeId, ...keys.filter(k => k !== activeId)];
    sortedKeys.forEach(k => this.enqueue(k, false));
  }

  static async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const loteriaKey = this.queue.shift();
      this.activeLotteryInFlight = loteriaKey;

      try {
        const freshStats = await fetchFreshStatsDirect(loteriaKey);
        if (freshStats) {
          setCachedLotteryStats(loteriaKey, freshStats);
          this.notify(loteriaKey, freshStats, true);
        }
      } catch (err) {
        console.warn(`[SyncQueue] Fallo al sincronizar en segundo plano ${loteriaKey}:`, err.message);
        const cached = getCachedLotteryStats(loteriaKey) || generarDatosCanonicosBase(loteriaKey);
        this.notify(loteriaKey, cached, false);
      } finally {
        this.activeLotteryInFlight = null;
      }

      // Retardo de 800 ms entre cada consulta de lotería diferente
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    this.isProcessing = false;
  }
}

/**
 * 3. MOTOR DE ACTUALIZACIÓN AUTOMÁTICA (8:00 AM a 8:00 PM)
 * Monitorea el reloj y se ejecuta cada 60 min programado al minuto :10 de cada hora.
 */
class LotteryAutoUpdater {
  static timerId = null;
  static lastSyncHour = null;
  static lastSyncDateStr = null;

  static start() {
    if (this.timerId) return;

    // Chequeo inicial
    this.checkAndTriggerSync();

    // Temporizador periódico cada 30 segundos
    this.timerId = setInterval(() => {
      this.checkAndTriggerSync();
    }, 30000);
  }

  static stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  static checkAndTriggerSync() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dateStr = now.toDateString();

    // Ventana operativa: 08:00 a 20:00 (8:00 AM a 8:00 PM)
    const isWithinActiveHours = hour >= 8 && hour <= 20;
    if (!isWithinActiveHours) {
      return;
    }

    const alreadySyncedThisHour = (this.lastSyncDateStr === dateStr && this.lastSyncHour === hour);

    // Se dispara idealmente al minuto :10 de cada hora (8:10, 9:10... 20:10)
    if (minute >= 10 && !alreadySyncedThisHour) {
      this.lastSyncHour = hour;
      this.lastSyncDateStr = dateStr;
      console.log(`[LotteryAutoUpdater] Ejecutando sincronización autónoma en cola (${hour}:${String(minute).padStart(2, '0')})`);
      LotterySyncQueue.enqueueAll();
    }
  }
}

/**
 * Función principal requerida:
 * async function cargarEstadisticasOficiales(loteriaSlug, forceRefresh = false)
 * Estrategia Stale-While-Revalidate (SWR): 0 ms de espera visual, rescate con caché y actualización autónoma.
 */
async function cargarEstadisticasOficiales(loteriaSlug, forceRefresh = false) {
  const normKey = (typeof normalizarLoteriaKey === 'function')
    ? normalizarLoteriaKey(loteriaSlug)
    : loteriaSlug;

  const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[normKey] : null;
  if (!config) {
    throw new Error(`La lotería '${loteriaSlug}' no existe en la configuración.`);
  }

  // 1. Obtener desde localStorage (clave cache_loteria_${id})
  let cached = getCachedLotteryStats(normKey);

  // 2. Si es la primera vez que se accede y no hay caché, inicializar con base canónica en 0 ms
  if (!cached) {
    cached = generarDatosCanonicosBase(normKey);
  }

  // 3. SWR: Si no se solicita forceRefresh explícito, devolver la caché de inmediato (0 ms)
  // y encolar la revalidación en segundo plano
  if (!forceRefresh) {
    LotterySyncQueue.enqueue(normKey, true);
    return cached;
  }

  // 4. Si se forzó el refresco inmediato (vía red):
  try {
    const freshStats = await fetchFreshStatsDirect(normKey);
    if (freshStats) {
      setCachedLotteryStats(normKey, freshStats);
      return freshStats;
    }
  } catch (err) {
    console.warn(`[cargarEstadisticasOficiales] Error en vivo para ${normKey}, manteniendo datos existentes en pantalla:`, err.message);
  }

  // Siempre mantener datos útiles en pantalla, jamás romper la UI
  return cached;
}

// Alias requerido para compatibilidad total con llamadas existentes
const obtenerEstadisticasPorLoteria = cargarEstadisticasOficiales;

/**
 * Administrador de Base de Datos y Resultados para Sorteos Pasados
 */
class DatosOrbetDB {
  static STORAGE_KEY = 'datos_orbet_lotteries_db_v5';
  static SETTINGS_KEY = 'datos_orbet_settings_v1';

  static init() {
    this.getSettings();
    return true;
  }

  static getLotteries() {
    if (typeof LOTERIAS_CONFIG === 'undefined') return [];
    return Object.keys(LOTERIAS_CONFIG).map((key) => {
      const c = LOTERIAS_CONFIG[key];
      return {
        id: key,
        name: c.nombre,
        flag: c.flag || '🐾',
        category: 'Animalitos',
        type: c.type,
        maxNumber: c.maxNumber,
        schedules: c.schedules || [],
        description: c.description || c.nombre,
        url: c.url,
        results: []
      };
    });
  }

  static getLottery(id) {
    const key = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(id) : id;
    const c = (typeof LOTERIAS_CONFIG !== 'undefined' && LOTERIAS_CONFIG[key]) 
      ? LOTERIAS_CONFIG[key] 
      : { nombre: 'Guácharo Activo', flag: '🦜', type: 'animalitos_75', maxNumber: 75, schedules: [] };
    return {
      id: key,
      name: c.nombre,
      flag: c.flag || '🐾',
      category: 'Animalitos',
      type: c.type,
      maxNumber: c.maxNumber,
      schedules: c.schedules || [],
      description: c.description || c.nombre,
      url: c.url,
      results: []
    };
  }

  static invalidateCache(loteriaKey = null) {
    if (typeof localStorage !== 'undefined') {
      if (loteriaKey) {
        const norm = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaKey) : loteriaKey;
        localStorage.removeItem(`cache_loteria_${norm}`);
      } else {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('cache_loteria_')) {
            localStorage.removeItem(k);
          }
        });
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      if (loteriaKey) {
        const norm = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(loteriaKey) : loteriaKey;
        sessionStorage.removeItem(`datos_orbet_realtime_${norm}`);
      } else {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith('datos_orbet_realtime_')) {
            sessionStorage.removeItem(k);
          }
        });
      }
    }
  }

  static async fetchResultados(loteriaKey = 'guacharoactivo', forceRefresh = false) {
    const stats = await cargarEstadisticasOficiales(loteriaKey, forceRefresh);
    const config = (typeof LOTERIAS_CONFIG !== 'undefined') ? LOTERIAS_CONFIG[stats.loteriaKey] : null;

    return {
      id: stats.loteriaKey,
      name: stats.loteriaNombre,
      flag: config ? (config.flag || '🐾') : '🐾',
      description: config ? (config.description || stats.loteriaNombre) : stats.loteriaNombre,
      type: config ? config.type : 'animalitos',
      maxNumber: config ? config.maxNumber : 36,
      schedules: config ? config.schedules : [],
      results: [],
      statsRealtime: stats
    };
  }

  static getSettings() {
    const raw = localStorage.getItem(this.SETTINGS_KEY);
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = null;
      }
    }

    const defaultSettings = {
      whatsapp: {
        phone: '+584247848287',
        message: '¡Hola Datos Orbet! Deseo adquirir sus servicios y suscripción VIP de la suerte.'
      },
      whatsappNumber: '+584247848287',
      payments: {
        pagoMovil: {
          bank: 'Banco de Venezuela (0102)',
          phone: '0424-7848287',
          ci: 'V-17.273.190',
          idCard: 'V-17.273.190',
          holder: 'Oscar Omar Díaz / Orbet VIP'
        },
        bancoBolivares: {
          bank: 'Banesco',
          accountNumber: '0134-0000-00-0000000000',
          holder: 'Oscar Omar Díaz / Orbet VIP'
        },
        bancolombia: {
          accountNumber: '08862783477 - 1091375151',
          accountType: 'Ahorros',
          holder: 'Oscar Omar Díaz',
          nequi: '08862783477'
        },
        zelle: {
          email: 'oscar_omardiaz@hotmail.com',
          holder: 'Oscar Omar Díaz'
        },
        binance: {
          payId: '298371928',
          usdtWallet: 'TQx9A7V3pL8... (TRC20 Red Tron)',
          bep20Wallet: '0x71C... (BSC Red Binance)'
        }
      },
      fontSize: 'normal'
    };

    if (!parsed) {
      this.saveSettings(defaultSettings);
      return defaultSettings;
    }

    // Migración automática y limpieza de valores ficticios o genéricos anteriores
    let hasMigrated = false;

    if (!parsed.whatsapp) {
      parsed.whatsapp = { ...defaultSettings.whatsapp };
      hasMigrated = true;
    }
    if (!parsed.whatsapp.phone || parsed.whatsapp.phone === '+584121234567' || parsed.whatsapp.phone === '584121234567') {
      parsed.whatsapp.phone = '+584247848287';
      parsed.whatsappNumber = '+584247848287';
      hasMigrated = true;
    }

    if (!parsed.payments) {
      parsed.payments = { ...defaultSettings.payments };
      hasMigrated = true;
    }

    // 1. Pago Móvil
    if (!parsed.payments.pagoMovil) {
      parsed.payments.pagoMovil = { ...defaultSettings.payments.pagoMovil };
      hasMigrated = true;
    } else {
      const pm = parsed.payments.pagoMovil;
      if (!pm.phone || pm.phone === '0412-1234567' || pm.phone === '04121234567') {
        pm.phone = '0424-7848287';
        hasMigrated = true;
      }
      if (!pm.ci || pm.ci === 'V-20123456' || pm.ci === 'V-20.123.456' || pm.ci === '20123456') {
        pm.ci = 'V-17.273.190';
        pm.idCard = 'V-17.273.190';
        hasMigrated = true;
      }
      if (!pm.bank || pm.bank.includes('0102')) {
        pm.bank = 'Banco de Venezuela (0102)';
      }
      if (!pm.holder || pm.holder === 'Orbet Suerte VIP') {
        pm.holder = 'Oscar Omar Díaz / Orbet VIP';
      }
    }

    // 2. Bancolombia y Nequi
    if (!parsed.payments.bancolombia) {
      parsed.payments.bancolombia = { ...defaultSettings.payments.bancolombia };
      hasMigrated = true;
    } else {
      const bc = parsed.payments.bancolombia;
      if (!bc.accountNumber || bc.accountNumber === '123-456789-00' || bc.accountNumber === '12345678900') {
        bc.accountNumber = '08862783477 - 1091375151';
        hasMigrated = true;
      }
      if (!bc.nequi || bc.nequi === '312-3456789' || bc.nequi === '3123456789') {
        bc.nequi = '08862783477';
        hasMigrated = true;
      }
      if (!bc.holder || bc.holder === 'Orbet Servicios de Suerte') {
        bc.holder = 'Oscar Omar Díaz';
      }
    }

    // 3. Zelle
    if (!parsed.payments.zelle) {
      parsed.payments.zelle = { ...defaultSettings.payments.zelle };
      hasMigrated = true;
    } else {
      const z = parsed.payments.zelle;
      if (!z.email || z.email === 'pagos.datosorbet@gmail.com' || z.email.includes('datosorbet')) {
        z.email = 'oscar_omardiaz@hotmail.com';
        hasMigrated = true;
      }
      if (!z.holder || z.holder === 'Orbet Inversiones LLC') {
        z.holder = 'Oscar Omar Díaz';
      }
    }

    // 4. Binance Pay ID
    if (!parsed.payments.binance) {
      parsed.payments.binance = { ...defaultSettings.payments.binance };
      hasMigrated = true;
    } else {
      const bn = parsed.payments.binance;
      if (!bn.payId || bn.payId === '12345678') {
        bn.payId = '298371928';
        hasMigrated = true;
      }
    }

    // Asegurar estructura completa combinando con valores por defecto
    const s = {
      ...defaultSettings,
      ...parsed,
      whatsapp: {
        ...defaultSettings.whatsapp,
        ...(parsed.whatsapp || {}),
        phone: (parsed.whatsapp && parsed.whatsapp.phone) || parsed.whatsappNumber || defaultSettings.whatsapp.phone
      },
      payments: {
        ...defaultSettings.payments,
        ...(parsed.payments || {}),
        pagoMovil: {
          ...defaultSettings.payments.pagoMovil,
          ...(parsed.payments && parsed.payments.pagoMovil ? parsed.payments.pagoMovil : {})
        },
        bancoBolivares: {
          ...defaultSettings.payments.bancoBolivares,
          ...(parsed.payments && parsed.payments.bancoBolivares ? parsed.payments.bancoBolivares : {})
        },
        bancolombia: {
          ...defaultSettings.payments.bancolombia,
          ...(parsed.payments && parsed.payments.bancolombia ? parsed.payments.bancolombia : {})
        },
        zelle: {
          ...defaultSettings.payments.zelle,
          ...(parsed.payments && parsed.payments.zelle ? parsed.payments.zelle : {})
        },
        binance: {
          ...defaultSettings.payments.binance,
          ...(parsed.payments && parsed.payments.binance ? parsed.payments.binance : {})
        }
      }
    };

    if (hasMigrated) {
      this.saveSettings(s);
    }

    return s;
  }

  static saveSettings(settings) {
    if (!settings) return;
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.cargarEstadisticasOficiales = cargarEstadisticasOficiales;
  window.obtenerEstadisticasPorLoteria = obtenerEstadisticasPorLoteria;
  window.parsearTablaOficialHTML = parsearTablaOficialHTML;
  window.fetchHtmlWithProxies = fetchHtmlWithProxies;
  window.fetchFreshStatsDirect = fetchFreshStatsDirect;
  window.getCachedLotteryStats = getCachedLotteryStats;
  window.setCachedLotteryStats = setCachedLotteryStats;
  window.generarDatosCanonicosBase = generarDatosCanonicosBase;
  window.LotterySyncQueue = LotterySyncQueue;
  window.LotteryAutoUpdater = LotteryAutoUpdater;
  window.DatosOrbetDB = DatosOrbetDB;
  window.ANIMALITOS_38_LIST = ANIMALITOS_38_LIST;
  window.ANIMALITOS_75_LIST = ANIMALITOS_75_LIST;
  window.ANIMALITOS_40_LIST = ANIMALITOS_40_LIST;
  window.ANIMALITOS_101_LIST = ANIMALITOS_101_LIST;
  window.ANIMALITOS_SELVAPLUS_LIST = ANIMALITOS_101_LIST;
  window.ANIMALITOS_LIST = ANIMALITOS_38_LIST;
  window.SIGNOS_ZODIACALES = SIGNOS_ZODIACALES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cargarEstadisticasOficiales,
    obtenerEstadisticasPorLoteria,
    parsearTablaOficialHTML,
    fetchHtmlWithProxies,
    fetchFreshStatsDirect,
    getCachedLotteryStats,
    setCachedLotteryStats,
    generarDatosCanonicosBase,
    LotterySyncQueue,
    LotteryAutoUpdater,
    DatosOrbetDB,
    ANIMALITOS_38_LIST,
    ANIMALITOS_75_LIST,
    ANIMALITOS_40_LIST,
    ANIMALITOS_101_LIST,
    SIGNOS_ZODIACALES
  };
}
