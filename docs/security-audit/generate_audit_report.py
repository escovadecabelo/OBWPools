# -*- coding: utf-8 -*-
"""
Gerador de Relatório de Auditoria de Segurança — OBW Pools
Formato A4, Paleta Corporativa de Segurança, Gráficos Matplotlib e Issues GitHub.
"""

import os
import io
import datetime
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak
)
from reportlab.pdfgen import canvas

# Paleta oficial requerida
COLOR_CRITICAL = "#B91C1C"
COLOR_HIGH = "#EA580C"
COLOR_MEDIUM = "#D97706"
COLOR_LOW = "#2563EB"
COLOR_STRONG = "#059669"
COLOR_DARK = "#0F172A"
COLOR_CARD_BG = "#F8FAFC"
COLOR_BORDER = "#CBD5E1"

class NumberedCanvas(canvas.Canvas):
    """Canvas de duas passagens para calcular o número total de páginas."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        # Ignora cabeçalho e rodapé na primeira página (capa)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Cabeçalho
        self.drawString(1.8 * cm, 28.3 * cm, "OBW Pools — Relatório de Auditoria de Segurança de Código-Fonte")
        self.drawRightString(A4[0] - 1.8 * cm, 28.3 * cm, "Confidencial • Uso Interno")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(1.8 * cm, 28.1 * cm, A4[0] - 1.8 * cm, 28.1 * cm)

        # Rodapé
        self.line(1.8 * cm, 1.6 * cm, A4[0] - 1.8 * cm, 1.6 * cm)
        self.drawString(1.8 * cm, 1.1 * cm, f"Gerado em {datetime.datetime.now().strftime('%d/%m/%Y')} • OWASP Top 10 Security Review")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(A4[0] - 1.8 * cm, 1.1 * cm, page_text)

        self.restoreState()

def generate_charts():
    """Gera gráficos de rosca e barras em alta resolução."""
    # 1. Gráfico de Rosca por Severidade
    labels_sev = ['Crítica (2)', 'Alta (4)', 'Média (3)', 'Baixa (1)']
    counts_sev = [2, 4, 3, 1]
    colors_sev = [COLOR_CRITICAL, COLOR_HIGH, COLOR_MEDIUM, COLOR_LOW]

    fig, ax = plt.subplots(figsize=(3.9, 2.5), dpi=220)
    wedges, texts, autotexts = ax.pie(
        counts_sev,
        labels=labels_sev,
        autopct='%1.0f%%',
        pctdistance=0.72,
        colors=colors_sev,
        startangle=140,
        wedgeprops=dict(width=0.42, edgecolor='white', linewidth=2),
        textprops=dict(color='#1E293B', fontsize=7.5, fontweight='bold')
    )
    for at in autotexts:
        at.set_color('white')
        at.set_fontweight('bold')
        at.set_fontsize(8.0)

    ax.set_title("Distribuição por Severidade", fontsize=9.5, fontweight='bold', color='#0F172A', pad=6)
    plt.tight_layout()
    donut_buf = io.BytesIO()
    plt.savefig(donut_buf, format='png', transparent=True)
    plt.close()
    donut_buf.seek(0)

    # 2. Gráfico de Barras por Categoria
    categories = [
        '1. Banco Sem\nTranca',
        '2. Permissão no\nNavegador',
        '3. IDOR / Posse\nde Objeto',
        '4. Chaves e\nSegredos',
        '5. Inputs / XSS\ne Validação'
    ]
    counts_cat = [3, 2, 2, 2, 1]
    cat_colors = [COLOR_CRITICAL, COLOR_CRITICAL, COLOR_HIGH, COLOR_HIGH, COLOR_LOW]

    fig, ax = plt.subplots(figsize=(4.7, 2.5), dpi=220)
    bars = ax.bar(categories, counts_cat, color=cat_colors, width=0.52, edgecolor='none', zorder=3)
    ax.grid(axis='y', linestyle='--', alpha=0.4, zorder=0)
    ax.set_axisbelow(True)
    ax.set_ylabel("Qtd de Achados", fontsize=7.5, fontweight='bold', color='#475569')
    ax.set_title("Achados por Categoria Auditada", fontsize=9.5, fontweight='bold', color='#0F172A', pad=6)
    ax.tick_params(axis='x', labelsize=7.0)
    ax.tick_params(axis='y', labelsize=7.0)
    ax.set_ylim(0, 4.2)

    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{int(height)}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 2),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8.0, fontweight='bold', color='#1E293B')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#CBD5E1')
    ax.spines['bottom'].set_color('#CBD5E1')

    plt.tight_layout()
    bar_buf = io.BytesIO()
    plt.savefig(bar_buf, format='png', transparent=True)
    plt.close()
    bar_buf.seek(0)

    return donut_buf, bar_buf

def build_pdf(filename="relatorio-auditoria-seguranca.pdf"):
    pdf_path = os.path.join(os.path.dirname(__file__), filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=5
    )

    style_cover_sub = ParagraphStyle(
        'CoverSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    style_h1 = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=3
    )

    style_body_bold = ParagraphStyle(
        'BodyBold',
        parent=style_body,
        fontName='Helvetica-Bold'
    )

    style_chip_crit = ParagraphStyle(
        'ChipCrit',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.0,
        textColor=colors.HexColor(COLOR_CRITICAL),
        alignment=1
    )
    style_chip_high = ParagraphStyle(
        'ChipHigh',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.0,
        textColor=colors.HexColor(COLOR_HIGH),
        alignment=1
    )
    style_chip_med = ParagraphStyle(
        'ChipMed',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.0,
        textColor=colors.HexColor(COLOR_MEDIUM),
        alignment=1
    )
    style_chip_low = ParagraphStyle(
        'ChipLow',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.0,
        textColor=colors.HexColor(COLOR_LOW),
        alignment=1
    )

    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor('#0F172A')
    )

    style_issue_code = ParagraphStyle(
        'IssueCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.6,
        leading=8.6,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # ==========================================
    # PÁGINA 1: CAPA & NOTA METODOLÓGICA
    # ==========================================
    badge_data = [[
        Paragraph("<font color='#0284C7'><b>RELATÓRIO DE AUDITORIA DE SEGURANÇA E CONFORMIDADE DE CÓDIGO-FONTE</b></font>", style_body)
    ]]
    t_badge = Table(badge_data, colWidths=[17.4 * cm])
    t_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E0F2FE')),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_badge)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Relatório de Auditoria de Segurança — OBW Pools", style_cover_title))
    story.append(Paragraph(
        "Avaliação exaustiva de vulnerabilidades arquiteturais, controle de acesso, isolamento de dados e riscos de injeção.",
        style_cover_sub
    ))

    # Tabela Metadados da Capa
    meta_table_data = [
        [Paragraph("<b>Projeto:</b> OBW Pools (WandPool)", style_body), Paragraph("<b>Data da Auditoria:</b> 28 de Agosto de 2026", style_body)],
        [Paragraph("<b>Versão Avaliada:</b> 1.0.0 (FastAPI + React 19)", style_body), Paragraph("<b>Tipo de Auditoria:</b> White-Box / Source Code Review", style_body)],
        [Paragraph("<b>Classificação:</b> Confidencial / Engenharia", style_body), Paragraph("<b>Status Geral:</b> <font color='#B91C1C'><b>Requer Remediação Imediata (P1)</b></font>", style_body)]
    ]
    t_meta = Table(meta_table_data, colWidths=[8.7 * cm, 8.7 * cm])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # Nota Metodológica
    story.append(Paragraph("1. Detecção da Stack & Nota Metodológica", style_h1))
    story.append(Paragraph(
        "A auditoria realizou o rastreamento integral do repositório OBW Pools, identificando os componentes tecnológicos e mapeando as cinco categorias de segurança para o contexto técnico específico desta stack:",
        style_body
    ))

    stack_info = [
        [Paragraph("<b>Camada</b>", style_body_bold), Paragraph("<b>Tecnologia Detectada</b>", style_body_bold), Paragraph("<b>Mapeamento Metodológico da Categoria de Segurança</b>", style_body_bold)],
        [Paragraph("<b>Backend API</b>", style_body), Paragraph("Python 3.12+ / FastAPI", style_body), Paragraph("Análise de rotas, dependências (Depends), middlewares e políticas CORS.", style_body)],
        [Paragraph("<b>Banco / ORM</b>", style_body), Paragraph("SQLite nativo (sqlite3)", style_body), Paragraph("<b>BANCO SEM TRANCA:</b> Ausência de <code>tenant_id</code> e filtros em queries SQL diretas.", style_body)],
        [Paragraph("<b>Frontend Web</b>", style_body), Paragraph("React 19, TypeScript, Vite 8", style_body), Paragraph("<b>PERMISSÃO NO BROWSER:</b> Verificação de gates em <code>/portal</code> sem espelhamento na API.", style_body)],
        [Paragraph("<b>Mobile App</b>", style_body), Paragraph("Capacitor 8.5 (Android / Camera / GPS)", style_body), Paragraph("Armazenamento local (localStorage) e segurança de dados de telemetria.", style_body)],
        [Paragraph("<b>Deploy / CI</b>", style_body), Paragraph("Cloudflare Pages (wrangler.toml)", style_body), Paragraph("<b>CHAVES EXPOSTAS:</b> Análise de <code>.env.production</code> e segredos no startup.", style_body)]
    ]
    t_stack = Table(stack_info, colWidths=[2.8 * cm, 4.4 * cm, 10.2 * cm])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_stack)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 2: RESUMO EXECUTIVO & ANÁLISE DE POSTURA
    # ==========================================
    story.append(Paragraph("2. Resumo Executivo", style_h1))
    story.append(Paragraph(
        "Foram identificados <b>10 achados de segurança</b> (<b>2 Críticos</b>, <b>4 Altos</b>, <b>3 Médios</b> e <b>1 Baixo</b>). "
        "A causa raiz é a <b>ausência completa de autenticação no backend FastAPI</b>, combinada com uma falsa sensação de proteção decorrente do roteamento no cliente React (que apenas oculta visualmente o painel sem blindar os endpoints REST).",
        style_body
    ))
    story.append(Spacer(1, 2))

    # Gráficos lado a lado
    donut_buf, bar_buf = generate_charts()
    chart_row = [
        [Image(donut_buf, width=8.4 * cm, height=5.3 * cm), Image(bar_buf, width=8.6 * cm, height=5.3 * cm)]
    ]
    t_charts = Table(chart_row, colWidths=[8.6 * cm, 8.8 * cm])
    t_charts.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_charts)
    story.append(Spacer(1, 6))

    # Análise de Postura
    story.append(Paragraph("3. Análise de Postura: Pontos Fortes e Riscos Centrais", style_h1))
    posture_data = [
        [
            Paragraph("<font color='#059669'><b>PONTOS FORTES (Defesas Ativas Verificadas)</b></font>", style_body),
            Paragraph("<font color='#B91C1C'><b>RISCOS CENTRAIS (Vulnerabilidades Encontradas)</b></font>", style_body)
        ],
        [
            Paragraph(
                "• <b>Queries SQL 100% Parametrizadas:</b> Em <code>server/db.py</code>, todas as operações usam marcadores <code>?</code> (placeholders), neutralizando Injeção de SQL (SQLi).<br/>"
                "• <b>Escape Nativo contra XSS no React 19:</b> Ausência total de <code>dangerouslySetInnerHTML</code>, <code>eval()</code> ou <code>innerHTML</code>.<br/>"
                "• <b>Headers HTTP de Proteção:</b> Arquivo <code>client/public/_headers</code> configurado com <code>X-Frame-Options: DENY</code> e <code>X-Content-Type-Options: nosniff</code>.<br/>"
                "• <b>Validação com Pydantic:</b> Modelos de entrada bem definidos no FastAPI.",
                style_body
            ),
            Paragraph(
                "• <b>API Pública sem Autenticação:</b> 100% dos endpoints REST abertos sem exigência de JWT, Bearer Token ou Sessão.<br/>"
                "• <b>Vazamento de Códigos de Portão (Gate Codes):</b> O endpoint <code>GET /api/pools</code> entrega códigos de acesso físico a residências para qualquer chamador anônimo.<br/>"
                "• <b>IDOR Generalizado:</b> Rotas como <code>PUT /api/pools/{id}</code> e <code>DELETE /api/technicians/{id}</code> permitem sequestro ou destruição de dados.<br/>"
                "• <b>CORS Permissivo:</b> <code>allow_origins=['*']</code> com credenciais.",
                style_body
            )
        ]
    ]
    t_posture = Table(posture_data, colWidths=[8.7 * cm, 8.7 * cm])
    t_posture.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#ECFDF5')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#FEF2F2')),
        ('BACKGROUND', (0,1), (0,1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,1), (1,1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_posture)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 3: TABELA DE ACHADOS DETALHADOS
    # ==========================================
    story.append(Paragraph("4. Tabela de Achados Detalhados por Categoria", style_h1))
    story.append(Paragraph("Listagem exaustiva de achados verificados no código-fonte real, mapeados linha por linha:", style_body))

    findings_table_data = [
        [
            Paragraph("<b>Sev.</b>", style_body_bold),
            Paragraph("<b>Categoria</b>", style_body_bold),
            Paragraph("<b>Arquivo e Linha(s)</b>", style_body_bold),
            Paragraph("<b>Descrição e Impacto de Segurança</b>", style_body_bold)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>CRÍTICA</b></font>", style_chip_crit),
            Paragraph("1. Banco Sem Tranca", style_body_bold),
            Paragraph("<code>server/db.py:574-586</code><br/><code>server/main.py:221-224</code>", style_code),
            Paragraph("<b>Vazamento irrestrito de dados e códigos de portão de clientes:</b> <code>GET /api/pools</code> executa <code>SELECT * FROM pools</code> sem autenticação ou filtro de tenant, expondo nomes, telefones, endereços e <code>gate_code</code> (códigos físicos de acesso a residências).", style_body)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>CRÍTICA</b></font>", style_chip_crit),
            Paragraph("2. Permissão no Browser", style_body_bold),
            Paragraph("<code>client/src/App.tsx:28-30</code><br/><code>server/main.py:77-315</code>", style_code),
            Paragraph("<b>Painel administrativo bloqueado só na UI do React:</b> A alternância para a área operacional depende de <code>isPortalPath(pathname)</code>. Todos os 14 endpoints de escrita (CRUD de técnicos, rotas e piscinas) na API aceitam chamadas diretas não autenticadas.", style_body)
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_chip_high),
            Paragraph("3. IDOR / Posse", style_body_bold),
            Paragraph("<code>server/main.py:240-246</code><br/><code>server/db.py:805-810</code>", style_code),
            Paragraph("<b>Alteração não autorizada de piscina e código de portão (IDOR):</b> <code>PUT /api/pools/{pool_id}</code> atualiza qualquer registro no banco pelo ID do path sem checar autorização, permitindo sequestro cadastral ou adulteração de gate codes.", style_body)
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_chip_high),
            Paragraph("3. IDOR / Posse", style_body_bold),
            Paragraph("<code>server/main.py:90-96</code><br/><code>server/db.py:884-897</code>", style_code),
            Paragraph("<b>Exclusão arbitrária de técnicos e rotas (IDOR / Destrutivo):</b> <code>DELETE /api/technicians/{tech_id}</code> remove o funcionário e apaga em cascata todas as rotas vinculadas a ele sem validação de papel admin.", style_body)
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_chip_high),
            Paragraph("4. Chaves Expostas", style_body_bold),
            Paragraph("<code>server/db.py:193-349</code><br/><code>client/src/lib/api.ts:663-810</code>", style_code),
            Paragraph("<b>Códigos reais de portão/acesso físico hardcoded:</b> Instruções de portão (ex: <i>'Gate #4821'</i>, <i>'Código Portão *7720'</i>) estão fixadas no código-fonte Python e distribuídas nos fallbacks JavaScript do cliente.", style_body)
        ],
        [
            Paragraph("<font color='#EA580C'><b>ALTA</b></font>", style_chip_high),
            Paragraph("1. Banco Sem Tranca", style_body_bold),
            Paragraph("<code>server/main.py:47-53</code>", style_code),
            Paragraph("<b>CORS Wildcard com Credenciais Habilitadas:</b> Configuração <code>allow_origins=['*']</code> e <code>allow_credentials=True</code> permite que scripts de terceiros em qualquer aba do navegador leiam dados da API.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_chip_med),
            Paragraph("1. Banco Sem Tranca", style_body_bold),
            Paragraph("<code>server/db.py:816-831</code><br/><code>server/main.py:72-75</code>", style_code),
            Paragraph("<b>Exposição irrestrita da equipe de funcionários:</b> <code>GET /api/technicians</code> lista nomes completos, telefones, e-mails e rotas ativas sem autenticação.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_chip_med),
            Paragraph("2. Permissão no Browser", style_body_bold),
            Paragraph("<code>client/src/lib/leadGuard.ts:7-13</code><br/><code>TurnstileWidget.tsx:51-73</code>", style_code),
            Paragraph("<b>Validação de Bot/Turnstile restrita ao frontend:</b> O token Cloudflare Turnstile e o honeypot não são verificados via chamada server-side (<code>siteverify</code>), permitindo bypass por bots.", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>MÉDIA</b></font>", style_chip_med),
            Paragraph("4. Chaves Expostas", style_body_bold),
            Paragraph("<code>client/.env.production:1</code><br/><code>server/main.py:34-57</code>", style_code),
            Paragraph("<b>Arquivo .env.production versionado no git e ausência de verificação de startup:</b> Falta validação de variáveis de ambiente obrigatórias e segredos criptográficos no boot do FastAPI.", style_body)
        ],
        [
            Paragraph("<font color='#2563EB'><b>BAIXA</b></font>", style_chip_low),
            Paragraph("5. Inputs / XSS", style_body_bold),
            Paragraph("<code>client/src/components/ServiceChecklist.tsx:123</code>", style_code),
            Paragraph("<b>Interpolação de URLs sem validação de esquema de protocolo:</b> Chamadas <code>window.open</code> constroem URLs de WhatsApp/Maps interpolando dados do banco sem sanitizar o esquema.", style_body)
        ]
    ]

    t_findings = Table(findings_table_data, colWidths=[1.7 * cm, 3.2 * cm, 3.7 * cm, 8.8 * cm])
    t_findings.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_findings)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 4: PLANO DE REMEDIAÇÃO & ISSUE 1
    # ==========================================
    story.append(Paragraph("5. Plano de Remediação Priorizado", style_h1))

    recs_data = [
        [
            Paragraph("<b>Prioridade</b>", style_body_bold),
            Paragraph("<b>Ação Recomendada</b>", style_body_bold),
            Paragraph("<b>Impacto e Prazo Sugerido</b>", style_body_bold)
        ],
        [
            Paragraph("<font color='#B91C1C'><b>P1 (Crítica)</b></font>", style_body),
            Paragraph("<b>Implementar Autenticação Obrigatória no FastAPI:</b> Adicionar middleware / dependência de autenticação (JWT / OAuth2 Bearer) em todas as rotas <code>/api/*</code>. Proteger imediatamente a leitura e escrita de piscinas e códigos de portão.", style_body),
            Paragraph("Elimina vazamento de dados físicos de clientes. <i>Prazo: Imediato (&lt; 24h)</i>", style_body)
        ],
        [
            Paragraph("<font color='#EA580C'><b>P2 (Alta)</b></font>", style_body),
            Paragraph("<b>Adicionar Tenant Scoping & Validação de Posse (Anti-IDOR):</b> Introduzir coluna <code>tenant_id</code> e <code>user_id</code> nas tabelas do SQLite. Validar se o usuário logado possui autorização para alterar a piscina ou rota especificada antes de executar o <code>UPDATE</code> ou <code>DELETE</code>.", style_body),
            Paragraph("Impede sequestro de contas e destruição de dados entre técnicos e empresas. <i>Prazo: 48h</i>", style_body)
        ],
        [
            Paragraph("<font color='#D97706'><b>P3 (Média)</b></font>", style_body),
            Paragraph("<b>CORS Restritivo e Validação de Turnstile no Servidor:</b> Restringir <code>allow_origins</code> para os domínios oficiais da empresa (ex: <code>https://obwpools.com</code>). Criar endpoint no FastAPI para validar o token do Cloudflare Turnstile via API antes de aceitar leads.", style_body),
            Paragraph("Bloqueia automações maliciosas e requisições cross-site. <i>Prazo: 1 semana</i>", style_body)
        ],
        [
            Paragraph("<font color='#2563EB'><b>P4 (Baixa)</b></font>", style_body),
            Paragraph("<b>Limpeza de Fallbacks com Dados Sensíveis e Sanitização de URLs:</b> Remover senhas e códigos reais de portão dos arquivos <code>client/src/lib/api.ts</code> e <code>server/db.py</code>. Aplicar sanitizador de esquema em links de WhatsApp e mapas.", style_body),
            Paragraph("Higiene de código e eliminação de vestígios estáticos. <i>Prazo: Próximo sprint</i>", style_body)
        ]
    ]
    t_recs = Table(recs_data, colWidths=[2.6 * cm, 9.6 * cm, 5.2 * cm])
    t_recs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t_recs)
    story.append(Spacer(1, 8))

    # Início da Seção de Issues
    story.append(Paragraph("6. Issues Prontas para o GitHub (Copiar & Colar)", style_h1))
    story.append(Paragraph(
        "Textos integrais formatados em Markdown para abertura direta de issues no GitHub, contendo descrição técnica, evidência, impacto, sugestão de patch e checklist de aceite:",
        style_body
    ))
    story.append(Spacer(1, 4))

    # ISSUE 1
    issue1_text = """--- ISSUE 1 ---
