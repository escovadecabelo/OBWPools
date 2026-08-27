"""
Hermes Agent Pool Management Tools (Nous Research Architecture)
Define ferramentas especializadas para o Hermes Agent diagnosticar problemas de piscinas,
calcular dosagens e emitir ordens de serviço e relatórios digitais.
"""

from typing import Dict, Any, List, Optional
from server.chemistry import calculate_lsi, calculate_chemical_dosages, calculate_pool_volume
from server.db import get_pool_by_id, get_pool_tests, get_all_pools

# Definições de Ferramentas no padrão Hermes / OpenAI Tool Calling Schema
HERMES_POOL_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "pool_diagnose_water",
            "description": "Analisa os parâmetros físico-químicos da água (pH, cloro livre, alcalinidade, dureza, cianúrico, temperatura) e calcula o índice de saturação LSI, identificando se a água está corrosiva, equilibrada ou incrustante.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ph": {"type": "number", "description": "Valor do pH medido (ex: 7.2 a 8.2)"},
                    "temperature_c": {"type": "number", "description": "Temperatura da água em graus Celsius (padrão 25.0)"},
                    "calcium_hardness_ppm": {"type": "number", "description": "Dureza Cálcica em ppm (padrão 250.0)"},
                    "total_alkalinity_ppm": {"type": "number", "description": "Alcalinidade Total em ppm (padrão 100.0)"},
                    "cyanuric_acid_ppm": {"type": "number", "description": "Ácido Cianúrico / Estabilizador em ppm (padrão 30.0)"},
                    "free_chlorine_ppm": {"type": "number", "description": "Cloro Livre Disponível em ppm"}
                },
                "required": ["ph", "total_alkalinity_ppm"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pool_calculate_dosages",
            "description": "Calcula a quantidade exata em gramas, kg ou ml de produtos químicos necessários para corrigir o pH, cloro, alcalinidade ou estabilizador de acordo com o volume da piscina.",
            "parameters": {
                "type": "object",
                "properties": {
                    "volume_liters": {"type": "number", "description": "Volume total da piscina em Litros"},
                    "current_ph": {"type": "number", "description": "pH atual da piscina"},
                    "target_ph": {"type": "number", "description": "pH desejado (padrão 7.4)"},
                    "current_fc": {"type": "number", "description": "Cloro livre atual em ppm"},
                    "target_fc": {"type": "number", "description": "Cloro livre alvo em ppm (padrão 3.0)"},
                    "current_ta": {"type": "number", "description": "Alcalinidade atual em ppm"},
                    "target_ta": {"type": "number", "description": "Alcalinidade alvo em ppm (padrão 100.0)"}
                },
                "required": ["volume_liters", "current_ph"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "pool_troubleshoot_symptom",
            "description": "Diagnostica problemas comuns de piscina (água verde, água turva/leitosa, cheiro forte de cloro, espumas, manchas nas paredes, pressão alta no filtro) e retorna um plano de ação passo a passo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "symptom": {
                        "type": "string",
                        "enum": ["agua_verde", "agua_turva", "odor_cloro_olhos", "espuma", "manchas_metais", "pressao_filtro_alta", "bomba_sem_pressao"],
                        "description": "Código do sintoma identificado na piscina"
                    },
                    "volume_liters": {"type": "number", "description": "Volume da piscina em litros"}
                },
                "required": ["symptom"]
            }
        }
    }
]

def execute_pool_diagnose_water(arguments: Dict[str, Any]) -> Dict[str, Any]:
    ph = float(arguments.get("ph", 7.4))
    temp_c = float(arguments.get("temperature_c", 25.0))
    ch = float(arguments.get("calcium_hardness_ppm", 250.0))
    ta = float(arguments.get("total_alkalinity_ppm", 100.0))
    cya = float(arguments.get("cyanuric_acid_ppm", 30.0))
    fc = float(arguments.get("free_chlorine_ppm", 2.0))

    lsi_result = calculate_lsi(
        ph=ph,
        temperature_c=temp_c,
        calcium_hardness_ppm=ch,
        total_alkalinity_ppm=ta,
        cyanuric_acid_ppm=cya
    )

    alerts = []
    if ph < 7.2:
        alerts.append("⚠️ pH ÁCIDO (< 7.2): Corrosivo para motores, rejuntes e causa queimação nos olhos.")
    elif ph > 7.8:
        alerts.append("⚠️ pH ALTO (> 7.8): Reduz dramaticamente a eficácia do cloro e propicia calcificação.")
        
    if fc < 1.0:
        alerts.append("🚨 CLORO INSUFICIENTE (< 1.0 ppm): Risco iminente de proliferação de bactérias e algas.")
    elif fc > 5.0:
        alerts.append("ℹ️ Cloro Elevado (> 5.0 ppm): Aguarde dissipação natural ou banho apenas com precaução.")

    if ta < 80:
        alerts.append("⚠️ Alcalinidade Baixa (< 80 ppm): Instabilidade de pH (pH oscilando facilmente).")
    elif ta > 120:
        alerts.append("⚠️ Alcalinidade Alta (> 120 ppm): Dificuldade para ajustar o pH (pH travado no alto).")

    return {
        "lsi_analysis": lsi_result,
        "active_alerts": alerts,
        "water_quality_score": max(0, min(100, int(100 - (abs(lsi_result['lsi']) * 50) - (0 if 1.5 <= fc <= 4.0 else 25) - (0 if 7.2 <= ph <= 7.6 else 20))))
    }

