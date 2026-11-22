// Picks patient-facing procedures from the crawled CGHS index and writes src/data/hospital.js.
// Usage: node scripts/collect/cghs-index.mjs && node scripts/collect/cghs-select.mjs
import { readFileSync, writeFileSync } from "node:fs";

const index = JSON.parse(readFileSync(new URL("../out/cghs-index.json", import.meta.url), "utf8"));
const byId = new Map(index.map((r) => [Number(r.slug.match(/-(\d+)$/)[1]), r]));

// [CGHS id, our slug, name, unit, short description]
const PICK = [
  [1483, "normal-delivery", "Normal delivery", "package", "Vaginal delivery including routine newborn care."],
  [1485, "c-section", "Caesarean section", "package", "C-section with or without sterilisation, including routine newborn care."],
  [1507, "abdominal-hysterectomy", "Hysterectomy (abdominal)", "package", "Open surgical removal of the uterus through the abdomen."],
  [1527, "laparoscopic-hysterectomy", "Laparoscopic hysterectomy", "package", "Keyhole removal of the uterus, usually with a shorter stay."],
  [1510, "myomectomy", "Myomectomy (fibroid removal)", "package", "Removal of uterine fibroids while keeping the uterus."],
  [1491, "ovarian-cystectomy", "Ovarian cystectomy (laparoscopic)", "package", "Keyhole removal of an ovarian cyst."],
  [1518, "dilatation-curettage", "D&C (dilatation and curettage)", "package", "Scraping of the uterine lining for diagnosis or treatment."],
  [1530, "hysteroscopy", "Diagnostic hysteroscopy", "package", "A camera examination of the uterus, with or without polyp removal."],
  [1524, "tubal-sterilisation", "Female sterilisation (laparoscopic)", "package", "Laparoscopic tubal occlusion as permanent contraception."],
  [1442, "laparoscopic-cholecystectomy", "Gallbladder removal (laparoscopic)", "package", "Keyhole removal of the gallbladder for gallstones."],
  [1393, "appendectomy-open", "Appendectomy (open)", "package", "Open removal of the appendix."],
  [1443, "laparoscopic-appendectomy", "Laparoscopic appendectomy", "package", "Keyhole removal of the appendix."],
  [1373, "inguinal-hernia-repair", "Inguinal hernia repair (open)", "package", "Open mesh repair of a groin hernia; the mesh is billed separately."],
  [1444, "laparoscopic-hernia-repair", "Laparoscopic hernia repair", "package", "Keyhole repair of an inguinal hernia, excluding mesh."],
  [1286, "piles-surgery", "Piles surgery (haemorrhoidectomy)", "package", "Surgical removal of haemorrhoids."],
  [1421, "anal-fissure-surgery", "Anal fissure surgery", "package", "Fissurectomy for a chronic anal fissure."],
  [1424, "anal-fistula-surgery", "Anal fistula surgery (low)", "package", "Fistulectomy for a low anal fistula."],
  [1303, "upper-gi-endoscopy", "Upper GI endoscopy (gastroscopy)", "per procedure", "A camera test of the food pipe, stomach and first part of the intestine."],
  [1304, "colonoscopy", "Colonoscopy", "per procedure", "A camera test of the large bowel."],
  [1327, "ercp", "ERCP", "per procedure", "Endoscopic procedure for bile duct and pancreas problems."],
  [1084, "tonsillectomy", "Tonsillectomy", "package", "Surgical removal of the tonsils."],
  [1100, "adenoidectomy", "Adenoidectomy", "package", "Surgical removal of the adenoids."],
  [1068, "septoplasty", "Septoplasty", "package", "Straightening a deviated nasal septum."],
  [1087, "sinus-surgery-fess", "Sinus surgery (FESS)", "package", "Functional endoscopic sinus surgery for polyps and chronic sinusitis."],
  [1062, "tympanoplasty", "Tympanoplasty (eardrum repair)", "package", "Repair of a perforated eardrum."],
  [1060, "grommet-insertion", "Ear grommet insertion", "package", "A small ventilation tube placed in the eardrum, usually for children with glue ear."],
  [1132, "total-thyroidectomy", "Total thyroidectomy", "package", "Surgical removal of the whole thyroid gland."],
  [1623, "turp-prostate-surgery", "TURP (prostate surgery)", "package", "Transurethral resection of the prostate for an enlarged prostate."],
  [1692, "pcnl-kidney-stone", "Kidney stone surgery (PCNL)", "package", "Percutaneous nephrolithotomy for large kidney stones (one side)."],
  [1727, "laser-stone-lithotripsy", "Laser stone lithotripsy (Holmium)", "package", "Laser breaking of urinary stones through a scope."],
  [1602, "dj-stenting", "DJ stenting", "package", "A temporary tube placed in the ureter to drain the kidney."],
  [1651, "hydrocele-surgery", "Hydrocele surgery (one side)", "package", "Surgical treatment of fluid collection around a testicle."],
  [1655, "varicocele-surgery", "Varicocele surgery (one side)", "package", "Microsurgical treatment of enlarged scrotal veins."],
  [1638, "circumcision", "Circumcision", "package", "Surgical removal of the foreskin."],
  [1686, "dialysis-session", "Haemodialysis session", "per session", "A single haemodialysis session for sero-negative patients."],
  [1918, "knee-replacement", "Knee replacement (one knee)", "package", "Total knee replacement, unilateral. Implant choice affects private bills."],
  [1916, "hip-replacement", "Hip replacement", "package", "Total hip replacement surgery."],
  [1908, "knee-arthroscopy", "Arthroscopy (diagnostic)", "package", "A camera examination of a joint, commonly the knee."],
  [1944, "spinal-discectomy", "Discectomy (slipped disc surgery)", "package", "Surgical removal of a herniated spinal disc."],
  [1947, "spinal-fusion", "Spinal fusion surgery", "package", "Joining of spine bones to stabilise the spine."],
  [1869, "fracture-open-reduction", "Fracture surgery (long bones)", "package", "Open reduction of a long-bone fracture of the arm or leg; implants are billed separately."],
  [1241, "cabg-bypass-surgery", "CABG (heart bypass surgery)", "package", "Coronary artery bypass graft surgery."],
  [1203, "angioplasty", "Angioplasty (PTCA, excl. stent)", "package", "Coronary angioplasty with closure device. The stent is billed separately."],
  [1201, "coronary-angiography", "Coronary angiography", "per procedure", "An X-ray dye test of the heart's arteries."],
  [1208, "pacemaker-single-chamber", "Pacemaker (single chamber)", "package", "Permanent pacemaker implantation, excluding the device."],
  [1209, "pacemaker-dual-chamber", "Pacemaker (dual chamber)", "package", "Permanent dual-chamber pacemaker implantation, excluding the device."],
  [1230, "varicose-vein-rfa", "Varicose vein radiofrequency ablation", "package", "Radiofrequency treatment of varicose veins, excluding the catheter."],
  [1186, "ecg", "ECG", "per test", "A resting electrocardiogram."],
  [1187, "tmt-stress-test", "Treadmill test (TMT)", "per test", "An exercise stress test for the heart."],
  [339, "echocardiography", "2D echocardiography", "per scan", "An ultrasound scan of the heart."],
  [989, "cataract-surgery", "Cataract surgery (one eye)", "per eye", "Phacoemulsification with foldable lens, excluding the cost of the lens itself."],
  [988, "sics-cataract-surgery", "Cataract surgery (SICS)", "per eye", "Small-incision cataract surgery, excluding the cost of the lens."],
  [952, "retinal-detachment-surgery", "Retinal detachment surgery", "per eye", "Surgery to re-attach the retina."],
  [957, "squint-surgery", "Squint correction (one eye)", "per eye", "Surgery to straighten misaligned eyes."],
  [1974, "cleft-lip-repair", "Cleft lip repair", "package", "Surgical repair of a cleft lip."],
  [2473, "mastectomy", "Mastectomy", "package", "Surgical removal of breast tissue."],
  [699, "chemotherapy-single-drug", "Chemotherapy (single drug)", "per session", "A single-drug chemotherapy day-care session."],
  [427, "mri-brain", "MRI brain (without contrast)", "per scan", "Plain MRI of the head/brain. Contrast scans cost extra."],
  [444, "mri-knee", "MRI knee (one joint)", "per scan", "Plain MRI of one knee."],
  [474, "mri-lumbar-spine", "MRI lumbar spine", "per scan", "Plain MRI of the lower back."],
  [462, "mri-abdomen", "MRI abdomen", "per scan", "Plain MRI of the abdomen."],
  [400, "ct-scan-head", "CT scan head (without contrast)", "per scan", "Plain CT scan of the brain."],
  [402, "ct-scan-chest", "CT scan chest", "per scan", "CT scan of the chest for the lungs."],
  [407, "ct-scan-abdomen", "CT scan whole abdomen", "per scan", "CT scan of the abdomen without contrast."],
  [358, "ultrasound-abdomen", "Ultrasound whole abdomen", "per scan", "USG of the abdomen and pelvis."],
  [372, "chest-xray", "Chest X-ray", "per film", "A single PA or AP chest X-ray film."],
  [398, "mammography", "Mammography", "per scan", "X-ray breast screening."],
  [483, "dexa-scan", "DEXA bone density scan", "per scan", "Bone density measurement at two sites."],
  [509, "pet-ct-scan", "PET-CT scan (whole body)", "per scan", "FDG whole-body PET-CT, mostly for cancer staging."],
  [365, "fibroscan", "Fibroscan (liver)", "per scan", "Non-invasive liver stiffness test."],
  [486, "pulmonary-function-test", "Pulmonary function test (PFT)", "per test", "Spirometry with diffusing capacity for lung function."],
  [15, "cbc-blood-test", "Complete blood count (CBC)", "per test", "Haemoglobin, blood counts and indices."],
  [128, "lipid-profile", "Lipid profile", "per test", "Cholesterol, triglycerides, LDL, HDL and VLDL."],
  [125, "hba1c-test", "HbA1c (diabetes) test", "per test", "Average blood sugar over about three months."],
  [58, "blood-sugar-test", "Blood sugar test", "per test", "Random, fasting or post-meal glucose."],
  [164, "tsh-test", "TSH test", "per test", "Thyroid stimulating hormone."],
  [163, "thyroid-profile", "Thyroid profile (T3, T4, TSH)", "per test", "Full thyroid function test."],
  [127, "liver-function-test", "Liver function test (LFT)", "per test", "Blood panel for liver health."],
  [61, "serum-creatinine-test", "Serum creatinine test", "per test", "Basic kidney function test."],
  [130, "vitamin-b12-test", "Vitamin B12 test", "per test", "Blood assay for vitamin B12 level."],
  [157, "vitamin-d-test", "Vitamin D test", "per test", "25-hydroxy vitamin D blood assay."],
  [4, "urine-routine-test", "Urine routine test", "per test", "Routine urine analysis."],
  [272, "dengue-ns1-test", "Dengue NS1 antigen test", "per test", "Early dengue detection test."],
  [271, "widal-test", "Widal test (typhoid)", "per test", "Blood test used for typhoid fever."],
  [45, "hepatitis-b-test", "Hepatitis B surface antigen test", "per test", "Screening test for hepatitis B infection."],
  [145, "psa-test", "PSA test (prostate)", "per test", "Prostate specific antigen blood test."],
  [55, "pap-smear", "Pap smear", "per test", "Cervical cancer screening test."],
];

