const SYMPTOM_RULES: {
  keywords: string[];
  specialty: string;
  description: string;
  urgency: "low" | "medium" | "high";
}[] = [
  {
    keywords: ["chest pain", "heart", "palpitation", "shortness of breath", "irregular heartbeat", "blood pressure", "hypertension", "cholesterol"],
    specialty: "Cardiology",
    description: "Heart and cardiovascular system related symptoms",
    urgency: "high",
  },
  {
    keywords: ["skin", "rash", "acne", "eczema", "psoriasis", "itching", "hair loss", "nail", "allergic reaction", "hives"],
    specialty: "Dermatology",
    description: "Skin, hair and nail related symptoms",
    urgency: "low",
  },
  {
    keywords: ["brain", "headache", "migraine", "seizure", "numbness", "memory loss", "dizziness", "stroke", "nerve", "tremor", "paralysis"],
    specialty: "Neurology",
    description: "Brain, spine and nervous system related symptoms",
    urgency: "high",
  },
  {
    keywords: ["bone", "joint", "back pain", "arthritis", "fracture", "muscle pain", "spine", "knee pain", "shoulder pain", "sports injury"],
    specialty: "Orthopedics",
    description: "Bones, joints and muscles related symptoms",
    urgency: "medium",
  },
  {
    keywords: ["stomach", "abdomen", "nausea", "vomiting", "diarrhea", "constipation", "liver", "acidity", "ulcer", "indigestion", "bloating", "gas"],
    specialty: "Gastroenterology",
    description: "Digestive system and stomach related symptoms",
    urgency: "medium",
  },
  {
    keywords: ["cough", "cold", "fever", "flu", "pneumonia", "breathing", "asthma", "lung", "throat", "bronchitis", "sinus", "allergy"],
    specialty: "Pulmonology",
    description: "Lungs and respiratory system related symptoms",
    urgency: "medium",
  },
  {
    keywords: ["eye", "vision", "blurry", "cataract", "glaucoma", "dry eyes", "redness in eye", "eye pain", "spectacles"],
    specialty: "Ophthalmology",
    description: "Eyes and vision related symptoms",
    urgency: "medium",
  },
  {
    keywords: ["ear", "hearing", "nose", "throat", "tonsil", "snoring", "ear pain", "ear infection", "nasal", "voice"],
    specialty: "ENT",
    description: "Ear, nose and throat related symptoms",
    urgency: "low",
  },
  {
    keywords: ["diabetes", "thyroid", "hormone", "weight gain", "weight loss", "fatigue", "metabolism", "insulin", "obesity"],
    specialty: "Endocrinology",
    description: "Hormones and metabolic disorders",
    urgency: "medium",
  },
  {
    keywords: ["anxiety", "depression", "stress", "mental health", "insomnia", "sleep", "panic attack", "mood", "bipolar", "schizophrenia", "addiction"],
    specialty: "Psychiatry",
    description: "Mental health and psychological conditions",
    urgency: "medium",
  },
  {
    keywords: ["kidney", "urine", "urinary", "bladder", "uti", "prostate", "erectile", "sexual health", "infertility male"],
    specialty: "Urology",
    description: "Urinary system and male reproductive health",
    urgency: "medium",
  },
  {
    keywords: ["pregnancy", "periods", "menstrual", "ovary", "uterus", "pcos", "vaginal", "breast", "menopause", "infertility", "gynecology"],
    specialty: "Gynecology",
    description: "Female reproductive health and pregnancy",
    urgency: "medium",
  },
  {
    keywords: ["child", "baby", "infant", "toddler", "vaccination", "growth", "pediatric", "newborn", "kid"],
    specialty: "Pediatrics",
    description: "Children health and development",
    urgency: "medium",
  },
  {
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "biopsy", "oncology", "malignant", "lymphoma", "leukemia"],
    specialty: "Oncology",
    description: "Cancer and tumor related conditions",
    urgency: "high",
  },
  {
    keywords: ["tooth", "teeth", "gum", "dental", "cavity", "root canal", "braces", "jaw", "mouth pain"],
    specialty: "Dentistry",
    description: "Teeth and oral health",
    urgency: "low",
  },
];

export interface SymptomResult {
  specialty: string;
  description: string;
  urgency: "low" | "medium" | "high";
  matchedKeywords: string[];
  confidence: number; 
}

export const checkSymptoms = (symptoms: string): SymptomResult[] => {
  const input = symptoms.toLowerCase().trim();
  const results: SymptomResult[] = [];

  for (const rule of SYMPTOM_RULES) {
    const matched = rule.keywords.filter((kw) => input.includes(kw.toLowerCase()));

    if (matched.length > 0) {
      const confidence = Math.min(
        Math.round((matched.length / rule.keywords.length) * 100 * 3),
        99
      );
      results.push({
        specialty: rule.specialty,
        description: rule.description,
        urgency: rule.urgency,
        matchedKeywords: matched,
        confidence,
      });
    }
  }

  // sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
};