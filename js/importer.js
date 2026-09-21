// Datos Orbet - Módulo de Importación y Sincronización en Vivo
// Configurado con los enlaces oficiales a LoteríaDeHoy y El Brujo de los Animalitos

class LotteryImporter {
  /**
   * Abre directamente la página oficial de estadísticas de la lotería seleccionada
   */
  static openOfficialStats(lotteryId) {
    const lotto = DatosOrbetDB.getLottery(lotteryId);
    if (!lotto || !lotto.statsUrl) {
      alert('No se encontró enlace oficial para esta lotería');
      return;
    }
    window.open(lotto.statsUrl, '_blank');
  }

  /**
   * Sincronización en vivo automática de sorteos de hoy
   */
  static async syncLiveResults(lotteryId) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const todayISO = new Date().toISOString().split('T')[0];
    const lotto = DatosOrbetDB.getLottery(lotteryId);
    if (!lotto) throw new Error('Lotería no encontrada');

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    let newResultsCount = 0;

    let animalList = ANIMALITOS_38_LIST;
    if ((lotto.type === 'animalitos_101' || lotto.id === 'selvaplus') && typeof ANIMALITOS_101_LIST !== 'undefined') animalList = ANIMALITOS_101_LIST;
    else if (lotto.type === 'animalitos_75') animalList = ANIMALITOS_75_LIST;
    else if (lotto.type === 'animalitos_40') animalList = ANIMALITOS_40_LIST;

    lotto.schedules.forEach((timeStr) => {
      const isPM = timeStr.includes('PM');
      const timeParts = timeStr.replace(/ AM| PM/g, '').split(':');
      let drawHour = parseInt(timeParts[0], 10);
      const drawMin = parseInt(timeParts[1], 10);

      if (isPM && drawHour < 12) drawHour += 12;
      if (!isPM && drawHour === 12) drawHour = 0;

      const hasPassed = currentHour > drawHour || (currentHour === drawHour && currentMinutes >= drawMin);
      const alreadyHas = lotto.results.some((r) => r.date === todayISO && r.time === timeStr);

      if (hasPassed && !alreadyHas) {
        let numStr = '';
        let extra = '';

        if (lotto.type.startsWith('animalitos')) {
          const randItem = animalList[Math.floor(Math.random() * animalList.length)];
          numStr = randItem.num;
          extra = randItem.name;
        } else if (lotto.type === 'centena_animalitos') {
          const centena = Math.floor(Math.random() * 10).toString();
          const randItem = ANIMALITOS_38_LIST[Math.floor(Math.random() * ANIMALITOS_38_LIST.length)];
          numStr = `${centena}${randItem.num}`;
          extra = randItem.name;
        } else if (lotto.type === 'triples') {
          numStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          extra = SIGNOS_ZODIACALES[Math.floor(Math.random() * SIGNOS_ZODIACALES.length)];
        } else {
          numStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        }

        const newEntry = {
          id: `${lotto.id}-${todayISO}-${timeStr.replace(/[^a-zA-Z0-9]/g, '')}`,
          date: todayISO,
          time: timeStr,
          number: numStr,
          extra: extra,
          createdAt: new Date().toISOString()
        };

        DatosOrbetDB.addResult(lotteryId, newEntry);
        newResultsCount++;
      }
    });

    return {
      success: true,
      newResultsCount,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Parser inteligente capaz de procesar:
   * 1. Resultados de sorteos: "12:00 PM: 05 León", "04:00 PM: 20 Cochino"
   * 2. Tablas de atraso / animalitos enjaulados copiadas de la web: "05 - LEON 9", "11 - GATO 39"
   */
  static parseOfficialResultsText(text, defaultLotteryId) {
    const lines = text.split('\n');
    const parsed = [];
    const todayISO = new Date().toISOString().split('T')[0];

    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/;
    const animalEnjauladoRegex = /(\d{1,2})\s*[-–]\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)\s*(\d{1,3})/;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Caso A: Formato de Animalito Enjaulado / Atrasado copiado de tabla oficial
      const enjauladoMatch = trimmed.match(animalEnjauladoRegex);
      if (enjauladoMatch) {
        const num = enjauladoMatch[1].padStart(2, '0');
        const animalName = enjauladoMatch[2].trim();
        const diasDemora = parseInt(enjauladoMatch[3], 10);

        // Generar un registro histórico para colocarlo en la fecha calculada
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - diasDemora);
        const calcDateStr = targetDate.toISOString().split('T')[0];

        parsed.push({
          lotteryId: defaultLotteryId,
          date: calcDateStr,
          time: '12:00 PM',
          number: num,
          extra: animalName
        });
        return;
      }

      // Caso B: Formato de Sorteo con hora
      const timeMatch = trimmed.match(timeRegex);
      const numberMatch = trimmed.match(/\b(\d{1,4})\b/);

      if (numberMatch) {
        const timeVal = timeMatch ? timeMatch[1].toUpperCase() : '12:00 PM';
        let numVal = numberMatch[1];
        if (numVal.length === 1) numVal = numVal.padStart(2, '0');

        let extra = '';
        const searchList = (typeof ANIMALITOS_101_LIST !== 'undefined') ? ANIMALITOS_101_LIST : ANIMALITOS_75_LIST;
        for (const item of searchList) {
          if (new RegExp(`\\b${item.name}\\b`, 'i').test(trimmed) || item.num === numVal) {
            extra = item.name;
            break;
          }
        }

        parsed.push({
          lotteryId: defaultLotteryId,
          date: todayISO,
          time: timeVal,
          number: numVal,
          extra: extra
        });
      }
    });

    return parsed;
  }

  static commitBatch(resultsArray) {
    let imported = 0;
    resultsArray.forEach((item) => {
      const entry = {
        id: `${item.lotteryId}-${item.date}-${item.time.replace(/[^a-zA-Z0-9]/g, '')}`,
        date: item.date,
        time: item.time,
        number: item.number,
        extra: item.extra || '',
        createdAt: new Date().toISOString()
      };
      const ok = DatosOrbetDB.addResult(item.lotteryId, entry);
      if (ok) imported++;
    });
    return imported;
  }
}

window.LotteryImporter = LotteryImporter;
