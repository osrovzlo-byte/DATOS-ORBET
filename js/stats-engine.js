// Datos Orbet - Motor de Estadísticas y Números Calientes
// Adaptado para las 14 Loterías de Animalitos y Loterías Tradicionales

class StatsEngine {
  /**
   * Filtra los resultados de una lotería según el período seleccionado
   */
  static filterResults(results, filter) {
    if (!results || !results.length) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const { type, customDays, startDate, endDate } = filter;

    return results.filter((r) => {
      const parts = r.date.split('-');
      const rDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

      if (type === '1_day') {
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays === 0;
      }

      if (type === '2_days') {
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 2;
      }

      if (type === 'week') {
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 7;
      }

      if (type === 'month') {
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 30;
      }

      if (type === 'year') {
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 365;
      }

      if (type === 'custom_days') {
        const days = parseInt(customDays, 10) || 1;
        const diffDays = Math.floor((today - rDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < days;
      }

      if (type === 'custom_range') {
        if (!startDate) return true;
        const sParts = startDate.split('-');
        const sDate = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));

        let eDate = today;
        if (endDate) {
          const eParts = endDate.split('-');
          eDate = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));
        }

        return rDate >= sDate && rDate <= eDate;
      }

      return true;
    });
  }

  /**
   * Extrae el universo completo de números o animales para la lotería
   */
  static getUniverse(lottery) {
    if ((lottery.type === 'animalitos_101' || lottery.id === 'selvaplus') && typeof ANIMALITOS_101_LIST !== 'undefined') {
      return ANIMALITOS_101_LIST.map((item) => ({
        key: item.num,
        label: `${item.num} - ${item.name}`,
        name: item.name
      }));
    }

    if (lottery.type === 'animalitos_75') {
      return ANIMALITOS_75_LIST.map((item) => ({
        key: item.num,
        label: `${item.num} - ${item.name}`,
        name: item.name
      }));
    }

    if (lottery.type === 'animalitos_40') {
      return ANIMALITOS_40_LIST.map((item) => ({
        key: item.num,
        label: `${item.num} - ${item.name}`,
        name: item.name
      }));
    }

    if (lottery.type === 'animalitos' || lottery.type === 'centena_animalitos') {
      return ANIMALITOS_38_LIST.map((item) => ({
        key: item.num,
        label: `${item.num} - ${item.name}`,
        name: item.name
      }));
    }

    // Terminales tradicionales 00 a 99
    const universe = [];
    for (let i = 0; i < 100; i++) {
      const s = i.toString().padStart(2, '0');
      universe.push({ key: s, label: s, name: '' });
    }
    return universe;
  }

  /**
   * Extrae la clave de análisis
   */
  static getNumberKey(lottery, numStr) {
    const clean = numStr.toString().trim();
    if (lottery.type.startsWith('animalitos')) {
      return clean;
    }
    if (lottery.type === 'centena_animalitos') {
      // Para centenas extraemos el animalito (últimos 2 dígitos o completo si es 0/00)
      if (clean.length > 2) return clean.slice(-2);
      return clean;
    }
    if (clean.length <= 2) return clean.padStart(2, '0');
    return clean.slice(-2);
  }

  /**
   * Calcula todas las estadísticas requeridas para la Lotería en Análisis
   */
  static analyze(lottery, allResults, filter) {
    const filteredResults = this.filterResults(allResults, filter);
    const universe = this.getUniverse(lottery);

    const frequencyMap = {};
    const drawsList = [];

    filteredResults.forEach((r) => {
      const key = this.getNumberKey(lottery, r.number);
      if (!frequencyMap[key]) {
        frequencyMap[key] = {
          key: key,
          fullNumber: r.number,
          extra: r.extra || '',
          count: 0,
          draws: []
        };
      }
      frequencyMap[key].count++;
      frequencyMap[key].draws.push(r);
      drawsList.push(r);
    });

    const totalDraws = filteredResults.length;

    // 1. Números que han salido
    const numbersDrawn = Object.values(frequencyMap).map((item) => {
      const univItem = universe.find((u) => u.key === item.key);
      return {
        key: item.key,
        fullNumber: item.fullNumber,
        label: univItem ? univItem.label : item.key,
        extra: item.extra || (univItem ? univItem.name : ''),
        count: item.count,
        percentage: totalDraws > 0 ? ((item.count / totalDraws) * 100).toFixed(1) : '0.0',
        lastDraw: item.draws[0],
        draws: item.draws
      };
    });

    numbersDrawn.sort((a, b) => b.count - a.count);

    // 2. Números que se repiten (salieron 2 o más veces)
    const repeatedNumbers = numbersDrawn.filter((item) => item.count >= 2);

    // 3. Números que NO han salido en este período (Animalitos ausentes / enjaulados)
    const normLotteryKey = (typeof normalizarLoteriaKey === 'function') ? normalizarLoteriaKey(lottery.id) : lottery.id;
    const baseline = (typeof BASELINE_FECHAS_OFICIALES !== 'undefined' && (BASELINE_FECHAS_OFICIALES[normLotteryKey] || BASELINE_FECHAS_OFICIALES[lottery.id])) || {};
    const drawnKeys = new Set(numbersDrawn.map((d) => d.key));
    const numbersNotDrawn = universe
      .filter((u) => !drawnKeys.has(u.key))
      .map((u) => {
        const baselineItem = baseline[u.key];
        const lastHistoricalDraw = allResults.find((r) => this.getNumberKey(lottery, r.number) === u.key);
        let daysAgo = 'Nunca en registro';
        let lastDate = null;
        let daysNum = 0;

        if (baselineItem) {
          lastDate = baselineItem.fecha;
          daysNum = typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.calcularDiasSinSalir
            ? DatosOrbetDB.calcularDiasSinSalir(lastDate)
            : Math.max(0, Math.floor((new Date() - new Date(lastDate)) / 86400000));
          daysAgo = `Hace ${daysNum} días (${lastDate})`;
        } else if (lastHistoricalDraw) {
          lastDate = lastHistoricalDraw.fecha_ultima_salida || lastHistoricalDraw.date;
          daysNum = typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.calcularDiasSinSalir
            ? DatosOrbetDB.calcularDiasSinSalir(lastDate)
            : Math.max(0, Math.floor((new Date() - new Date(lastDate)) / 86400000));
          daysAgo = daysNum === 0 ? 'Hoy' : daysNum === 1 ? 'Ayer' : `Hace ${daysNum} días (${lastDate})`;
        }

        return {
          key: u.key,
          label: u.label,
          extra: u.name,
          count: 0,
          daysNum: daysNum,
          lastDate: lastDate,
          daysAgo: daysAgo
        };
      });

    // Ordenar ausentes de mayor retraso a menor de forma estrictamente descendente
    numbersNotDrawn.sort((a, b) => b.daysNum - a.daysNum);

    // 4. "NÚMEROS CALIENTES / POR SALIR" (Animalitos enjaulados con mayor retraso oficial)
    const hotNumbersPorSalir = universe.map((u) => {
      const drawnItem = frequencyMap[u.key];
      const countInPeriod = drawnItem ? drawnItem.count : 0;

      const baselineItem = baseline[u.key];
      const lastHistoricalDraw = allResults.find((r) => this.getNumberKey(lottery, r.number) === u.key);

      let daysWithoutDraw = 0;
      let lastDate = 'Sin registro';

      if (baselineItem) {
        lastDate = baselineItem.fecha;
        daysWithoutDraw = typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.calcularDiasSinSalir
          ? DatosOrbetDB.calcularDiasSinSalir(lastDate)
          : Math.max(0, Math.floor((new Date() - new Date(lastDate)) / 86400000));
      } else if (lastHistoricalDraw) {
        lastDate = lastHistoricalDraw.fecha_ultima_salida || lastHistoricalDraw.date;
        daysWithoutDraw = typeof DatosOrbetDB !== 'undefined' && DatosOrbetDB.calcularDiasSinSalir
          ? DatosOrbetDB.calcularDiasSinSalir(lastDate)
          : Math.max(0, Math.floor((new Date() - new Date(lastDate)) / 86400000));
      } else {
        // En caso de que no tenga registro histórico ni baseline, se asigna salida reciente
        daysWithoutDraw = 3;
        const d = new Date();
        d.setDate(d.getDate() - 3);
        lastDate = d.toISOString().split('T')[0];
      }

      let heatLevel = 'Caliente';
      let flameIcon = '🔥';
      if (daysWithoutDraw >= 20) {
        heatLevel = 'Crítica (¡Inminente!)';
        flameIcon = '🔥🔥🔥';
      } else if (daysWithoutDraw >= 12) {
        heatLevel = 'Muy Caliente';
        flameIcon = '🔥🔥';
      } else if (daysWithoutDraw >= 7) {
        heatLevel = 'Caliente';
        flameIcon = '🔥';
      } else {
        heatLevel = 'Moderado';
        flameIcon = '⚡';
      }

      return {
        key: u.key,
        label: u.label,
        extra: u.name,
        countInPeriod: countInPeriod,
        daysWithoutDraw: `${daysWithoutDraw} días sin salir`,
        daysRaw: daysWithoutDraw,
        lastDate: lastDate,
        heatLevel: heatLevel,
        flameIcon: flameIcon
      };
    });

    // Ordenar de forma descendente estricta según los días calculados (Mayor retraso arriba)
    hotNumbersPorSalir.sort((a, b) => {
      if (b.daysRaw !== a.daysRaw) {
        return b.daysRaw - a.daysRaw;
      }
      return a.key.localeCompare(b.key);
    });

    // 5. Más frecuentes
    const mostFrequent = [...numbersDrawn].sort((a, b) => b.count - a.count);

    return {
      lotteryId: lottery.id,
      lotteryName: lottery.name,
      totalDraws: totalDraws,
      filteredResults: filteredResults,
      numbersDrawn: numbersDrawn,
      totalDrawnCount: numbersDrawn.length,
      repeatedNumbers: repeatedNumbers,
      totalRepeatedCount: repeatedNumbers.length,
      numbersNotDrawn: numbersNotDrawn,
      totalNotDrawnCount: numbersNotDrawn.length,
      hotNumbersPorSalir: hotNumbersPorSalir.slice(0, 20), // Top 20 enjaulados
      mostFrequent: mostFrequent.slice(0, 20)
    };
  }
}

window.StatsEngine = StatsEngine;
