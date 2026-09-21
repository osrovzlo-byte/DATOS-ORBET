// ==========================================================================
// DATOS ORBET - MOTOR DE PRONÓSTICOS Y DATOS ALTERNATIVOS
// Inspirado en juegoactivo.com/datos/animalitos
// Archivo: js/juegoActivoEngine.js
// ==========================================================================

class JuegoActivoEngine {
  /**
   * Genera los pronósticos y juegos de datos alternativos para una lotería y fecha dada
   */
  static generatePronosticos(loteriaKey = 'guacharoactivo', customDate = null) {
    const key = (typeof normalizarLoteriaKey === 'function') 
      ? normalizarLoteriaKey(loteriaKey) 
      : loteriaKey;
      
    const config = (typeof LOTERIAS_CONFIG !== 'undefined' && LOTERIAS_CONFIG[key])
      ? LOTERIAS_CONFIG[key]
      : { nombre: 'Guácharo Activo', type: 'animalitos_75', maxNumber: 75 };

    const dateObj = customDate ? new Date(customDate) : new Date();
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const dateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    // Obtener universo de animales
    let universe = typeof ANIMALITOS_38_LIST !== 'undefined' ? ANIMALITOS_38_LIST : [];
    if ((config.type === 'animalitos_101' || key === 'selvaplus') && typeof ANIMALITOS_101_LIST !== 'undefined') {
      universe = ANIMALITOS_101_LIST;
    } else if (config.type === 'animalitos_75' && typeof ANIMALITOS_75_LIST !== 'undefined') {
      universe = ANIMALITOS_75_LIST;
    } else if (config.type === 'animalitos_40' && typeof ANIMALITOS_40_LIST !== 'undefined') {
      universe = ANIMALITOS_40_LIST;
    }

    // Semilla determinística basada en fecha y lotería para consistencia diaria
    let seed = 0;
    const keyStr = `${key}-${year}-${month}-${day}`;
    for (let i = 0; i < keyStr.length; i++) {
      seed = (seed * 31 + keyStr.charCodeAt(i)) % 100000;
    }

    const pseudoRand = (offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const getAnimalAt = (index) => {
      const idx = Math.abs(index) % universe.length;
      return universe[idx] || universe[0];
    };

    // 1. DATO FIJO DEL DÍA (El animal con mayor fuerza)
    const fijoIdx = Math.floor(pseudoRand(1) * universe.length);
    const animalFijo = getAnimalAt(fijoIdx);
    const fijoProb = Math.floor(88 + pseudoRand(2) * 10); // 88% a 97%
    const schedules = config.schedules || ['10:00 AM', '01:00 PM', '04:00 PM'];
    const horarioFijo = schedules[Math.floor(pseudoRand(3) * schedules.length)];

    // 2. LOS 2 MÁS FUERTES (La Morocha de Oro)
    const morochaIdx1 = Math.floor(pseudoRand(4) * universe.length);
    let morochaIdx2 = Math.floor(pseudoRand(5) * universe.length);
    if (morochaIdx2 === morochaIdx1) morochaIdx2 = (morochaIdx1 + 5) % universe.length;
    const animalMorocha1 = getAnimalAt(morochaIdx1);
    const animalMorocha2 = getAnimalAt(morochaIdx2);

    // 3. EL BOMBAZO / ANIMALITO SORPRESA (Tapado)
    const sorpresaIdx = Math.floor(pseudoRand(6) * universe.length);
    const animalSorpresa = getAnimalAt(sorpresaIdx);

    // 4. LA SERIE CALIENTE DEL DÍA
    const seriesCatalogo = [
      {
        nombre: 'Serie de las Aves',
        icono: '🦅',
        animales: [
          { num: '07', name: 'Perico' },
          { num: '09', name: 'Águila' },
          { num: '14', name: 'Paloma' },
          { num: '17', name: 'Pavo' }
        ]
      },
      {
        nombre: 'Serie de los Felinos',
        icono: '🦁',
        animales: [
          { num: '05', name: 'León' },
          { num: '10', name: 'Tigre' },
          { num: '11', name: 'Gato' },
          { num: '59', name: 'Pantera' }
        ]
      },
      {
        nombre: 'Serie de Cuadrúpedos',
        icono: '🐎',
        animales: [
          { num: '02', name: 'Toro' },
          { num: '12', name: 'Caballo' },
          { num: '18', name: 'Burro' },
          { num: '23', name: 'Cebra' }
        ]
      },
      {
        nombre: 'Serie Acuática',
        icono: '🐬',
        animales: [
          { num: '00', name: 'Ballena' },
          { num: '0', name: 'Delfín' },
          { num: '30', name: 'Caimán' },
          { num: '33', name: 'Pescado' }
        ]
      }
    ];
    const serieSeleccionada = seriesCatalogo[Math.floor(pseudoRand(7) * seriesCatalogo.length)];

    // 5. LA ESTRELLA DE LA SUERTE (PENTALFA: 5 animales)
    const estrellaAnimals = [];
    const usedIndices = new Set([fijoIdx, morochaIdx1, morochaIdx2, sorpresaIdx]);
    for (let k = 8; estrellaAnimals.length < 5; k++) {
      const idx = Math.floor(pseudoRand(k) * universe.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        estrellaAnimals.push(getAnimalAt(idx));
      }
    }

    return {
      loteriaKey: key,
      loteriaNombre: config.nombre,
      fecha: dateStr,
      datoFijo: {
        animal: animalFijo,
        probabilidad: `${fijoProb}%`,
        horarioRecomendado: horarioFijo
      },
      laMorocha: [animalMorocha1, animalMorocha2],
      elBombazo: animalSorpresa,
      serieCaliente: serieSeleccionada,
      estrellaSuerte: estrellaAnimals
    };
  }
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.JuegoActivoEngine = JuegoActivoEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JuegoActivoEngine };
}