## [Segurança] Implementar autenticação e isolamento de tenant na listagem e cadastro de piscinas

**Labels:** `security`, `critical`, `backend`, `auth`

### Descrição do Problema
O endpoint `GET /api/pools` executa uma consulta irrestrita `SELECT * FROM pools` no banco SQLite sem qualquer validação de autenticação (JWT/Session) ou isolamento de tenant/usuário.

### Por que é Explorável
Qualquer pessoa na internet pode enviar uma requisição GET para `/api/pools` e obter a lista completa de clientes cadastrados, telefones, e-mails, endereços e os códigos de acesso físico aos portões das residências (`gate_code`).

### Evidência
- **Arquivo:** `server/db.py:574-586` e `server/main.py:221-224`
```python
@app.get("/api/pools", response_model=List[Dict[str, Any]])
def list_pools():
    return get_all_pools()

def get_all_pools():
    cursor.execute("SELECT * FROM pools ORDER BY name ASC")
    return cursor.fetchall()
```

### Impacto
Vazamento crítico de dados pessoais (PII) e comprometimento da segurança física dos clientes (invasão de domicílio facilitada por códigos de portão expostos).

### Sugestão de Correção
1. Adicionar dependência de autenticação `Depends(get_current_user)` nas rotas de pools.
2. Adicionar coluna `tenant_id` ou `owner_id` na tabela `pools` e filtrar queries: `WHERE tenant_id = ?`.
3. Ofuscar ou exigir permissão especial para visualização do campo `gate_code`.

