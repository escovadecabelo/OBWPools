import type { LSISolution, DosageResult, ChemicalRecommendation } from '../types/pool';

export function calculateLSIClient(
  ph: number,
  tempInput: number = 78, // default 78°F ou 25°C
  ch: number = 250,
  ta: number = 100,
  cya: number = 30,
  tds: number = 1000
): LSISolution {
  // Se tempInput for menor que 45, assume °C e converte para °F
  const tempF = tempInput < 45 ? (tempInput * 9) / 5 + 32 : tempInput;
  const tf = Math.max(0, Math.log10(Math.max(34, tempF)) * 1.5 - 2.15);
  const cf = Math.log10(Math.max(10, ch)) - 0.4;
  const carbAlk = Math.max(10, ta - cya * 0.33);
  const af = Math.log10(carbAlk);

  let tdsConstant = 12.1;
  if (tds > 1500) tdsConstant = 12.2;
  if (tds > 3000) tdsConstant = 12.3;

  const rawLsi = ph + tf + cf + af - tdsConstant;
  const lsi = Number(rawLsi.toFixed(2));

  let status = 'Equilibrada / Perfeita';
  let statusCode: 'corrosive' | 'balanced' | 'scaling' = 'balanced';
  let badgeColor: 'red' | 'emerald' | 'amber' = 'emerald';
  let description = 'A água está em perfeito equilíbrio físico-químico. Protege banhistas, rejuntes e equipamentos.';
  let recommendation = 'Mantenha os níveis atuais de filtração e dosagem rotineira.';

  if (lsi < -0.30) {
    status = 'Corrosiva / Agressiva';
    statusCode = 'corrosive';
    badgeColor = 'red';
    description = 'A água está ácida/insaturada. Risco de corrosão em motores, aquecedores e desgaste de rejuntes e alvenaria.';
    recommendation = 'Eleve o pH com Barrilha (Soda Ash) ou a Alcalinidade com Bicarbonato de Sódio.';
  } else if (lsi > 0.30) {
    status = 'Incrustante / Saturada';
    statusCode = 'scaling';
    badgeColor = 'amber';
    description = 'A água está supersaturada de cálcio. Risco de incrustações ásperas nas paredes, calcificação em células de sal e turbidez.';
    recommendation = 'Reduza o pH ou a Alcalinidade com Ácido Muriático (Muriatic Acid 31.45%).';
  }

  return {
    lsi,
    status,
    status_code: statusCode,
    description,
    recommendation,
    badge_color: badgeColor,
    factors: {
      temperature_f: Number(tempF.toFixed(1)),
      temperature_factor: Number(tf.toFixed(2)),
      calcium_factor: Number(cf.toFixed(2)),
      alkalinity_factor: Number(af.toFixed(2)),
      carbonate_alkalinity: Number(carbAlk.toFixed(1)),
      tds_constant: tdsConstant
    }
  };
}

