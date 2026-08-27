"""
WandPool Chemistry & Dosing Engine
Baseado nos modelos de cálculo de LSI (Langelier Saturation Index) padrão NSPF / Orenda / Skimmer.
"""

import math
from typing import Dict, Any, List, Optional

def get_temperature_factor(temp_c: float) -> float:
    """Fator de Temperatura (TF) padrão NSPF/LSI."""
    temp_f = (temp_c * 9.0 / 5.0) + 32.0
    # Valores de referência: 10°C (50°F) = 0.35, 20°C (68°F) = 0.55, 25°C (77°F) = 0.68, 30°C (86°F) = 0.76, 35°C (95°F) = 0.84
    # Ajuste por fórmula logarítmica padrão
    tf = (math.log10(max(34.0, temp_f)) * 1.5) - 2.15
    return max(0.0, tf)

def calculate_lsi(
    ph: float,
    temperature_c: float = 25.0,
    calcium_hardness_ppm: float = 250.0,
    total_alkalinity_ppm: float = 100.0,
    cyanuric_acid_ppm: float = 30.0,
    total_dissolved_solids_ppm: float = 1000.0
) -> Dict[str, Any]:
    """
    Calcula o Índice de Saturação de Langelier (LSI) ajustado para Ácido Cianúrico e TDS.
    LSI = pH + TF + CF + AF - Constant
    """
    temp_f = (temperature_c * 9.0 / 5.0) + 32.0
    tf = get_temperature_factor(temperature_c)
    
    # Calcium Factor: CF = log10(CH) - 0.4
    ch = max(10.0, calcium_hardness_ppm)
    cf = math.log10(ch) - 0.4
    
    # Alkalinity Factor: AF = log10(TA - (CYA * 0.33))
    cya_correction = cyanuric_acid_ppm * 0.33
    carbonate_alkalinity = max(10.0, total_alkalinity_ppm - cya_correction)
    af = math.log10(carbonate_alkalinity)
    
    # TDS Constant
    tds_constant = 12.1
    if total_dissolved_solids_ppm > 1500:
        tds_constant = 12.2
    if total_dissolved_solids_ppm > 3000:
        tds_constant = 12.3
        
    lsi = round(ph + tf + cf + af - tds_constant, 2)
    
    # Status e Diagnóstico em Português
    if lsi < -0.30:
        status = "Corrosiva / Agressiva"
        status_code = "corrosive"
        description = (
            "A água está insaturada e corrosiva. Risco de corrosão em motores, tubulações metálicas "
            "e desgaste acelerado do rejunte e revestimento da piscina."
        )
        recommendation = "Eleve o pH com Barrilha ou a Alcalinidade com Bicarbonato."
        badge_color = "red"
    elif lsi > 0.30:
        status = "Incrustante / Saturada"
        status_code = "scaling"
        description = (
            "A água está supersaturada de carbonato de cálcio. Risco de incrustações "
            "nas paredes, aquecedores, placas da célula de sal e água turva."
        )
        recommendation = "Reduza o pH ou a Alcalinidade com redutor de pH/Ácido Muriático."
        badge_color = "amber"
    else:
        status = "Equilibrada / Perfeita"
        status_code = "balanced"
        description = (
            "A água está em perfeito equilíbrio físico-químico. Protege os banhistas e equipamentos."
        )
        recommendation = "Mantenha os níveis atuais de filtração e dosagem de rotina."
        badge_color = "emerald"

    return {
        "lsi": lsi,
        "status": status,
        "status_code": status_code,
        "description": description,
        "recommendation": recommendation,
        "badge_color": badge_color,
        "factors": {
            "temperature_f": round(temp_f, 1),
            "temperature_factor": round(tf, 2),
            "calcium_factor": round(cf, 2),
            "alkalinity_factor": round(af, 2),
            "carbonate_alkalinity": round(carbonate_alkalinity, 1),
            "tds_constant": tds_constant
        }
    }

