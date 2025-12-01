# Triage Rules & Action Mapping

## Red Flag Rules (Emergency)
**Action**: Show Emergency Modal + 108/Ambulance Links. **Stop Chat**.

1. **Keywords**: "chest pain", "difficulty breathing", "severe bleeding", "unconscious", "stroke symptoms", "heart attack".
2. **Context**: Sudden onset of severe pain, loss of vision, slurred speech.
3. **Vitals (if provided)**: High fever (>104F), very low/high BP (if mentioned).

## Referral Triggers (Doctor Consultation)
**Action**: Suggest "Book Consultation" + Show 3 nearest doctors.

1. **Chronic Patterns**:
   - Symptoms persisting > 4 weeks.
   - Mention of "diabetes", "hypertension", "thyroid" management without recent checkup.
2. **Recurring Meds**: Request for Schedule H/H1 drugs without valid Rx.
3. **Uncertainty**: Low confidence score from RAG (< 0.7).

## Pharmacist Review Triggers (Prescription)
**Action**: Block auto-fulfillment -> "Pending Pharmacist Review".

1. **Drug Class**: Antibiotics, Sedatives, Schedule X drugs.
2. **Image Quality**: Low OCR confidence.
3. **Mismatch**: Uploaded Rx name != User Name (unless "for family" specified).

## General Advice (Self-Care)
**Action**: Provide info from RAG + "Buy OTC" link if applicable.

1. **Conditions**: Mild cold, cough, minor cuts, vitamins, skincare.
2. **Disclaimer**: ALWAYS append "This is not medical advice. Consult a doctor if symptoms persist."