### Critérios de Aceite
- [ ] `GET /api/pools` sem header `Authorization: Bearer <token>` retorna HTTP 401 Unauthorized.
- [ ] Usuário logado enxerga apenas as piscinas associadas ao seu `tenant_id`.
- [ ] Campo `gate_code` não é retornado em listagens gerais.
--- FIM ISSUE 1 ---"""

    story.append(Paragraph("<b>ISSUE 1 — Falta de Autenticação e Isolamento de Tenant na API de Piscinas</b>", style_h2))
    clean_html1 = issue1_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>").replace(" ", "&nbsp;")
    t_code1 = Table([[Paragraph(clean_html1, style_issue_code)]], colWidths=[17.4 * cm])
    t_code1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code1)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 5: ISSUE 2 & ISSUE 3
    # ==========================================
    # ISSUE 2
    issue2_text = """--- ISSUE 2 ---
## [Segurança] Proteger endpoints de mutação no backend (Bypass de controle de acesso no cliente)

**Labels:** `security`, `critical`, `backend`, `rbac`

### Descrição do Problema
O controle de acesso à área restrita de técnicos e administração é executado unicamente no cliente React através da verificação `isPortalPath(pathname)`. Os endpoints de escrita no servidor FastAPI não exigem autenticação nem validam privilégios de administrador.