def calculate_pool_volume(
    shape: str,
    length_m: float,
    width_m: float = 0.0,
    diameter_m: float = 0.0,
    shallow_depth_m: float = 1.0,
    deep_depth_m: float = 1.6
) -> Dict[str, Any]:
    """Calcula o volume da piscina em Litros e Galões."""
    avg_depth = (shallow_depth_m + deep_depth_m) / 2.0
    shape_clean = shape.lower().strip()
    
    if shape_clean in ["retangular", "retangulo", "rectangular"]:
        volume_m3 = length_m * width_m * avg_depth
    elif shape_clean in ["redonda", "circular", "round"]:
        radius = diameter_m / 2.0 if diameter_m > 0 else length_m / 2.0
        volume_m3 = math.pi * (radius ** 2) * avg_depth
    elif shape_clean in ["oval"]:
        volume_m3 = math.pi * (length_m / 2.0) * (width_m / 2.0) * avg_depth
    elif shape_clean in ["irregular", "livre", "freeform"]:
        volume_m3 = length_m * width_m * avg_depth * 0.85
    else:
        volume_m3 = length_m * width_m * avg_depth

    liters = round(volume_m3 * 1000.0, 0)
    gallons = round(liters * 0.264172, 0)

    return {
        "shape": shape,
        "avg_depth_m": round(avg_depth, 2),
        "volume_m3": round(volume_m3, 2),
        "liters": int(liters),
        "gallons": int(gallons)
    }