export function calculateDosagesClient(
  volumeInput: number, // em Litros ou Galões
  currentPh: number,
  targetPh: number = 7.4,
  currentFc: number = 1.0,
  targetFc: number = 3.0,
  currentTa: number = 80,
  targetTa: number = 100,
  currentCh: number = 200,
  targetCh: number = 250,
  currentCya: number = 20,
  targetCya: number = 40,
  currentSalt: number = 0,
  targetSalt: number = 0,
  isGallons: boolean = false
): DosageResult {
  // Volume normalizado em galões (base padrão dos EUA) e litros
  const volumeGallons = isGallons ? volumeInput : Math.round(volumeInput * 0.264172);
  const volumeLiters = isGallons ? Math.round(volumeInput * 3.78541) : volumeInput;
  const scale10kGal = volumeGallons / 10000;

  const recommendations: ChemicalRecommendation[] = [];

  // 1. pH
  const deltaPh = Number((targetPh - currentPh).toFixed(2));
  if (deltaPh > 0.1) {
    // Soda Ash: ~6 oz por 10k gal para subir ~0.2 pH
    const sodaAshOz = Math.round((deltaPh / 0.1) * 3 * scale10kGal * 10) / 10;
    const sodaAshLbs = Math.round((sodaAshOz / 16) * 10) / 10;
    const formatted = sodaAshLbs >= 1 ? `${sodaAshLbs} lbs (${sodaAshOz} oz)` : `${sodaAshOz} oz`;

    recommendations.push({
      parameter: 'pH (Elevação)',
      chemical: 'Soda Ash / Barrilha Leve (Carbonato de Sódio)',
      amount: sodaAshLbs >= 1 ? sodaAshLbs : sodaAshOz,
      unit: sodaAshLbs >= 1 ? 'lbs' : 'oz',
      amount_formatted: formatted,
      instructions: 'Dissolva previamente em um balde com água da piscina e espalhe com a bomba ligada.',
      priority: 'Alta'
    });
  } else if (deltaPh < -0.1) {
    // Muriatic Acid 31.45%: ~10 fl oz por 10k gal para baixar ~0.2 pH
    const acidFlOz = Math.round((Math.abs(deltaPh) / 0.1) * 5 * scale10kGal * 10) / 10;
    const acidQts = Math.round((acidFlOz / 32) * 100) / 100;
    const formatted = acidQts >= 1 ? `${acidQts} qt (${acidFlOz} fl oz)` : `${acidFlOz} fl oz`;

    recommendations.push({
      parameter: 'pH (Redução)',
      chemical: 'Muriatic Acid 31.45% (Ácido Muriático)',
      amount: acidFlOz,
      unit: 'fl oz',
      amount_formatted: formatted,
      instructions: 'ATENÇÃO: Sempre adicione o ácido à água, NUNCA água ao ácido. Despeje devagar em frente aos retornos.',
      priority: 'Alta'
    });
  }

  // 2. Alcalinidade Total (TA)
  const deltaTa = Number((targetTa - currentTa).toFixed(1));
  if (deltaTa >= 10) {
    // Bicarbonate: ~1.5 lbs por 10k gal para subir 10 ppm TA
    const bicarbLbs = Math.round((deltaTa / 10) * 1.5 * scale10kGal * 10) / 10;
    recommendations.push({
      parameter: 'Alcalinidade Total (TA)',
      chemical: 'Sodium Bicarbonate (Bicarbonato de Sódio)',
      amount: bicarbLbs,
      unit: 'lbs',
      amount_formatted: `${bicarbLbs} lbs`,
      instructions: 'Adicione espalhando ao redor do perímetro mais profundo da piscina com o filtro ligado.',
      priority: 'Média'
    });
  }

  // 3. Cloro Livre (Free Chlorine)
  const deltaFc = Number((targetFc - currentFc).toFixed(1));
  if (deltaFc > 0.2) {
    // Liquid Chlorine 12.5%: ~10.7 fl oz por 10k gal para subir 1 ppm FC
    const liquidClFlOz = Math.round(deltaFc * 10.7 * scale10kGal * 10) / 10;
    const liquidGal = (liquidClFlOz / 128).toFixed(2);
    // Dichlor 56%: ~2.4 oz por 10k gal para subir 1 ppm FC
    const dichlorOz = Math.round(deltaFc * 2.4 * scale10kGal * 10) / 10;
    const dichlorLbs = Math.round((dichlorOz / 16) * 10) / 10;

    recommendations.push({
      parameter: 'Cloro Livre (Sanitização)',
      chemical: 'Liquid Chlorine 12.5% (Hipoclorito de Sódio)',
      amount: liquidClFlOz,
      unit: 'fl oz',
      amount_formatted: `${liquidClFlOz} fl oz (${liquidGal} gal)`,
      alternative: `Ou ${dichlorLbs >= 1 ? `${dichlorLbs} lbs` : `${dichlorOz} oz`} de Dicloro Granulado 56%`,
      instructions: 'Aplique ao entardecer ou à noite para evitar perda imediata de cloro pelos raios UV solares.',
      priority: 'Crítica'
    });
  }

  // 4. Dureza Cálcica (Calcium Hardness)
  const deltaCh = Number((targetCh - currentCh).toFixed(1));
  if (deltaCh >= 20) {
    // Calcium Chloride 77%: ~1.25 lbs por 10k gal para subir 10 ppm CH
    const calciumLbs = Math.round((deltaCh / 10) * 1.25 * scale10kGal * 10) / 10;
    recommendations.push({
      parameter: 'Dureza Cálcica (CH)',
      chemical: 'Calcium Chloride (Cloreto de Cálcio)',
      amount: calciumLbs,
      unit: 'lbs',
      amount_formatted: `${calciumLbs} lbs`,
      instructions: 'Dissolva bem em um balde plástico com água antes de aplicar (o produto aquece ao reagir com a água).',
      priority: 'Baixa'
    });
  }

  // 5. Ácido Cianúrico (CYA / Stabilizer)
  const deltaCya = Number((targetCya - currentCya).toFixed(1));
  if (deltaCya >= 10) {
    // CYA Stabilizer: ~13 oz (0.81 lbs) por 10k gal para subir 10 ppm CYA
    const cyaLbs = Math.round((deltaCya / 10) * 0.81 * scale10kGal * 10) / 10;
    recommendations.push({
      parameter: 'Cyanuric Acid (CYA Estabilizador)',
      chemical: 'Pool Stabilizer / Conditioner (Ácido Cianúrico)',
      amount: cyaLbs,
      unit: 'lbs',
      amount_formatted: `${cyaLbs} lbs`,
      instructions: 'Coloque em uma meia/sock no cesto do skimmer para dissolução lenta sem turvar a água.',
      priority: 'Média'
    });
  }

  // 6. Sal para Piscinas Salinas (SWG)
  if (targetSalt > 0 && currentSalt < targetSalt) {
    const deltaSalt = targetSalt - currentSalt;
    // Salt: ~30 lbs por 10k gal para subir 360 ppm Salt -> ~8.33 lbs por 10k gal por 100 ppm
    const saltLbs = Math.round((deltaSalt / 100) * 8.33 * scale10kGal);
    const bags40lbs = Math.ceil(saltLbs / 40);

    recommendations.push({
      parameter: 'Sal para Gerador SWG (NaCl)',
      chemical: 'Pool Salt (Sal Puro para Piscina 99.8%)',
      amount: saltLbs,
      unit: 'lbs',
      amount_formatted: `${saltLbs} lbs (~${bags40lbs} sacos de 40 lbs)`,
      instructions: 'Espalhe no fundo raso e varra até dissolver completamente antes de reativar a célula geradora de sal.',
      priority: 'Alta'
    });
  }

  return {
    volume_liters: volumeLiters,
    recommendations,
    total_actions: recommendations.length
  };
}