### Por que é Explorável
Um atacante pode ignorar completamente a interface do React e disparar requisições HTTP diretas (via curl/Postman) para endpoints como `POST /api/technicians`, `PUT /api/routes/{id}` ou `DELETE /api/technicians/{id}` e manipular toda a infraestrutura operacional da empresa.

### Evidência
- **Frontend:** `client/src/App.tsx:28-30` | **Backend:** `server/main.py:77-157`
```python
@app.post("/api/technicians")
def create_technician(payload: Dict[str, Any]):
    return save_technician(payload)
```

### Impacto
Manipulação não autorizada do quadro de funcionários, criação de rotas falsas e desvio operacional.

### Sugestão de Correção
1. Implementar RBAC (Role-Based Access Control) no FastAPI com roles `admin`, `technician` e `client`.
2. Proteger rotas de mutação de equipe e rotas com verificação de role `admin`.

### Critérios de Aceite
- [ ] Chamadas POST/PUT/DELETE em `/api/technicians` e `/api/routes` exigem autenticação.
- [ ] Requisições com role não autorizada retornam HTTP 403 Forbidden.
--- FIM ISSUE 2 ---"""

    story.append(Paragraph("<b>ISSUE 2 — Controle de Acesso Restrito ao Frontend (Bypass de Painel Administrativo)</b>", style_h2))
    clean_html2 = issue2_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>").replace(" ", "&nbsp;")
    t_code2 = Table([[Paragraph(clean_html2, style_issue_code)]], colWidths=[17.4 * cm])
    t_code2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code2)
    story.append(Spacer(1, 6))

    # ISSUE 3
    issue3_text = """--- ISSUE 3 ---
