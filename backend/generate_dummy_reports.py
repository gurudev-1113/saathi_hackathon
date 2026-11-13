import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_metabolic_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f766e'),
        fontName='Helvetica-Bold',
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
    )
    patient_header = ParagraphStyle(
        'PatientHdr',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
    )
    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a'),
    )
    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1e293b'),
    )
    td_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a'),
    )

    story = []

    # Header
    story.append(Paragraph("METROPOLIS HEALTH DIAGNOSTICS & PATHOLOGY LABS", title_style))
    story.append(Paragraph("Accredited Clinical Reference Laboratory • NABL & CAP Certified", subtitle_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0d9488'), spaceBefore=2, spaceAfter=12))

    # Patient Meta Information Table
    patient_data = [
        [
            Paragraph("<b>Patient Name:</b> Jane Doe", patient_header),
            Paragraph("<b>Patient ID:</b> PT-8829104", patient_header),
            Paragraph("<b>Collection Date:</b> 2026-11-10", patient_header),
        ],
        [
            Paragraph("<b>Age / Gender:</b> 34 Y / Female", patient_header),
            Paragraph("<b>Referred By:</b> Dr. S. Sharma, MD", patient_header),
            Paragraph("<b>Report Date:</b> 2026-11-11", patient_header),
        ],
        [
            Paragraph("<b>Sample Type:</b> Blood (Serum / Fluoride Plasma)", patient_header),
            Paragraph("<b>Fasting Status:</b> 12 Hours Fasting", patient_header),
            Paragraph("<b>Status:</b> Final Verified", patient_header),
        ],
    ]
    p_table = Table(patient_data, colWidths=[200, 180, 150])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("<b>COMPREHENSIVE METABOLIC & LIPID PROFILE</b>", ParagraphStyle('SecHdr', parent=styles['Heading2'], fontSize=12, leading=15, textColor=colors.HexColor('#0f766e'))))
    story.append(Spacer(1, 8))

    # Lab Biomarkers Table
    table_data = [
        [
            Paragraph("Test Investigation", th_style),
            Paragraph("Observed Value", th_style),
            Paragraph("Unit", th_style),
            Paragraph("Biological Reference Interval", th_style),
            Paragraph("Clinical Status", th_style),
        ],
        [Paragraph("Fasting Blood Glucose", td_bold), Paragraph("108", td_bold), Paragraph("mg/dL", td_style), Paragraph("70.0 - 99.0", td_style), Paragraph("Borderline High", td_bold)],
        [Paragraph("HbA1c Glycated Hemoglobin", td_style), Paragraph("5.4", td_style), Paragraph("%", td_style), Paragraph("4.0 - 5.6", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Estimated Average Glucose", td_style), Paragraph("108", td_style), Paragraph("mg/dL", td_style), Paragraph("70 - 114", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Total Cholesterol", td_bold), Paragraph("218", td_bold), Paragraph("mg/dL", td_style), Paragraph("125.0 - 200.0", td_style), Paragraph("High", td_bold)],
        [Paragraph("HDL Cholesterol", td_style), Paragraph("52", td_style), Paragraph("mg/dL", td_style), Paragraph("40.0 - 90.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("LDL Cholesterol", td_bold), Paragraph("138", td_bold), Paragraph("mg/dL", td_style), Paragraph("50.0 - 100.0", td_style), Paragraph("High", td_bold)],
        [Paragraph("Triglycerides", td_style), Paragraph("140", td_style), Paragraph("mg/dL", td_style), Paragraph("35.0 - 150.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("VLDL Cholesterol", td_style), Paragraph("28", td_style), Paragraph("mg/dL", td_style), Paragraph("10.0 - 30.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Serum Creatinine", td_style), Paragraph("0.95", td_style), Paragraph("mg/dL", td_style), Paragraph("0.70 - 1.30", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Blood Urea Nitrogen", td_style), Paragraph("14.0", td_style), Paragraph("mg/dL", td_style), Paragraph("7.0 - 20.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("ALT Alanine Aminotransferase", td_style), Paragraph("26", td_style), Paragraph("U/L", td_style), Paragraph("7.0 - 56.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("AST Aspartate Aminotransferase", td_style), Paragraph("22", td_style), Paragraph("U/L", td_style), Paragraph("8.0 - 48.0", td_style), Paragraph("Normal", td_style)],
    ]

    t = Table(table_data, colWidths=[180, 85, 60, 125, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#fef3c7')), # Glucose row
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#fef3c7')), # Chol row
        ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#fef3c7')), # LDL row
    ]))
    story.append(t)
    story.append(Spacer(1, 18))

    # Notes & Disclaimer Footer
    story.append(Paragraph("<b>CLINICAL INTERPRETATION & ADVISORY NOTES:</b>", ParagraphStyle('NoteHdr', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=colors.HexColor('#334155'))))
    notes = (
        "1. Fasting blood glucose is mildly elevated (108 mg/dL; prediabetes range 100-125 mg/dL). However, HbA1c remains within target limits (5.4%).<br/>"
        "2. Total Cholesterol and LDL Cholesterol are slightly above optimal cardioprotective thresholds. Dietary lifestyle consultation advised.<br/>"
        "3. Renal function markers (Creatinine, BUN) and Hepatic transaminases (ALT, AST) are within physiological reference intervals.<br/>"
        "4. <b>Educational Disclaimer:</b> This test report must be interpreted by a registered medical practitioner in conjunction with clinical history."
    )
    story.append(Paragraph(notes, ParagraphStyle('Notes', parent=styles['Normal'], fontSize=8, leading=12, textColor=colors.HexColor('#475569'))))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("Verified by: Dr. R. K. Varma, Consultant Clinical Biochemist • Metropolis Diagnostics", ParagraphStyle('Sign', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#64748b'))))

    doc.build(story)
    print(f"[SUCCESS] Created {output_path}")

def generate_cbc_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f766e'),
        fontName='Helvetica-Bold',
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
    )
    patient_header = ParagraphStyle(
        'PatientHdr',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
    )
    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a'),
    )
    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1e293b'),
    )
    td_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a'),
    )

    story = []

    # Header
    story.append(Paragraph("APEX HEALTH DIAGNOSTICS & HEMATOLOGY", title_style))
    story.append(Paragraph("Specialized Automated Hematology Testing • ISO 15189 Certified", subtitle_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0d9488'), spaceBefore=2, spaceAfter=12))

    patient_data = [
        [
            Paragraph("<b>Patient Name:</b> John Smith", patient_header),
            Paragraph("<b>Patient ID:</b> PT-4410982", patient_header),
            Paragraph("<b>Collection Date:</b> 2026-11-12", patient_header),
        ],
        [
            Paragraph("<b>Age / Gender:</b> 42 Y / Male", patient_header),
            Paragraph("<b>Referred By:</b> Dr. M. Patel, MD", patient_header),
            Paragraph("<b>Report Date:</b> 2026-11-12", patient_header),
        ],
        [
            Paragraph("<b>Sample Type:</b> Whole Blood (EDTA)", patient_header),
            Paragraph("<b>Method:</b> 5-Part Cell Counter Analyzer", patient_header),
            Paragraph("<b>Status:</b> Verified Final", patient_header),
        ],
    ]
    p_table = Table(patient_data, colWidths=[200, 180, 150])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("<b>COMPLETE BLOOD COUNT (CBC) & HEMOGRAM</b>", ParagraphStyle('SecHdr', parent=styles['Heading2'], fontSize=12, leading=15, textColor=colors.HexColor('#0f766e'))))
    story.append(Spacer(1, 8))

    table_data = [
        [
            Paragraph("Hematology Parameter", th_style),
            Paragraph("Observed Value", th_style),
            Paragraph("Unit", th_style),
            Paragraph("Biological Reference Interval", th_style),
            Paragraph("Clinical Status", th_style),
        ],
        [Paragraph("Hemoglobin", td_bold), Paragraph("11.2", td_bold), Paragraph("g/dL", td_style), Paragraph("13.0 - 17.0", td_style), Paragraph("Mildly Low", td_bold)],
        [Paragraph("Total Leukocyte Count (WBC)", td_style), Paragraph("6800", td_style), Paragraph("cells/uL", td_style), Paragraph("4000 - 11000", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Platelet Count", td_style), Paragraph("245000", td_style), Paragraph("cells/uL", td_style), Paragraph("150000 - 450000", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Hematocrit PCV", td_bold), Paragraph("34.8", td_bold), Paragraph("%", td_style), Paragraph("40.0 - 50.0", td_style), Paragraph("Low", td_bold)],
        [Paragraph("Red Blood Cell Count (RBC)", td_style), Paragraph("4.1", td_style), Paragraph("mil/uL", td_style), Paragraph("4.5 - 5.9", td_style), Paragraph("Mildly Low", td_style)],
        [Paragraph("MCV Mean Corpuscular Volume", td_style), Paragraph("82.0", td_style), Paragraph("fL", td_style), Paragraph("80.0 - 100.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("MCH Mean Corpuscular Hb", td_style), Paragraph("27.5", td_style), Paragraph("pg", td_style), Paragraph("27.0 - 33.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Neutrophils", td_style), Paragraph("58", td_style), Paragraph("%", td_style), Paragraph("40.0 - 70.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Lymphocytes", td_style), Paragraph("32", td_style), Paragraph("%", td_style), Paragraph("20.0 - 40.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Monocytes", td_style), Paragraph("6", td_style), Paragraph("%", td_style), Paragraph("2.0 - 8.0", td_style), Paragraph("Normal", td_style)],
        [Paragraph("Eosinophils", td_style), Paragraph("3", td_style), Paragraph("%", td_style), Paragraph("1.0 - 6.0", td_style), Paragraph("Normal", td_style)],
    ]

    t = Table(table_data, colWidths=[180, 85, 60, 125, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#fee2e2')), # Low Hb row
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#fee2e2')), # Low PCV row
    ]))
    story.append(t)
    story.append(Spacer(1, 18))

    story.append(Paragraph("<b>HEMATOLOGIST SUMMARY & COMMENTS:</b>", ParagraphStyle('NoteHdr', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=colors.HexColor('#334155'))))
    notes = (
        "1. Normocytic normochromic mild anemia suggested by slight reduction in Hemoglobin (11.2 g/dL) and Hematocrit (34.8%).<br/>"
        "2. Normal leukocyte and platelet series. No evidence of blast cells or abnormal morphologic features.<br/>"
        "3. Advise serum Ferritin and Iron studies to evaluate underlying nutritional iron store status.<br/>"
        "4. <b>Educational Disclaimer:</b> For clinical correlation only. Please discuss these laboratory findings with your attending physician."
    )
    story.append(Paragraph(notes, ParagraphStyle('Notes', parent=styles['Normal'], fontSize=8, leading=12, textColor=colors.HexColor('#475569'))))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("Verified by: Dr. Anita Deshmukh, MD Pathology • Apex Diagnostics", ParagraphStyle('Sign', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#64748b'))))

    doc.build(story)
    print(f"[SUCCESS] Created {output_path}")

if __name__ == "__main__":
    generate_metabolic_pdf("Sample_Comprehensive_Metabolic_Panel.pdf")
    generate_cbc_pdf("Sample_Complete_Blood_Count.pdf")