const rows = PICK.map(([id, slug, name, unit, about]) => {
  const r = byId.get(id);
  if (!r || !r.price) throw new Error(`CGHS id ${id} missing or has no rate`);
  return { slug, name, unit, about: `${about} Government (CGHS) package ceiling.`, cghs: r.slug, rate: r.price };
});
if (new Set(rows.map((r) => r.slug)).size !== rows.length) throw new Error("duplicate slugs");
// CGHS dental schedule items that map onto dental procedures [CGHS id, our slug, label]
const DENTAL = [
  [776, "root-canal", "RCT, multi-rooted tooth"],
  [778, "re-root-canal", "Re-RCT, posterior tooth"],
  [774, "tooth-filling", "Composite filling (class II/III)"],
  [790, "dental-crown", "Metal crown with ceramic facing"],
  [755, "tooth-extraction", "Simple extraction"],
  [757, "wisdom-tooth-extraction", "Impacted soft-tissue third molar extraction"],
  [747, "teeth-cleaning", "Scaling"],
  [814, "complete-denture", "Complete denture, per arch"],
  [805, "dental-bridge", "Fixed bridge, per missing tooth"],
  [743, "opg-dental-xray", "Digital OPG"],
];
const dental = DENTAL.map(([id, procedure, label]) => {
  const r = byId.get(id);
  if (!r || !r.price) throw new Error(`CGHS dental id ${id} missing`);
  return { procedure, label, cghs: r.slug, rate: r.price };
});
writeFileSync(
  new URL("../../src/data/hospital.js", import.meta.url),
  `// Generated by scripts/collect/cghs-select.mjs from the CGHS rate list (Tier X, NABH rate in rupees). Do not edit by hand.\nexport const HOSPITAL = ${JSON.stringify(rows, null, 1)};\nexport const DENTAL_CGHS = ${JSON.stringify(dental, null, 1)};\n`
);
console.log("hospital procedures:", rows.length, "dental:", dental.length);