## [Segurança] Corrigir IDOR em rotas de atualização e exclusão (Piscinas, Técnicos e Rotas)

**Labels:** `security`, `high`, `backend`, `idor`

### Descrição do Problema
Endpoints parametrizados por ID (`PUT /api/pools/{pool_id}`, `DELETE /api/technicians/{tech_id}`, `DELETE /api/routes/stops/{stop_id}`) confiam cegamente no identificador fornecido na URL sem verificar se o recurso pertence ao usuário ou organização que fez a chamada.

### Por que é Explorável
Basta alterar o ID na URL (ex: `PUT /api/pools/pool-1`) para modificar o endereço, telefone ou código de portão de outro cliente, ou apagar técnicos e suas agendas de atendimento.

### Evidência
- **Arquivo:** `server/main.py:240-246`
```python
@app.put("/api/pools/{pool_id}")
def update_pool(pool_id: str, pool: Pool):
    pool_data = pool.dict()
    updated = update_pool_in_db(pool_id, pool_data)
```

### Impacto
Sobrescrita indevida de cadastros de clientes, adulteração de coordenadas GPS de rotas e exclusão acidental ou maliciosa de paradas de serviço.

### Sugestão de Correção
1. Antes de atualizar ou deletar, consultar se o recurso pertence ao `tenant_id` autenticado.
2. Utilizar UUIDs v4 não sequenciais e validar a posse do registro no banco antes da execução do `UPDATE`/`DELETE`.