def calculate_chemical_dosages(
    volume_liters: float,
    current_ph: float,
    target_ph: float = 7.4,
    current_fc: float = 1.0,
    target_fc: float = 3.0,
    current_ta: float = 80.0,
    target_ta: float = 100.0,
    current_ch: float = 200.0,
    target_ch: float = 250.0,
    current_cya: float = 20.0,
    target_cya: float = 40.0,
    current_salt: float = 0.0,
    target_salt: float = 0.0,
    pool_type: str = "tradicional"
) -> Dict[str, Any]:
    """Calcula dosagens de produtos químicos recomendados com formatos métrico e US (lbs, fl oz, gal)."""
    volume_gallons = round(volume_liters * 0.264172, 0)
    scale_10k_gal = volume_gallons / 10000.0
    recommendations: List[Dict[str, Any]] = []

    # 1. Ajuste de pH
    delta_ph = round(target_ph - current_ph, 2)
    if delta_ph > 0.1:
        soda_ash_oz = round((delta_ph / 0.1) * 3.0 * scale_10k_gal, 1)
        soda_ash_lbs = round(soda_ash_oz / 16.0, 1)
        formatted_us = f"{soda_ash_lbs} lbs ({soda_ash_oz} oz)" if soda_ash_lbs >= 1 else f"{soda_ash_oz} oz"
        recommendations.append({
            "parameter": "pH (Elevação)",
            "chemical": "Soda Ash / Barrilha Leve (Carbonato de Sódio)",
            "amount": soda_ash_lbs if soda_ash_lbs >= 1 else soda_ash_oz,
            "unit": "lbs" if soda_ash_lbs >= 1 else "oz",
            "amount_formatted": formatted_us,
            "instructions": "Dissolva previamente em um balde com água da piscina e espalhe com a circulação ligada.",
            "priority": "Alta"
        })
    elif delta_ph < -0.1:
        acid_fl_oz = round((abs(delta_ph) / 0.1) * 5.0 * scale_10k_gal, 1)
        acid_qts = round(acid_fl_oz / 32.0, 2)
        formatted_us = f"{acid_qts} qt ({acid_fl_oz} fl oz)" if acid_qts >= 1 else f"{acid_fl_oz} fl oz"
        recommendations.append({
            "parameter": "pH (Redução)",
            "chemical": "Muriatic Acid 31.45% (Ácido Muriático)",
            "amount": acid_fl_oz,
            "unit": "fl oz",
            "amount_formatted": formatted_us,
            "instructions": "ATENÇÃO: Sempre adicione o ácido à água, NUNCA água ao ácido.",
            "priority": "Alta"
        })

    # 2. Ajuste de Alcalinidade Total
    delta_ta = round(target_ta - current_ta, 1)
    if delta_ta >= 10:
        bicarb_lbs = round((delta_ta / 10.0) * 1.5 * scale_10k_gal, 1)
        recommendations.append({
            "parameter": "Alcalinidade Total",
            "chemical": "Sodium Bicarbonate (Bicarbonato de Sódio)",
            "amount": bicarb_lbs,
            "unit": "lbs",
            "amount_formatted": f"{bicarb_lbs} lbs",
            "instructions": "Adicione diluído ao redor da borda da piscina com o filtro recirculando.",
            "priority": "Média"
        })

    # 3. Cloração / Desinfecção
    delta_fc = round(target_fc - current_fc, 1)
    if delta_fc > 0.2:
        liquid_cl_fl_oz = round(delta_fc * 10.7 * scale_10k_gal, 1)
        liquid_gal = round(liquid_cl_fl_oz / 128.0, 2)
        dichlor_oz = round(delta_fc * 2.4 * scale_10k_gal, 1)
        dichlor_lbs = round(dichlor_oz / 16.0, 1)
        
        recommendations.append({
            "parameter": "Cloro Livre (Desinfecção)",
            "chemical": "Liquid Chlorine 12.5% (Hipoclorito de Sódio)",
            "amount": liquid_cl_fl_oz,
            "unit": "fl oz",
            "amount_formatted": f"{liquid_cl_fl_oz} fl oz ({liquid_gal} gal)",
            "alternative": f"Ou {dichlor_lbs if dichlor_lbs >= 1 else dichlor_oz} {'lbs' if dichlor_lbs >= 1 else 'oz'} de Dicloro Granulado 56%",
            "instructions": "Aplique no final da tarde ou à noite para evitar que o sol degrade o cloro.",
            "priority": "Crítica"
        })

    # 4. Dureza Cálcica
    delta_ch = round(target_ch - current_ch, 1)
    if delta_ch >= 20:
        calcium_lbs = round((delta_ch / 10.0) * 1.25 * scale_10k_gal, 1)
        recommendations.append({
            "parameter": "Dureza Cálcica",
            "chemical": "Calcium Chloride (Cloreto de Cálcio)",
            "amount": calcium_lbs,
            "unit": "lbs",
            "amount_formatted": f"{calcium_lbs} lbs",
            "instructions": "Dissolva bem em balde com água antes de aplicar (o produto aquece durante a dissolução).",
            "priority": "Baixa"
        })

    # 5. Ácido Cianúrico
    delta_cya = round(target_cya - current_cya, 1)
    if delta_cya >= 10:
        cya_lbs = round((delta_cya / 10.0) * 0.81 * scale_10k_gal, 1)
        recommendations.append({
            "parameter": "Ácido Cianúrico (Estabilizador)",
            "chemical": "Pool Stabilizer / Conditioner (Ácido Cianúrico)",
            "amount": cya_lbs,
            "unit": "lbs",
            "amount_formatted": f"{cya_lbs} lbs",
            "instructions": "Coloque em um sock no skimmer para dissolução lenta.",
            "priority": "Média"
        })

    # 6. Sal
    if target_salt > 0 and current_salt < target_salt:
        delta_salt = target_salt - current_salt
        salt_lbs = round((delta_salt / 100.0) * 8.33 * scale_10k_gal, 0)
        bags_40lbs = math.ceil(salt_lbs / 40.0)
        recommendations.append({
            "parameter": "Sal para Gerador de Cloro (SWG)",
            "chemical": "Pool Salt (Sal Especial para Piscina 99.8%)",
            "amount": int(salt_lbs),
            "unit": "lbs",
            "amount_formatted": f"{int(salt_lbs)} lbs (~{bags_40lbs} sacos de 40 lbs)",
            "instructions": "Espalhe o sal e varra até dissolver completamente antes de ligar o gerador.",
            "priority": "Alta"
        })

    return {
        "volume_liters": volume_liters,
        "volume_gallons": int(volume_gallons),
        "recommendations": recommendations,
        "total_actions": len(recommendations)
    }
