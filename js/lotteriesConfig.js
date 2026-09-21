// ==========================================================================
// DATOS ORBET - DICCIONARIO CENTRALIZADO DE LOTERÍAS (DATA MAPPING)
// Archivo: js/lotteriesConfig.js
// ==========================================================================

const LOTERIAS_CONFIG = {
  // 1. Guácharo Activo: 12 sorteos al día (8:00 AM a 7:00 PM)
  guacharoactivo: {
    nombre: "Guácharo Activo",
    url: "https://loteriadehoy.com/animalito/guacharoactivo/estadisticas/",
    flag: "🦜",
    type: "animalitos_75",
    maxNumber: 75,
    sorteosDia: 12,
    schedules: [
      "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
      "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
      "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
    ],
    description: "Guácharo Activo de 75 Figuras (12 Sorteos Diarios)"
  },

  // 2. Guacharito Millonario: 12 sorteos al día (8:30 AM a 7:30 PM)
  guacharitoactivo: {
    nombre: "Guacharito Millonario",
    url: "https://loteriadehoy.com/animalito/elguacharitomillonario/estadisticas/",
    flag: "🐣",
    type: "animalitos_75",
    maxNumber: 75,
    sorteosDia: 12,
    schedules: [
      "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
      "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM",
      "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"
    ],
    description: "El Guacharito Millonario (12 Sorteos Diarios)"
  },

  // 3. Lotto Activo: 11 sorteos al día (8:00 AM a 7:00 PM)
  lottoactivo: {
    nombre: "Lotto Activo",
    url: "https://loteriadehoy.com/animalito/lottoactivo/estadisticas/",
    flag: "🐬",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 11,
    schedules: [
      "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
      "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
      "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
    ],
    description: "Lotto Activo Oficial de Venezuela (11 Sorteos Diarios)"
  },

  // 4. La Granjita: 11 sorteos al día (9:00 AM a 7:00 PM)
  lagranjita: {
    nombre: "La Granjita",
    url: "https://loteriadehoy.com/animalito/lagranjita/estadisticas/",
    flag: "🐸",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 11,
    schedules: [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
      "05:00 PM", "06:00 PM", "07:00 PM"
    ],
    description: "La Granjita de Animalitos (11 Sorteos Diarios)"
  },

  // 5. Granja Millonaria (El Granjazo): 10 sorteos al día (9:30 AM a 8:30 PM)
  granjamillonaria: {
    nombre: "Granja Millonaria",
    url: "https://loteriadehoy.com/animalito/granjamillionaria/estadisticas/",
    flag: "🌾",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 10,
    schedules: [
      "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM",
      "01:30 PM", "02:30 PM", "04:30 PM", "05:30 PM",
      "06:30 PM", "08:30 PM"
    ],
    description: "Granja Millonaria / El Granjazo (10 Sorteos Diarios)"
  },

  // 6. Ruleta Royal: 13 sorteos al día (8:30 AM a 8:30 PM)
  ruletaroyal: {
    nombre: "Ruleta Royal",
    url: "https://elbrujodelosanimalitos.com/animalitos-enjaulados-ruleta-royal/",
    flag: "👑",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 13,
    schedules: [
      "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
      "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM",
      "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM",
      "08:30 PM"
    ],
    description: "Ruleta Royal (13 Sorteos Diarios)"
  },

  // 7. Lotto Rey: 12 sorteos al día (8:30 AM a 7:30 PM)
  lottorey: {
    nombre: "Lotto Rey",
    url: "https://loteriadehoy.com/animalito/lottorey/estadisticas/",
    flag: "🦁",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 12,
    schedules: [
      "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
      "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM",
      "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"
    ],
    description: "Lotto Rey (12 Sorteos Diarios)"
  },

  // 8. Selva Plus: 13 sorteos al día (8:15 AM a 8:15 PM) - 101 Animalitos (00, 0, 01 al 99)
  selvaplus: {
    nombre: "Selva Plus",
    url: "https://loteriadehoy.com/animalito/selvaplus/estadisticas/",
    flag: "🌴",
    type: "animalitos_101",
    maxNumber: 99,
    sorteosDia: 13,
    schedules: [
      "08:15 AM", "09:15 AM", "10:15 AM", "11:15 AM",
      "12:15 PM", "01:15 PM", "02:15 PM", "03:15 PM",
      "04:15 PM", "05:15 PM", "06:15 PM", "07:15 PM",
      "08:15 PM"
    ],
    description: "Selva Plus Millonario (101 Animalitos - 13 Sorteos Diarios)"
  },

  // 9. Condor Gana: 11 sorteos al día (9:00 AM a 7:00 PM)
  condorgana: {
    nombre: "Condor Gana",
    url: "https://elbrujodelosanimalitos.com/animalitos-enjaulados-condor-gana/",
    flag: "🦅",
    type: "animalitos_75",
    maxNumber: 75,
    sorteosDia: 11,
    schedules: [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
      "05:00 PM", "06:00 PM", "07:00 PM"
    ],
    description: "Cóndor Gana (11 Sorteos Diarios)"
  },

  // 10. Centena Plus: 13 sorteos al día (8:15 AM a 8:15 PM)
  centenaplus: {
    nombre: "Centena Plus",
    url: "https://loteriadehoy.com/animalito/centenaplus/estadisticas/",
    flag: "💯",
    type: "centena_animalitos",
    maxNumber: 36,
    sorteosDia: 13,
    schedules: [
      "08:15 AM", "09:15 AM", "10:15 AM", "11:15 AM",
      "12:15 PM", "01:15 PM", "02:15 PM", "03:15 PM",
      "04:15 PM", "05:15 PM", "06:15 PM", "07:15 PM",
      "08:15 PM"
    ],
    description: "Centena Plus con Animalitos (13 Sorteos Diarios)"
  },

  // 11. Mega Animal 40: 12 sorteos al día (9:00 AM a 8:00 PM)
  megaanimal40: {
    nombre: "Mega Animal 40",
    url: "https://loteriadehoy.com/animalito/megaanimal40/estadisticas/",
    flag: "🦏",
    type: "animalitos_40",
    maxNumber: 40,
    sorteosDia: 12,
    schedules: [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
      "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ],
    description: "Mega Animal 40 (12 Sorteos Diarios)"
  },

  // 12. La Ricachona: 11 a 12 sorteos al día (9:15 AM a 7:15 PM)
  laricachona: {
    nombre: "La Ricachona",
    url: "https://loteriadehoy.com/animalito/la-ricachona/estadisticas/",
    flag: "💰",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 11,
    schedules: [
      "09:15 AM", "10:15 AM", "11:15 AM", "12:15 PM",
      "01:15 PM", "02:15 PM", "03:15 PM", "04:15 PM",
      "05:15 PM", "06:15 PM", "07:15 PM"
    ],
    description: "La Ricachona de Animalitos (11 Sorteos Diarios)"
  },

  // 13. Loto Chaima: 12 sorteos al día (8:30 AM a 7:30 PM)
  lotochaima: {
    nombre: "Loto Chaima",
    url: "https://loteriadehoy.com/animalito/lotochaima/estadisticas/",
    flag: "🏹",
    type: "animalitos",
    maxNumber: 36,
    sorteosDia: 12,
    schedules: [
      "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
      "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM",
      "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"
    ],
    description: "Loto Chaima de Oriente (12 Sorteos Diarios)"
  },

  // Centena Animalitos (compatibilidad con selector)
  centenaanimalitos: {
    nombre: "Centena Animalitos",
    url: "https://loteriadehoy.com/animalito/centenaanimalitos/estadisticas/",
    flag: "🔢",
    type: "centena_animalitos",
    maxNumber: 36,
    sorteosDia: 6,
    schedules: ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM", "06:00 PM", "07:00 PM"],
    description: "Centena de Animalitos Tradicional"
  }
};

/**
 * Normaliza cualquier clave o slug recibido hacia la clave canónica en LOTERIAS_CONFIG.
 */
function normalizarLoteriaKey(key) {
  if (!key) return 'guacharoactivo';
  const clean = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (clean === 'guacharo' || clean === 'guacharoactivo') return 'guacharoactivo';
  if (clean === 'guacharito' || clean === 'guacharitoactivo' || clean === 'elguacharitomillonario' || clean === 'guacharitomillonario') return 'guacharitoactivo';
  if (clean === 'condorgana' || clean === 'condor') return 'condorgana';
  if (clean === 'lottoactivo') return 'lottoactivo';
  if (clean === 'lagranjita') return 'lagranjita';
  if (clean === 'granjamillonaria' || clean === 'granjamillionaria' || clean === 'elgranjazo') return 'granjamillonaria';
  if (clean === 'ruletaroyal') return 'ruletaroyal';
  if (clean === 'lottorey') return 'lottorey';
  if (clean === 'selvaplus') return 'selvaplus';
  if (clean === 'centenaplus') return 'centenaplus';
  if (clean === 'megaanimal40' || clean === 'megaanimal') return 'megaanimal40';
  if (clean === 'centenaanimalitos') return 'centenaanimalitos';
  if (clean === 'laricachona' || clean === 'ricachona') return 'laricachona';
  if (clean === 'lotochaima' || clean === 'chaima') return 'lotochaima';

  return LOTERIAS_CONFIG[clean] ? clean : (LOTERIAS_CONFIG[key] ? key : 'guacharoactivo');
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.LOTERIAS_CONFIG = LOTERIAS_CONFIG;
  window.normalizarLoteriaKey = normalizarLoteriaKey;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LOTERIAS_CONFIG, normalizarLoteriaKey };
}