def execute_pool_calculate_dosages(arguments: Dict[str, Any]) -> Dict[str, Any]:
    vol = float(arguments.get("volume_liters", 45000))
    c_ph = float(arguments.get("current_ph", 7.4))
    t_ph = float(arguments.get("target_ph", 7.4))
    c_fc = float(arguments.get("current_fc", 1.0))
    t_fc = float(arguments.get("target_fc", 3.0))
    c_ta = float(arguments.get("current_ta", 80.0))
    t_ta = float(arguments.get("target_ta", 100.0))

    return calculate_chemical_dosages(
        volume_liters=vol,
        current_ph=c_ph,
        target_ph=t_ph,
        current_fc=c_fc,
        target_fc=t_fc,
        current_ta=c_ta,
        target_ta=t_ta
    )

def execute_pool_troubleshoot_symptom(arguments: Dict[str, Any]) -> Dict[str, Any]:
    symptom = arguments.get("symptom")
    volume = arguments.get("volume_liters", 45000)
    scale = volume / 10000.0

    troubleshooting_guides = {
        "agua_verde": {
            "title": "Protocolo de Choque para Piscina Verde (Algas)",
            "cause": "Falta de cloro livre residual (< 1.0 ppm), pH desajustado e presença de fosfatos/algas.",
            "steps": [
                "1. Escove vigorosamente todas as paredes, fundo e escadas para desprender o biofilme de algas.",
                f"2. Ajuste o pH para 7.2 (em pH mais baixo o cloro tem até 65% de eficácia oxidante).",
                f"3. Supercloração de Choque: Adicione ~{int(150 * scale)} g de Cloro Granulado (Hipoclorito de Cálcio ou Dicloro) por 10m³ à noite.",
                f"4. Adicione Algicida de Choque conforme fabricante (~50 a 70 ml por 10m³). *Atenção: não use algicida à base de cobre se houver risco de manchas.*",
                "5. Mantenha a bomba filtrando continuamente por 24 a 48 horas.",
                "6. Aplique Clarificante/Floculante se necessário e aspire o fundo drenando no dia seguinte."
            ],
            "estimated_recovery": "24 a 48 horas"
        },
        "agua_turva": {
            "title": "Protocolo de Clarificação de Água Turva / Leitosa",
            "cause": "Filtração insuficiente, partículas microscópicas em suspensão, LSI incrustante ou início de algas.",
            "steps": [
                "1. Verifique a pressão do filtro. Se estiver 8-10 PSI acima do normal, faça retrolavagem imediata.",
                "2. Meça e corrija o pH para 7.4 e a Alcalinidade para 100 ppm.",
                f"3. Adicione Clarificante Concentrado (~15 ml por 10m³ de água).",
                "4. Deixe o filtro ligado na posição FILTRAR por 12 horas ininterruptas.",
                "5. Se persistir, use oxidante sem cloro ou faça floculação com Sulfato de Alumínio (apenas para aspiração drenando)."
            ],
            "estimated_recovery": "12 a 24 horas"
        },
        "odor_cloro_olhos": {
            "title": "Protocolo para Eliminação de Cloraminas (Cheiro Forte e Ardor nos Olhos)",
            "cause": "Presença de Cloro Combinado (Cloraminas), produto da reação entre o cloro e resíduos orgânicos/suor/urina. Paradoxalmente, falta cloro livre para oxidar as cloraminas.",
            "steps": [
                "1. Meça o Cloro Livre (FC) e Cloro Total (TC). Calcule CC = TC - FC.",
                "2. Realize a Cloração de Ponto de Quebra (Breakpoint Chlorination): Adicione 10x a concentração de CC em cloro livre.",
                "3. Deixe a piscina destampada e exposta à luz solar/ar para que as cloraminas volatilizem.",
                "4. O ardor e o cheiro desaparecerão completamente após a oxidação total."
            ],
            "estimated_recovery": "6 a 12 horas"
        },
        "pressao_filtro_alta": {
            "title": "Protocolo para Pressão Alta no Manômetro do Filtro",
            "cause": "Areia saturada de detritos, cartucho entupido, calcificação ou válvulas de retorno parcialmente fechadas.",
            "steps": [
                "1. Desligue a bomba.",
                "2. Mude a alavanca da válvula seletora para RETROLAVAR (Backwash) e ligue por 2 a 3 minutos até o visor de vidro ficar limpo.",
                "3. Desligue a bomba, mude para ENXAGUAR (Rinse) por 30 a 60 segundos.",
                "4. Retorne para FILTRAR e confira se o manômetro voltou ao baseline (pressão normal).",
                "5. Se a pressão continuar alta após retrolavagem, a areia do filtro pode estar petrificada (vida útil de 2 a 3 anos expirada)."
            ],
            "estimated_recovery": "Imediato (10 minutos)"
        }
    }

    return troubleshooting_guides.get(
        symptom,
        {
            "title": f"Diagnóstico Geral: {symptom}",
            "cause": "Desequilíbrio de parâmetros ou manutenção pendente.",
            "steps": [
                "1. Meça pH, Cloro Livre e Alcalinidade com a fita teste ou kit reagente.",
                "2. Ajuste o pH para 7.4 e o Cloro para 3.0 ppm.",
                "3. Limpe os cestos do skimmer e pré-filtro e filtre por 8 horas."
            ],
            "estimated_recovery": "24 horas"
        }
    )

def handle_hermes_tool_call(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    if tool_name == "pool_diagnose_water":
        return execute_pool_diagnose_water(arguments)
    elif tool_name == "pool_calculate_dosages":
        return execute_pool_calculate_dosages(arguments)
    elif tool_name == "pool_troubleshoot_symptom":
        return execute_pool_troubleshoot_symptom(arguments)
    else:
        return {"error": f"Ferramenta desconhecida: {tool_name}"}
