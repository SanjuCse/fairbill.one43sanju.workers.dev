import { HOSPITAL } from "./hospital.js";
import { CITIES, STATE_LIST, stateBySlug, citiesInState } from "./cities.js";

export const SITE = {
  name: "FairBill",
  tagline: "What should it really cost?",
  description:
    "Check dental, vet and hospital prices in Indian cities against published rate cards, government rates and prices paid by real people.",
  year: 2026,
};

export const CATEGORIES = [
  { slug: "dental", name: "Dental", blurb: "Root canals, crowns, implants and braces" },
  { slug: "hospital", name: "Hospital", blurb: "Delivery, surgery and scans at government reference rates" },
  { slug: "vet", name: "Vet", blurb: "Consultations, spay/neuter, vaccines and tests for pets" },
];

const dental = (slug, name, unit, about) => ({ slug, category: "dental", name, unit, about });
const vet = (slug, name, unit, about) => ({ slug, category: "vet", name, unit, about });

const DENTAL_PROCEDURES = [
  dental("root-canal", "Root canal treatment", "per tooth", "Removes infected pulp from a tooth to save it. Front teeth (single root) cost less than molars."),
  dental("re-root-canal", "Re-root canal treatment", "per tooth", "Repeats a root canal on a tooth that has become re-infected. It usually costs more than the first treatment."),
  dental("dental-crown", "Dental crown (cap)", "per tooth", "A cap placed over a damaged tooth. Price depends mainly on material: metal, porcelain-fused-to-metal, zirconia or all-ceramic."),
  dental("dental-bridge", "Dental bridge", "per missing tooth", "A fixed bridge replaces missing teeth using crowns on the neighbouring teeth. Material and the number of units set the price."),
  dental("dental-implant", "Dental implant", "per tooth", "A titanium post replacing a missing tooth root. Check whether the quote includes the crown on top."),
  dental("complete-denture", "Complete denture", "per arch", "Removable full set of teeth for one jaw. Acrylic dentures cost less than premium or implant-supported ones."),
  dental("metal-braces", "Metal braces", "full course", "Traditional metal-bracket orthodontic treatment for the full course."),
  dental("ceramic-braces", "Ceramic braces", "full course", "Tooth-coloured braces that are less visible than metal. They usually cost more than metal braces."),
  dental("clear-aligners", "Clear aligners", "full course", "Removable transparent aligner trays that straighten teeth without brackets. Price depends on case complexity and brand."),
  dental("tooth-filling", "Tooth filling", "per tooth", "Composite or GIC filling to repair a cavity. Price varies with the number of surfaces."),
  dental("tooth-extraction", "Tooth extraction (simple)", "per tooth", "Removal of a tooth that cannot be saved. Surgical or impacted wisdom-tooth extractions cost more."),
  dental("wisdom-tooth-extraction", "Wisdom tooth extraction (surgical)", "per tooth", "Surgical removal of an impacted third molar. Bony impaction costs more than soft-tissue impaction."),
  dental("teeth-cleaning", "Teeth cleaning (scaling)", "per visit", "Professional scaling and polishing to remove tartar. Deep cleaning for gum disease costs more."),
  dental("dental-veneers", "Dental veneers", "per tooth", "Thin shells bonded to the front of teeth. Composite veneers cost less than porcelain."),
  dental("opg-dental-xray", "Dental OPG X-ray", "per scan", "A panoramic X-ray of all teeth and jaws, often needed before braces, implants or wisdom-tooth surgery."),
];

const VET_PROCEDURES = [
  vet("vet-consultation", "Vet consultation", "per visit", "A routine clinic consultation for a dog or cat."),
  vet("vet-followup-visit", "Vet follow-up visit", "per visit", "A repeat visit within a short window after an earlier consultation. It usually costs less than a new visit."),
  vet("online-vet-consultation", "Online vet consultation", "per consult", "A chat, voice or video consultation with a vet, useful for minor concerns."),
  vet("dog-spay-neuter", "Dog spay / neuter", "per surgery", "Sterilisation surgery. Government clinics and NGOs are far cheaper than private hospitals."),
  vet("rabies-vaccine", "Rabies vaccine (dog)", "per dose", "A single rabies vaccine dose for a dog."),
  vet("nine-in-one-vaccine", "Dog 9-in-1 vaccine", "per dose", "A combination vaccine for dogs that includes distemper, parvovirus, hepatitis, parainfluenza and leptospirosis."),
  vet("kennel-cough-vaccine", "Kennel cough vaccine", "per dose", "A Bordetella vaccine, often needed for boarding and grooming."),
  vet("puppy-vaccination-series", "Puppy vaccination series", "full series", "The full set of puppy vaccines with boosters, usually excluding the consultation fee."),
  vet("cat-booster-vaccines", "Cat annual boosters", "per year", "Yearly booster vaccines for an adult cat, usually billed on top of a consultation."),
  vet("dog-deworming", "Dog deworming", "per dose", "Deworming tablets or syrup, given regularly to puppies and adult dogs."),
  vet("annual-wellness-checkup", "Annual wellness visit (dog)", "per visit", "An annual exam with boosters and deworming for an adult dog."),
  vet("vet-blood-test", "Vet blood tests", "per panel", "Routine blood work before surgery or for diagnosis."),
  vet("pet-urine-test", "Pet urine test", "per test", "A urine analysis for suspected infection or kidney issues."),
  vet("pet-xray", "Pet X-ray", "per view", "An X-ray of a dog or cat. Extra views and sedation raise the price."),
  vet("pet-dental-cleaning", "Pet dental cleaning", "per procedure", "Professional dental scaling under anaesthesia. Extractions are billed separately."),
  vet("parvo-treatment", "Parvovirus treatment", "per illness", "Hospitalisation and treatment of canine parvovirus, which is usually an emergency."),
  vet("cat-urinary-blockage", "Cat urinary blockage treatment", "per illness", "Emergency unblocking and hospital care for a blocked male cat."),
  vet("emergency-vet-visit", "Emergency vet visit", "per visit", "An emergency or after-hours visit with treatment, excluding major surgery."),
];

const HOSPITAL_PROCEDURES = HOSPITAL.map((h) => ({ slug: h.slug, category: "hospital", name: h.name, unit: h.unit, about: h.about }));

export const PROCEDURES = [...DENTAL_PROCEDURES, ...HOSPITAL_PROCEDURES, ...VET_PROCEDURES];

export const NATIONAL = { slug: "india", name: "India (all cities)" };

export { CITIES, STATE_LIST, stateBySlug, citiesInState };

// CGHS reimbursement multipliers relative to Tier X: Tier Y is 10% lower, Tier Z is 20% lower.
export const TIERS = {
  X: { slug: "tier-x", factor: 1, label: "Tier X (largest metros)" },
  Y: { slug: "tier-y", factor: 0.9, label: "Tier Y (large cities)" },
  Z: { slug: "tier-z", factor: 0.8, label: "Tier Z (other towns)" },
};
export const TIER_SLUGS = Object.values(TIERS).map((t) => t.slug);
export const tierSlugOf = (city) => TIERS[city.tier]?.slug;
export const procedureBySlug = (slug) => PROCEDURES.find((p) => p.slug === slug);
export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const cityBySlug = (slug) => (slug === NATIONAL.slug ? NATIONAL : CITIES.find((c) => c.slug === slug));
export const proceduresIn = (category) => PROCEDURES.filter((p) => p.category === category);
