// Common diseases list for Pakistan medical context
export const COMMON_DISEASES = [
  // Respiratory
  "Asthma",
  "Chronic Obstructive Pulmonary Disease (COPD)",
  "Bronchitis",
  "Pneumonia",
  "Tuberculosis (TB)",
  "Sinusitis",

  // Cardiovascular
  "Hypertension (High Blood Pressure)",
  "Coronary Artery Disease",
  "Heart Failure",
  "Arrhythmia",
  "Angina",

  // Endocrine/Metabolic
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Thyroid Disorder",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Obesity",
  "Metabolic Syndrome",

  // Gastrointestinal
  "Gastroesophageal Reflux Disease (GERD)",
  "Peptic Ulcer",
  "Irritable Bowel Syndrome (IBS)",
  "Inflammatory Bowel Disease (IBD)",
  "Hepatitis B",
  "Hepatitis C",
  "Cirrhosis",
  "Fatty Liver Disease",

  // Musculoskeletal
  "Arthritis",
  "Osteoarthritis",
  "Rheumatoid Arthritis",
  "Osteoporosis",
  "Back Pain (Chronic)",
  "Gout",

  // Neurological
  "Migraine",
  "Epilepsy",
  "Stroke",
  "Parkinson's Disease",
  "Alzheimer's Disease",
  "Neuropathy",

  // Mental Health
  "Depression",
  "Anxiety Disorder",
  "Bipolar Disorder",
  "Obsessive-Compulsive Disorder (OCD)",
  "Post-Traumatic Stress Disorder (PTSD)",

  // Kidney/Urinary
  "Chronic Kidney Disease",
  "Kidney Stones",
  "Urinary Tract Infection (Chronic)",

  // Hematological
  "Anemia",
  "Iron Deficiency Anemia",
  "Thalassemia",
  "Sickle Cell Disease",

  // Allergic/Immunological
  "Allergic Rhinitis",
  "Food Allergies",
  "Eczema",
  "Psoriasis",
  "Lupus",

  // Cancer
  "Breast Cancer",
  "Lung Cancer",
  "Colorectal Cancer",
  "Prostate Cancer",
  "Leukemia",
  "Lymphoma",

  // Infectious
  "HIV/AIDS",
  "Hepatitis",
  "Dengue Fever (Chronic)",
  "Malaria (Chronic)",

  // Other
  "Sleep Apnea",
  "Celiac Disease",
  "Chronic Fatigue Syndrome",
  "Fibromyalgia",
].sort();

export function searchDiseases(query: string): string[] {
  if (!query || query.trim().length < 2) return [];

  const searchTerm = query.toLowerCase().trim();

  // Filter diseases that match the search term
  const matches = COMMON_DISEASES.filter((disease) =>
    disease.toLowerCase().includes(searchTerm)
  );

  // If exact match exists, return matches
  if (matches.length > 0) {
    return matches;
  }

  // If no matches, return the user's input as an option
  return [query.trim()];
}