### Critérios de Aceite
- [ ] Tentativa de alterar recurso de outro tenant retorna HTTP 403 ou 404.
- [ ] Testes automatizados cobrindo tentativas de IDOR entre dois usuários distintos.
--- FIM ISSUE 3 ---"""

    story.append(Paragraph("<b>ISSUE 3 — IDOR na Atualização e Exclusão de Piscinas, Técnicos e Paradas</b>", style_h2))
    clean_html3 = issue3_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>").replace(" ", "&nbsp;")
    t_code3 = Table([[Paragraph(clean_html3, style_issue_code)]], colWidths=[17.4 * cm])
    t_code3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code3)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 6: ISSUE 4 & ISSUE 5
    # ==========================================
    # ISSUE 4
    issue4_text = """--- ISSUE 4 ---
## [Segurança] Remover códigos de acesso físico hardcoded e isolar fallbacks do cliente

**Labels:** `security`, `high`, `privacy`, `cleanup`

### Descrição do Problema
Códigos reais de portão de clientes e condomínios no Texas (ex: `Gate #4821`, `Código Portão *7720`, `Keycard Guarita Leste`) estão hardcoded no script de seed do banco de dados (`server/db.py`) e no arquivo de fallbacks offline do frontend (`client/src/lib/api.ts`).

