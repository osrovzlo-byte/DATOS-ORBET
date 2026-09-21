// Datos Orbet - Motor de Triángulos Numerológicos y Pirámides de la Suerte
// Genera pirámides con fecha de nacimiento, fecha del día, fechas cortas y largas

class PyramidEngine {
  /**
   * Genera los pisos de la pirámide sumando dígitos adyacentes módulo 10
   */
  static buildPyramid(digitsArray) {
    const rows = [];
    rows.push([...digitsArray]);

    let currentRow = [...digitsArray];
    while (currentRow.length > 1) {
      const nextRow = [];
      for (let i = 0; i < currentRow.length - 1; i++) {
        const sum = (currentRow[i] + currentRow[i + 1]) % 10;
        nextRow.push(sum);
      }
      rows.push(nextRow);
      currentRow = nextRow;
    }
    return rows;
  }

  /**
   * Convierte una fecha a dígitos según el modo
   * @param {Date} dateObj
   * @param {'dia_corta'|'dia_larga'|'nacimiento_corta'|'nacimiento_larga'} mode
   */
  static getDigitsFromDate(dateObj, isLong = true) {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();

    const str = isLong ? `${day}${month}${year}` : `${day}${month}`;
    return str.split('').map((c) => parseInt(c, 10));
  }

  /**
   * Genera el triángulo numerológico completo y sus pronósticos derivados
   */
  static generate({ mode, customDate = null, isLong = false }) {
    let dateObj = new Date();
    let title = '';
    let description = '';

    if (mode === 'dia_actual') {
      dateObj = new Date();
      title = isLong ? 'Triángulo del Día (Fecha Larga)' : 'Triángulo del Día (Fecha Corta)';
      description = `Generado con la fecha de hoy: ${dateObj.toLocaleDateString('es-ES')}`;
    } else if (mode === 'nacimiento') {
      if (customDate) {
        const parts = customDate.split('-');
        dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        dateObj = new Date(1990, 0, 1);
      }
      title = isLong ? 'Triángulo de Nacimiento (Largo)' : 'Triángulo de Nacimiento (Corto)';
      description = `Personalizado con fecha de nacimiento: ${dateObj.toLocaleDateString('es-ES')}`;
    } else if (mode === 'fecha_corta') {
      dateObj = customDate ? new Date(customDate) : new Date();
      title = 'Triángulo de Fecha Corta (DD/MM)';
      description = `Base de 4 dígitos (Día y Mes)`;
      isLong = false;
    } else if (mode === 'fecha_larga') {
      dateObj = customDate ? new Date(customDate) : new Date();
      title = 'Triángulo de Fecha Larga (DD/MM/AAAA)';
      description = `Base de 8 dígitos (Día, Mes y Año completo)`;
      isLong = true;
    }

    const baseDigits = this.getDigitsFromDate(dateObj, isLong);
    const pyramidRows = this.buildPyramid(baseDigits);

    // Extraer pronósticos de la pirámide
    const predictions = this.extractLuckyNumbers(pyramidRows);

    return {
      title,
      description,
      dateFormatted: dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      baseDigits,
      pyramidRows,
      predictions
    };
  }

  /**
   * Extrae combinaciones ganadoras (Cúspide, Terminales, Triples y Cuatro Cifras)
   */
  static extractLuckyNumbers(rows) {
    const totalRows = rows.length;
    const peak = rows[totalRows - 1][0]; // Cúspide
    const prePeak = totalRows > 1 ? rows[totalRows - 2] : [peak];
    const baseRow = rows[0];

    // Extremos de la base
    const baseLeft = baseRow[0];
    const baseRight = baseRow[baseRow.length - 1];

    // Diagonales izquierda y derecha
    const diagLeft = rows.map((r) => r[0]);
    const diagRight = rows.map((r) => r[r.length - 1]);

    // 1. Terminales Calientes (2 Cifras)
    const terminales = [
      `${prePeak[0] || 0}${peak}`,
      `${peak}${prePeak[1] !== undefined ? prePeak[1] : (peak + 3) % 10}`,
      `${baseLeft}${peak}`,
      `${peak}${baseRight}`,
      `${diagLeft[1] || 1}${diagRight[1] || 7}`
    ];

    // 2. Triples de la Suerte (3 Cifras)
    const triples = [
      `${diagLeft[0]}${peak}${diagRight[0]}`,
      `${prePeak[0] || 4}${peak}${prePeak[1] !== undefined ? prePeak[1] : 8}`,
      `${peak}${diagLeft[1] || 2}${diagRight[1] || 5}`,
      `${baseLeft}${diagLeft[1] || 0}${peak}`
    ];

    // 3. Cuatro Cifras (Super Jugada)
    const cuatroCifras = [
      `${baseLeft}${prePeak[0] || 3}${peak}${baseRight}`,
      `${diagLeft[0]}${diagRight[0]}${prePeak[0] || 7}${peak}`
    ];

    // 4. Animalito de la suerte (asociado a los terminales módulo 37)
    const animalitoIndex = (parseInt(terminales[0], 10) || 7) % ANIMALITOS_LIST.length;
    const animalito = ANIMALITOS_LIST[animalitoIndex] || ANIMALITOS_LIST[7];

    // 5. Signo zodiacal de la suerte
    const signoIndex = (parseInt(triples[0], 10) || 3) % SIGNOS_ZODIACALES.length;
    const signo = SIGNOS_ZODIACALES[signoIndex] || 'Aries';

    return {
      peak,
      terminales: [...new Set(terminales)],
      triples: [...new Set(triples)],
      cuatroCifras: [...new Set(cuatroCifras)],
      animalito,
      signo
    };
  }

  /**
   * Generador aleatorio instantáneo de la suerte
   */
  static generateRandomLucky() {
    const pad = (n, len) => n.toString().padStart(len, '0');
    const dosCifras = pad(Math.floor(Math.random() * 100), 2);
    const tresCifras = pad(Math.floor(Math.random() * 1000), 3);
    const cuatroCifras = pad(Math.floor(Math.random() * 10000), 4);
    const animalito = ANIMALITOS_LIST[Math.floor(Math.random() * ANIMALITOS_LIST.length)];
    const signo = SIGNOS_ZODIACALES[Math.floor(Math.random() * SIGNOS_ZODIACALES.length)];

    return {
      dosCifras,
      tresCifras,
      cuatroCifras,
      animalito,
      signo
    };
  }
}

window.PyramidEngine = PyramidEngine;