export function calculatePoolVolumeClient(
  shape: string,
  lengthFt: number = 28.0,
  widthFt: number = 14.0,
  diameterFt: number = 18.0,
  shallowDepthFt: number = 3.5,
  deepDepthFt: number = 6.0
) {
  const avgDepthFt = (shallowDepthFt + deepDepthFt) / 2;
  const s = shape.toLowerCase().trim();
  let volumeCuFt = 0;

  if (s === 'retangular' || s === 'retangulo' || s === 'rectangular') {
    volumeCuFt = lengthFt * widthFt * avgDepthFt;
  } else if (s === 'redonda' || s === 'circular' || s === 'round') {
    const r = diameterFt > 0 ? diameterFt / 2 : lengthFt / 2;
    volumeCuFt = Math.PI * r * r * avgDepthFt;
  } else if (s === 'oval') {
    volumeCuFt = Math.PI * (lengthFt / 2) * (widthFt / 2) * avgDepthFt;
  } else if (s === 'irregular' || s === 'livre' || s === 'freeform') {
    volumeCuFt = lengthFt * widthFt * avgDepthFt * 0.85;
  } else {
    volumeCuFt = lengthFt * widthFt * avgDepthFt;
  }

  const gallons = Math.round(volumeCuFt * 7.48052);
  const liters = Math.round(gallons * 3.78541);
  const volumeM3 = Number((liters / 1000).toFixed(1));

  return {
    shape,
    avg_depth_ft: Number(avgDepthFt.toFixed(2)),
    avg_depth_m: Number((avgDepthFt * 0.3048).toFixed(2)),
    volume_cu_ft: Number(volumeCuFt.toFixed(1)),
    volume_m3: volumeM3,
    gallons,
    liters
  };
}