### Por que é Explorável
Os dados do frontend em `client/src/lib/api.ts` são empacotados no bundle JavaScript distribuído para qualquer usuário que acessar a Landing Page pública, expondo credenciais físicas de residências.

### Evidência
- **Frontend:** `client/src/lib/api.ts:677, 707, 737, 767, 797` | **Backend:** `server/db.py:202, 236, 269, 301, 334`
```typescript
gate_code: '#8842',
gate_code: 'Código: 1984',
gate_code: 'Portão Lateral Destravado',
```

### Impacto
Exposição pública de instruções de entrada em residências particulares de clientes.

### Sugestão de Correção
1. Substituir todos os fallbacks do frontend por dados fictícios (ex: `gate_code: 'Instruções fornecidas na chegada'`).
2. Armazenar códigos de portão no backend apenas sob criptografia em repouso e transmissão autenticada.

### Critérios de Aceite
- [ ] Nenhum código de portão real ou sensível presente no bundle gerado em `client/dist`.
- [ ] Fallbacks estáticos do React não contêm telefones ou endereços de clientes reais.
--- FIM ISSUE 4 ---"""

    story.append(Paragraph("<b>ISSUE 4 — Códigos de Portão e Credenciais Físicas Hardcoded no Código e no Banco</b>", style_h2))
    clean_html4 = issue4_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>").replace(" ", "&nbsp;")
    t_code4 = Table([[Paragraph(clean_html4, style_issue_code)]], colWidths=[17.4 * cm])
    t_code4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code4)
    story.append(Spacer(1, 6))

    # ISSUE 5
    issue5_text = """--- ISSUE 5 ---
