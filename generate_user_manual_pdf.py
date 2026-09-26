import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = os.path.join("LogicPlay", "Manual_Usuario_LogicPlay.pdf")
PDF_ROOT_COPY = "Manual_Usuario_LogicPlay.pdf"

# Numbered canvas for page numbers and running header/footer
class NumberedCanvas(canvas.Canvas):
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
        if self._pageNumber == 1:
            return  # Portada limpia sin cabecera/pie

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#7A5826"))  # Dim Gold

        # Header
        self.drawString(50, 752, "LOGIC-PLAY UPTT  |  MANUAL OFICIAL DE INSTRUCCIÓN DEL INSPECTOR")
        self.drawRightString(612 - 50, 752, "EXP-2026-PNFI · REV 1.0")
        self.setStrokeColor(colors.HexColor("#C49A45"))
        self.setLineWidth(0.6)
        self.line(50, 746, 612 - 50, 746)

        # Footer
        self.line(50, 44, 612 - 50, 44)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#555555"))
        self.drawString(50, 32, "UPTT Mario Briceño Iragorry · PNFI · Proyecto de Lógica Matemática")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(612 - 50, 32, page_str)
        self.restoreState()

def build_pdf():
    os.makedirs("LogicPlay", exist_ok=True)
    doc = SimpleDocTemplate(
        PDF_FILENAME,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=54,
        bottomMargin=52
    )

    styles = getSampleStyleSheet()

    # Colores temáticos institucionales / retro
    c_dark_red = colors.HexColor("#7A1215")
    c_gold_title = colors.HexColor("#8C5B14")
    c_gold_border = colors.HexColor("#C49A45")
    c_bg_panel = colors.HexColor("#F8F4EA")
    c_text = colors.HexColor("#1A1612")

    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark_red,
        alignment=1,
        spaceAfter=6
    )

    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4A3525"),
        alignment=1,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=17,
        textColor=c_dark_red,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_gold_title,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=c_text,
        leftIndent=14,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=colors.HexColor("#332415")
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=c_dark_red,
        alignment=1,
        spaceBefore=3,
        spaceAfter=6
    )

    story = []

    # ==========================================
    # PÁGINA 1: PORTADA OFICIAL
    # ==========================================
    story.append(Spacer(1, 10))

    inst_table = Table([
        [Paragraph(
            "<font size='8.5' color='#4A3215'><b>REPÚBLICA BOLIVARIANA DE VENEZUELA</b><br/>"
            "MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN UNIVERSITARIA<br/>"
            "<b>UPTT MARIO BRICEÑO IRAGORRY · PROGRAMA NACIONAL DE FORMACIÓN EN INFORMÁTICA (PNFI)</b></font>",
            ParagraphStyle('HInst', alignment=1, leading=11)
        )]
    ], colWidths=[512])
    inst_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_panel),
        ('BOX', (0,0), (-1,-1), 1, c_gold_border),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(inst_table)
    story.append(Spacer(1, 18))

    # Logo oficial
    if os.path.exists("web/img/logo.jpg"):
        logo_img = Image("web/img/logo.jpg", width=2.1*inch, height=2.1*inch)
        logo_img.hAlign = 'CENTER'
        story.append(logo_img)
        story.append(Spacer(1, 14))

    story.append(Paragraph("LOGIC-PLAY UPTT", title_cover))
    story.append(Paragraph("MANUAL DE USUARIO E INSTRUCCIÓN OPERATIVA<br/><b>PUESTO DE ADMISIÓN LÓGICO-PROPOSICIONAL</b>", subtitle_cover))

    badge_table = Table([
        [
            Paragraph("<font color='#8A181A'><b>EXPEDIENTE OFICIAL:</b> #2026-PNFI-LOGIC</font>", ParagraphStyle('B1', alignment=1, fontSize=9)),
            Paragraph("<font color='#5A4020'><b>DISPOSITIVO HOMOLOGADO:</b> Xiaomi Redmi 10 (Android 11+)</font>", ParagraphStyle('B2', alignment=1, fontSize=9))
        ]
    ], colWidths=[250, 262])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFE7D5")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#8A181A")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_gold_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 20))

    resumen_box = Table([
        [
            Paragraph(
                "<b>SINOPSIS DEL SISTEMA:</b><br/>"
                "El presente manual constituye la guía formativa oficial para el estudiante que asume el rol de <b>Inspector Lógico</b> en el simulador <i>Logic-Play</i>. "
                "Describe la instalación móvil del aplicativo, los elementos interactivos del puesto de inspección (HUD, ventanilla de seguridad y consola de pulsadores), "
                "y los criterios para evaluar proposiciones mediante conectores lógicos (&not;, &and;, &or;, &rarr;, &harr;) y tablas de verdad formalizadas.",
                callout_style
            )
        ]
    ], colWidths=[512])
    resumen_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FAF6EE")),
        ('BOX', (0,0), (-1,-1), 0.8, c_gold_border),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(resumen_box)
    story.append(Spacer(1, 25))

    story.append(Paragraph("<font size='8' color='#666666'>* Documento ilustrado con capturas de pantalla reales capturadas directamente desde el dispositivo de pruebas <b>Xiaomi Redmi 10</b> conectado por ADB.</font>", ParagraphStyle('FootnoteDev', alignment=1)))
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 2: INTRODUCCIÓN Y PANTALLA INICIAL
    # ==========================================
    story.append(Paragraph("1. Fundamentación y Propósito Formativo", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=6))

    story.append(Paragraph(
        "<b>LOGIC-PLAY</b> transforma el aprendizaje abstracto de la lógica proposicional en una dinámica inmersiva de toma de decisiones. "
        "El estudiante asume el rol de Inspector en la <b>Unidad de Admisión 014</b>, donde debe evaluar declaraciones emitidas por docentes y postulantes universitarios, "
        "dictaminando si los enunciados cumplen con el rigor de la lógica matemática.",
        body_style
    ))

    story.append(Paragraph("Ejes de Aprendizaje:", h2_style))
    story.append(Paragraph("• <b>Reconocimiento Proposicional:</b> Distinguir oraciones declarativas de preguntas, órdenes y deseos.", bullet_style))
    story.append(Paragraph("• <b>Cálculo de Tablas de Verdad:</b> Evaluar valores compuestos con conectores lógicos.", bullet_style))
    story.append(Paragraph("• <b>Pedagogía del Error:</b> Justificación deductiva inmediata tras cada decisión tomada.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("2. Pantalla de Inicio y Configuración de Turno", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=8))

    if os.path.exists("manual_assets/01_pantalla_inicio.png"):
        img_inicio = Image("manual_assets/01_pantalla_inicio.png", width=1.9*inch, height=4.22*inch)
        txt_inicio = Paragraph(
            "<b>ELEMENTOS DE LA PANTALLA DE INICIO (Figura 1):</b><br/><br/>"
            "<b>1. Nombre del Inspector:</b><br/>"
            "Permite ingresar el nombre o identificador del estudiante evaluado (ej: <i>Jean</i>).<br/><br/>"
            "<b>2. Selector de Nivel Inicial:</b><br/>"
            "Menú desplegable para iniciar en el Nivel 1 (bivalencia simple) o retomar niveles avanzados.<br/><br/>"
            "<b>3. Pautas del Turno:</b><br/>"
            "• Tocar la ficha del mostrador para ver el caso en detalle.<br/>"
            "• Consultar el <i>Manual del Inspector</i> ante dudas teóricas.<br/>"
            "• Cada dictamen erróneo resta una vida (corazón).<br/>"
            "• Se requieren <b>5 aciertos</b> para superar la jornada.<br/><br/>"
            "<b>4. Botón 'Iniciar Turno de Inspección':</b><br/>"
            "Da apertura a la compuerta de seguridad y presenta al primer solicitante.",
            body_style
        )
        t_sec2 = Table([[img_inicio, txt_inicio]], colWidths=[2.1*inch, 4.9*inch])
        t_sec2.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sec2)
        story.append(Paragraph("Figura 1: Captura de la pantalla de inicio en Redmi 10.", caption_style))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 3: EL PUESTO DE CONTROL
    # ==========================================
    story.append(Paragraph("3. Entorno de Inspección (Mesa de Trabajo)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=8))

    story.append(Paragraph(
        "El entorno de trabajo sitúa al usuario frente a la ventanilla de seguridad blindada (<i>Security Window Hatch 014</i>). "
        "A continuación se detallan sus componentes operativos:",
        body_style
    ))

    if os.path.exists("manual_assets/02_mesa_juego.png"):
        img_mesa = Image("manual_assets/02_mesa_juego.png", width=1.9*inch, height=4.22*inch)
        txt_mesa = Paragraph(
            "<b>MAPA DEL ESCRITORIO DE INSPECCIÓN (Figura 2):</b><br/><br/>"
            "<b>A. HUD Superior de Estatus:</b><br/>"
            "• <b>Botones A- / A+:</b> Control de accesibilidad para aumentar o reducir la tipografía del sistema en tiempo real.<br/>"
            "• <b>Indicador temático:</b> Muestra el nivel actual (ej: <i>N1: Proposiciones Lógicas</i>).<br/>"
            "• <b>Puntaje y Vidas:</b> Marcador de aciertos (x/5) y reserva de vidas representada en corazones rojos.<br/><br/>"
            "<b>B. Ventanilla de Solicitantes:</b><br/>"
            "Espacio donde los personajes presentan sus documentos y dialogan con el inspector.<br/><br/>"
            "<b>C. Ficha 'CASO LÓGICO':</b><br/>"
            "Documento oficial situado en el centro del mostrador. Al tocarlo se expande en formato de expediente.<br/><br/>"
            "<b>D. Acceso al 'Manual del Inspector':</b><br/>"
            "Pulsador situado al lado izquierdo (junto al teléfono antiguo). Abre el libro de teoría en plena partida.<br/><br/>"
            "<b>E. Consola de Mandos de Veredicto:</b><br/>"
            "• <b>Botón F (Rojo / LOCK):</b> Dictaminar Falso / Rechazar trámite.<br/>"
            "• <b>Botón V (Verde / UNLOCK):</b> Dictaminar Verdadero / Aprobar trámite.",
            body_style
        )
        t_sec3 = Table([[img_mesa, txt_mesa]], colWidths=[2.1*inch, 4.9*inch])
        t_sec3.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sec3)
        story.append(Paragraph("Figura 2: Puesto de trabajo activo con solicitante en ventanilla y consola de decisión.", caption_style))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 4: ANÁLISIS DE CASO Y MANUAL INTERNO
    # ==========================================
    story.append(Paragraph("4. Procedimiento de Inspección Paso a Paso", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=8))

    story.append(Paragraph(
        "Para validar un expediente sin cometer infracciones, el estudiante debe aplicar el siguiente método riguroso:",
        body_style
    ))

    if os.path.exists("manual_assets/03_caso_abierto.png") and os.path.exists("manual_assets/04_manual_inspector.png"):
        img_caso = Image("manual_assets/03_caso_abierto.png", width=2.0*inch, height=4.44*inch)
        img_manual = Image("manual_assets/04_manual_inspector.png", width=2.0*inch, height=4.44*inch)

        t_comparativa = Table([
            [img_caso, img_manual],
            [Paragraph("Figura 3: Expediente abierto con enunciado.", caption_style),
             Paragraph("Figura 4: Manual del Inspector consultado en sesión.", caption_style)]
        ], colWidths=[3.5*inch, 3.5*inch])
        t_comparativa.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(t_comparativa)
        story.append(Spacer(1, 4))

        story.append(Paragraph(
            "<b>ANÁLISIS DEL EJEMPLO (Figuras 3 y 4):</b><br/>"
            "• <b>Caso presentado:</b> El <i>Prof. Ricardo Silva</i> entrega la solicitud con el enunciado: <i>'Ojalá el laboratorio tenga conexión estable hoy.'</i><br/>"
            "• <b>Consulta de Criterio:</b> Al revisar el <i>Manual del Inspector</i> (Fig. 4), se establece que las oraciones desiderativas (deseos) y exclamativas <b>no son proposiciones lógicas</b> porque carecen de valor de verdad intrínseco (no pueden declararse verdaderas ni falsas en sentido estricto).<br/>"
            "• <b>Acción del Inspector:</b> El inspector debe cerrar el expediente y pulsar <b>F (LOCK)</b> para denegar la validez proposicional del registro.",
            callout_style
        ))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 5: RESOLUCIÓN, TABLA DE NIVELES Y GUÍA
    # ==========================================
    story.append(Paragraph("5. Retroalimentación Pedagógica y Veredicto", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=6))

    if os.path.exists("manual_assets/06_dictamen_sello.png"):
        img_dictamen = Image("manual_assets/06_dictamen_sello.png", width=1.75*inch, height=3.88*inch)
        txt_feedback = Paragraph(
            "<b>EVALUACIÓN DEL DICTAMEN (Figura 5):</b><br/><br/>"
            "<b>1. Acierto (&check; ¡DICTAMEN CORRECTO!):</b><br/>"
            "El sistema valida la decisión y expone la justificación formativa (ej: <i>'Correcto: expresa un deseo. RECHAZAR'</i>), sumando un punto hacia la meta del nivel.<br/><br/>"
            "<b>2. Error (&cross; DICTAMEN INCORRECTO):</b><br/>"
            "Se emite un aviso sonoro, se descuenta 1 corazón y el sistema explica el motivo de la discrepancia para que el alumno asimile la regla lógica.<br/><br/>"
            "<b>3. Continuar Inspección:</b><br/>"
            "El botón inferior cierra la ventana de veredicto y permite recibir al siguiente solicitante.",
            body_style
        )
        t_sec5 = Table([[img_dictamen, txt_feedback]], colWidths=[1.95*inch, 5.05*inch])
        t_sec5.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sec5)
        story.append(Paragraph("Figura 5: Pantalla de veredicto positivo con explicación didáctica.", caption_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("6. Cuadro de Progresión y Conectores Lógicos", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=4))

    tabla_niveles_data = [
        [Paragraph("<b>Nivel</b>", caption_style), Paragraph("<b>Materia</b>", caption_style), Paragraph("<b>Simbología y Regla</b>", caption_style), Paragraph("<b>Condición de Éxito</b>", caption_style)],
        [Paragraph("<b>Nivel 1</b>", body_style), Paragraph("Proposiciones Simples", body_style), Paragraph("Declarativas (V/F) vs Deseos, Dudas, Órdenes", body_style), Paragraph("5 aciertos", body_style)],
        [Paragraph("<b>Nivel 2</b>", body_style), Paragraph("Negación y Conjunción", body_style), Paragraph("&not; (Inversión), &and; (Verdadera solo si ambas son V)", body_style), Paragraph("5 aciertos", body_style)],
        [Paragraph("<b>Nivel 3</b>", body_style), Paragraph("Disyunción Inclusiva", body_style), Paragraph("&or; (Verdadera si al menos una componente es V)", body_style), Paragraph("5 aciertos", body_style)],
        [Paragraph("<b>Nivel 4</b>", body_style), Paragraph("Condicional Material", body_style), Paragraph("&rarr; (Falsa solo si antecedente V y consecuente F)", body_style), Paragraph("5 aciertos", body_style)],
        [Paragraph("<b>Nivel 5</b>", body_style), Paragraph("Bicondicional y Mixtos", body_style), Paragraph("&harr; (Verdadera cuando ambos valores coinciden)", body_style), Paragraph("5 aciertos", body_style)],
    ]
    t_niveles = Table(tabla_niveles_data, colWidths=[65, 125, 222, 100])
    t_niveles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EFE7D5")),
        ('BOX', (0,0), (-1,-1), 1, c_gold_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DDD0B8")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_niveles)

    story.append(Spacer(1, 4))
    story.append(Paragraph("7. Requisitos y Soporte Académico", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold_border, spaceAfter=4))
    story.append(Paragraph("• <b>Instalación:</b> Ejecutar el archivo <b>Logic Play.apk</b> disponible en la plataforma oficial del proyecto.", bullet_style))
    story.append(Paragraph("• <b>Modo Autónomo:</b> Funciona sin conexión a Internet (100% offline).", bullet_style))
    story.append(Paragraph("• <b>Cátedra:</b> Proyecto formativo de la Universidad Politécnica Territorial de Trujillo (UPTTMBI) - PNFI.", bullet_style))

    # Construir documento
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado: {PDF_FILENAME} ({os.path.getsize(PDF_FILENAME)} bytes)")

    import shutil
    shutil.copy2(PDF_FILENAME, PDF_ROOT_COPY)
    os.makedirs("web", exist_ok=True)
    shutil.copy2(PDF_FILENAME, os.path.join("web", "Manual_Usuario_LogicPlay.pdf"))
    print("PDF copiado a la raíz y a web/")

if __name__ == "__main__":
    build_pdf()
