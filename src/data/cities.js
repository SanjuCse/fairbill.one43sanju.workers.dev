// Cities and towns by state with their HRA/CGHS-style tier (X = largest metros, Y = large cities, Z = all other towns).
// Tiers follow the Government of India HRA classification of cities (X/Y/Z), used here as a proxy for CGHS city tiers.
// Format per state: [state, X names, Y names, Z names].
const STATES = [
  ["Andhra Pradesh", "", "Guntur,Kakinada,Kurnool,Nellore,Rajamahendravaram,Vijayawada,Visakhapatnam",
    "Amaravati,Anantapur,Bhimavaram,Chittoor,Eluru,Kadapa,Machilipatnam,Ongole,Srikakulam,Tadepalligudem,Tenali,Tirupati,Vizianagaram,Dharmavaram,Hindupur,Madanapalle,Proddatur,Nandyal,Adoni,Narasaraopet"],
  ["Arunachal Pradesh", "", "", "Itanagar,Naharlagun,Pasighat,Tawang,Ziro"],
  ["Assam", "", "Guwahati", "Dibrugarh,Jorhat,Nagaon,Silchar,Tezpur,Tinsukia,Bongaigaon,Dhubri,Goalpara,Diphu,Sivasagar"],
  ["Bihar", "", "Patna", "Arrah,Begusarai,Bettiah,Bhagalpur,Bihar Sharif,Buxar,Chapra,Darbhanga,Gaya,Hajipur,Katihar,Munger,Muzaffarpur,Purnia,Sasaram,Samastipur,Saharsa,Sitamarhi,Siwan,Motihari"],
  ["Chandigarh", "", "Chandigarh", ""],
  ["Chhattisgarh", "", "Bhilai,Bilaspur,Raipur", "Ambikapur,Bhatapara,Dhamtari,Durg,Jagdalpur,Korba,Raigarh,Rajnandgaon"],
  ["Delhi", "Delhi,New Delhi", "", ""],
  ["Goa", "", "", "Panaji,Margao,Mapusa,Vasco da Gama,Ponda"],
  ["Gujarat", "Ahmedabad", "Anand,Bhavnagar,Dahod,Jamnagar,Nadiad,Rajkot,Surat,Vadodara",
    "Ankleshwar,Bharuch,Bhuj,Botad,Gandhidham,Gandhinagar,Godhra,Junagadh,Mehsana,Morbi,Navsari,Palanpur,Patan,Porbandar,Surendranagar,Valsad,Vapi,Veraval,Amreli,Bhuj,Deesa,Himmatnagar,Kalol,Modasa,Unjha,Vyara"],
  ["Haryana", "", "Faridabad,Gurgaon,Karnal", "Ambala,Bahadurgarh,Bhiwani,Fatehabad,Hisar,Jhajjar,Jind,Kaithal,Kurukshetra,Mahendragarh,Palwal,Panchkula,Panipat,Rewari,Rohtak,Sirsa,Sonipat,Yamunanagar"],
  ["Himachal Pradesh", "", "Hamirpur,Shimla", "Baddi,Bilaspur HP,Chamba,Dharamshala,Kullu,Manali,Mandi,Nahan,Palampur,Solan,Una"],
  ["Jammu and Kashmir", "", "Jammu,Srinagar", "Anantnag,Baramulla,Kathua,Sopore,Udhampur,Rajouri,Poonch"],
  ["Jharkhand", "", "Bokaro,Dhanbad,Jamshedpur,Ranchi", "Deoghar,Giridih,Hazaribagh,Medininagar,Phusro,Ramgarh,Chaibasa,Dumka,Chirkunda"],
  ["Karnataka", "Bengaluru", "Bellary,Belagavi,Hubballi-Dharwad,Kalaburagi,Mangaluru,Mysuru,Raichur,Vijayapura",
    "Bagalkot,Bidar,Chikkamagaluru,Chitradurga,Davangere,Gadag,Hassan,Haveri,Hosapete,Karwar,Kolar,Mandya,Ramanagara,Shivamogga,Tumakuru,Udupi,Yadgir,Gangavathi,Koppal,Madikeri,Sirsi,Puttur"],
  ["Kerala", "", "Kannur,Kochi,Kollam,Kozhikode,Malappuram,Thiruvananthapuram,Thrissur", "Alappuzha,Attingal,Changanassery,Kasaragod,Kayamkulam,Kottayam,Manjeri,Muvattupuzha,Neyyattinkara,Palakkad,Pathanamthitta,Perinthalmanna,Thalassery,Thodupuzha,Tirur,Kattappana,Kunnamkulam,Chalakudy,Irinjalakuda,Ernakulam,Guruvayur"],
  ["Ladakh", "", "", "Leh,Kargil"],
  ["Madhya Pradesh", "", "Bhopal,Gwalior,Indore,Jabalpur,Ratlam,Ujjain", "Burhanpur,Chhindwara,Damoh,Dewas,Guna,Hoshangabad,Katni,Khandwa,Khargone,Mandsaur,Morena,Neemuch,Rewa,Sagar,Satna,Sehore,Shivpuri,Singrauli,Vidisha,Betul,Chhatarpur,Datia,Itarsi,Pithampur,Seoni,Shahdol,Sidhi,Tikamgarh"],
  ["Maharashtra", "Mumbai,Pune", "Akola,Amravati,Aurangabad,Bhiwandi,Dhule,Dombivli,Jalgaon,Kalyan-Dombivli,Kolhapur,Nagpur,Nanded,Nashik,Navi Mumbai,Pimpri-Chinchwad,Sangli,Solapur,Vasai-Virar",
    "Ahmednagar,Amalner,Badlapur,Baramati,Beed,Bhandara,Bhusawal,Chandrapur,Gondia,Hingoli,Ichalkaranji,Jalna,Kalyan,Karad,Latur,Lonavala,Malegaon,Mira-Bhayandar,Osmanabad,Panvel,Parbhani,Ratnagiri,Satara,Thane,Ulhasnagar,Wardha,Washim,Yavatmal,Ambernath,Alibag,Sangamner,Shirdi,Akluj,Pandharpur,Miraj"],
  ["Manipur", "", "", "Imphal,Thoubal,Bishnupur,Churachandpur"],
  ["Meghalaya", "", "", "Shillong,Tura,Jowai,Nongstoin"],
  ["Mizoram", "", "", "Aizawl,Lunglei,Champhai,Serchhip"],
  ["Nagaland", "", "", "Kohima,Dimapur,Mokokchung,Wokha"],
  ["Odisha", "", "Berhampur,Bhubaneswar,Cuttack,Rourkela", "Balasore,Baripada,Bhadrak,Bargarh,Jharsuguda,Jeypore,Kendujhar,Koraput,Puri,Sambalpur,Angul,Dhenkanal,Paradip,Rayagada,Talcher"],
  ["Puducherry", "", "Puducherry", "Karaikal,Mahe,Yanam"],
  ["Punjab", "", "Amritsar,Jalandhar,Ludhiana,Mohali", "Abohar,Barnala,Batala,Bathinda,Fazilka,Firozpur,Hoshiarpur,Kapurthala,Khanna,Malerkotla,Moga,Muktsar,Pathankot,Patiala,Phagwara,Rajpura,Sangrur,Zirakpur,Derabassi,Rupnagar,Nawanshahr,Gurdaspur,Fatehgarh Sahib,Mansa"],
  ["Rajasthan", "", "Ajmer,Bikaner,Jaipur,Jodhpur,Kota", "Alwar,Banswara,Baran,Barmer,Beawar,Bharatpur,Bhilwara,Bundi,Chittorgarh,Churu,Dausa,Dholpur,Hanumangarh,Jaisalmer,Jhalawar,Jhunjhunu,Karauli,Nagaur,Pali,Rajsamand,Sawai Madhopur,Sikar,Sri Ganganagar,Tonk,Udaipur,Sirohi,Mount Abu"],
  ["Sikkim", "", "", "Gangtok,Namchi,Gyalshing,Mangan"],
  ["Tamil Nadu", "Chennai", "Coimbatore,Erode,Kumbakonam,Madurai,Salem,Thanjavur,Tiruchirappalli,Tirunelveli,Tiruvannamalai,Vellore",
    "Ambur,Arakkonam,Chengalpattu,Cuddalore,Dharmapuri,Dindigul,Hosur,Kanchipuram,Karaikudi,Karur,Krishnagiri,Nagapattinam,Nagercoil,Namakkal,Neyveli,Pollachi,Pudukkottai,Rajapalayam,Ramanathapuram,Sivakasi,Thoothukudi,Tiruppur,Tiruvallur,Udhagamandalam,Virudhunagar,Villupuram,Mayiladuthurai,Perambalur,Ariyalur,Tenkasi,Theni,Valparai,Kovilpatti,Palani"],
  ["Telangana", "Hyderabad", "Karimnagar,Warangal", "Adilabad,Khammam,Mahabubnagar,Medak,Miryalaguda,Nalgonda,Nizamabad,Ramagundam,Sangareddy,Secunderabad,Siddipet,Suryapet,Vikarabad,Jagtial,Kothagudem,Mancherial,Bodhan,Kamareddy"],
  ["Tripura", "", "", "Agartala,Dharmanagar,Udaipur Tripura,Kailasahar,Belonia"],
  ["Uttar Pradesh", "", "Agra,Aligarh,Bareilly,Ghaziabad,Gorakhpur,Jhansi,Kanpur,Lucknow,Mathura,Meerut,Moradabad,Noida,Prayagraj,Saharanpur",
    "Ayodhya,Azamgarh,Bahraich,Ballia,Banda,Barabanki,Basti,Bijnor,Budaun,Bulandshahr,Deoria,Etawah,Faizabad,Farrukhabad,Fatehpur,Firozabad,Ghazipur,Gonda,Greater Noida,Hapur,Hardoi,Jaunpur,Lakhimpur,Lalitpur,Mainpuri,Mau,Mirzapur,Muzaffarnagar,Orai,Pilibhit,Raebareli,Rampur,Shahjahanpur,Sitapur,Sultanpur,Unnao,Varanasi,Vrindavan,Amroha,Sambhal,Kasganj,Etah,Hathras,Chandausi"],
  ["Uttarakhand", "", "Dehradun", "Almora,Haldwani,Haridwar,Kashipur,Kotdwar,Mussoorie,Nainital,Pithoragarh,Rishikesh,Roorkee,Rudrapur,Tehri,Srinagar Uttarakhand"],
  ["West Bengal", "Kolkata", "Asansol,Bardhaman,Durgapur,Purulia,Siliguri", "Alipurduar,Balurghat,Bankura,Baharampur,Basirhat,Bongaon,Chinsurah,Cooch Behar,Darjeeling,Dum Dum,Habra,Haldia,Howrah,Jalpaiguri,Jangipur,Kalyani,Kharagpur,Krishnanagar,Malda,Midnapore,Raiganj,Ranaghat,Santipur,Serampore,Tamluk,Barasat,Berhampore,Contai,Raniganj,Bishnupur"],
  ["Andaman and Nicobar Islands", "", "", "Port Blair"],
  ["Dadra and Nagar Haveli and Daman and Diu", "", "", "Silvassa,Daman,Diu"],
  ["Lakshadweep", "", "", "Kavaratti"],
];

const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

const seen = new Set();
export const CITIES = [];
for (const [state, x, y, z] of STATES) {
  for (const [tier, list] of [["X", x], ["Y", y], ["Z", z]]) {
    for (const name of list.split(",").filter(Boolean)) {
      const slug = slugify(name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      CITIES.push({ slug, name, state, tier });
    }
  }
}
CITIES.sort((a, b) => a.name.localeCompare(b.name));

export const STATE_LIST = [...new Set(STATES.map((s) => s[0]))].map((name) => ({ name, slug: slugify(name) })).sort((a, b) => a.name.localeCompare(b.name));
export const stateBySlug = (slug) => STATE_LIST.find((s) => s.slug === slug);
export const citiesInState = (stateName) => CITIES.filter((c) => c.state === stateName);