## [Segurança] Restringir política de CORS e adicionar validação de configuração no startup

**Labels:** `security`, `medium`, `configuration`, `cors`

### Descrição do Problema
O middleware de CORS está configurado com `allow_origins=["*"]` e `allow_credentials=True`. Além disso, o servidor não possui validação de variáveis de ambiente no startup para garantir o carregamento de segredos essenciais.

### Por que é Explorável
Qualquer aplicação web rodando no navegador de um técnico pode efetuar requisições autenticadas para a API local ou remota e ler respostas confidenciais.

### Evidência
- **Arquivo:** `server/main.py:47-53`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Impacto
Vulnerabilidade a ataques de Cross-Origin Data Leakage.

### Sugestão de Correção
1. Substituir `allow_origins=["*"]` por lista explícita carregada de variável de ambiente `CORS_ORIGINS`.
2. Adicionar validação no lifespan do FastAPI para falhar o boot se variáveis críticas estiverem ausentes.

### Critérios de Aceite
- [ ] Requisições com `Origin: https://malicious-site.com` são bloqueadas pelo CORS.
- [ ] Variáveis de ambiente validadas via Pydantic `BaseSettings`.
--- FIM ISSUE 5 ---"""

    story.append(Paragraph("<b>ISSUE 5 — Configuração Insegura de CORS e Validação de Startup no FastAPI</b>", style_h2))
    clean_html5 = issue5_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>").replace(" ", "&nbsp;")
    t_code5 = Table([[Paragraph(clean_html5, style_issue_code)]], colWidths=[17.4 * cm])
    t_code5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code5)

    # Construir documento
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF gerado com sucesso em: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf()
