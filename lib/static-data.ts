import type { Achievement, CharacterClass, Difficulty, Grade, Item, Monster, Pet, Question, Quest, Subject } from './types';

const now = () => new Date().toISOString();
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const grades: Grade[] = [7, 8, 9];

function rewardFor(index: number, difficulty: Difficulty) {
  const base = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 35 : 55;
  return { xp: base + (index % 5) * 2, gold: Math.round(base / 2) + (index % 4) * 3 };
}

function optionSet(correct: string, wrong: string[]) {
  const options = [correct, ...wrong.slice(0, 3)];
  return options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`);
}

export const AVATARS = ['🧑‍🚀', '🧙‍♀️', '🧝‍♂️', '🦸‍♀️', '🧑‍🔬', '🧕', '🧑‍💻', '🥷'];
export const TITLES = [
  'Pemula Berani', 'Pemburu Soal', 'Ahli Aljabar', 'Penjaga Ekosistem', 'Ksatria Literasi', 'Navigator Nusantara',
  'Sang Cepat Tanggap', 'Penghafal Hebat', 'Penulis Muda', 'Master Grammar', 'Dragon Slayer', 'Sage Apprentice',
  'Champion Mingguan', 'Scholar Emas', 'Pahlawan Guild', 'Raja Combo', 'Legenda SMP', 'Arsitek Strategi',
  'Explorer Ilmu', 'Guardian EduQuest'
];

export const CLASS_INFO: Record<CharacterClass, { label: string; icon: string; bonus: string; subject: Subject }> = {
  warrior: { label: 'Matematika Warrior', icon: '🗡️', bonus: '+15% damage saat soal Matematika', subject: 'Matematika' },
  mage: { label: 'Science Mage', icon: '🔮', bonus: '+25 HP saat soal IPA', subject: 'IPA' },
  ranger: { label: 'Language Ranger', icon: '🏹', bonus: '+15% XP saat soal bahasa', subject: 'Bahasa Indonesia' },
  knight: { label: 'Social Knight', icon: '🛡️', bonus: '+20% gold saat soal IPS', subject: 'IPS' }
};

export const SUBJECT_TOPICS: Record<Subject, string[]> = {
  Matematika: ['Aljabar', 'Geometri', 'Statistika', 'Bilangan', 'Perbandingan'],
  IPA: ['Gerak', 'Energi', 'Sel', 'Ekosistem', 'Atom', 'Reaksi'],
  'Bahasa Indonesia': ['Tata Bahasa', 'Sastra', 'Menulis', 'Paragraf', 'Teks Persuasi'],
  'Bahasa Inggris': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Tenses', 'Expression'],
  IPS: ['Sejarah Indonesia', 'Geografi', 'Ekonomi', 'Sosiologi', 'Kerajaan Nusantara']
};

function mathQuestion(index: number): Question {
  const grade = grades[index % 3];
  const difficulty = difficulties[index % 3];
  const topic = SUBJECT_TOPICS.Matematika[index % SUBJECT_TOPICS.Matematika.length];
  const a = 2 + (index % 9);
  const b = 3 + ((index * 2) % 13);
  const correctValue = a * b + index;
  const templates = [
    {
      question: `Jika x = ${a} dan y = ${b}, nilai dari ${a}y + x + ${index} adalah ...`,
      correct: String(a * b + a + index),
      wrong: [String(a + b + index), String(a * b - a + index), String(a * b + index + 4)],
      explanation: `Substitusi y = ${b} dan x = ${a}. Hasilnya ${a} × ${b} + ${a} + ${index}.`
    },
    {
      question: `Sebuah kelas memiliki ${20 + index} siswa. ${a} dari setiap ${b} siswa menyukai sains. Perkiraan siswa yang menyukai sains adalah ...`,
      correct: String(Math.round(((20 + index) * a) / b)),
      wrong: [String(a + b), String(Math.round((20 + index) / a)), String(Math.round((20 + index) * b / a))],
      explanation: `Gunakan perbandingan: jumlah siswa × ${a}/${b}, lalu bulatkan ke siswa terdekat.`
    },
    {
      question: `Luas persegi panjang dengan panjang ${a + 5} cm dan lebar ${b} cm adalah ... cm²`,
      correct: String((a + 5) * b),
      wrong: [String((a + 5) + b), String(2 * ((a + 5) + b)), String((a + 4) * b)],
      explanation: `Rumus luas persegi panjang adalah panjang × lebar = ${a + 5} × ${b}.`
    },
    {
      question: `Rata-rata dari data ${a}, ${b}, ${correctValue}, dan ${index + 6} adalah ...`,
      correct: ((a + b + correctValue + index + 6) / 4).toFixed(1),
      wrong: [String(a + b), String(correctValue), ((a + b + correctValue) / 3).toFixed(1)],
      explanation: 'Jumlahkan seluruh data lalu bagi dengan banyak data, yaitu 4.'
    },
    {
      question: `Hasil dari ${correctValue} - ${a} × ${b} adalah ...`,
      correct: String(index),
      wrong: [String(index + a), String(correctValue - a), String(a * b)],
      explanation: `Kerjakan perkalian dulu: ${a} × ${b} = ${a * b}, lalu ${correctValue} - ${a * b} = ${index}.`
    }
  ];
  const template = templates[index % templates.length];
  return {
    id: `math-${index + 1}`,
    subject: 'Matematika',
    topic,
    difficulty,
    grade,
    question: template.question,
    options: optionSet(template.correct, template.wrong),
    correctAnswer: 0,
    explanation: template.explanation,
    hints: ['Tulis informasi yang diketahui terlebih dahulu.', 'Gunakan rumus dasar sesuai topik dan cek satuan/jumlah data.'],
    rewards: rewardFor(index, difficulty),
    generatedBy: 'static',
    createdAt: now(),
    type: 'multiple_choice'
  };
}

const ipaFacts = [
  ['Energi kinetik', 'energi yang dimiliki benda karena bergerak', ['energi karena ketinggian', 'energi dalam makanan', 'energi karena suhu']],
  ['Fotosintesis', 'proses tumbuhan membuat makanan dengan bantuan cahaya', ['proses hewan bernapas', 'penguapan air laut', 'perpindahan kalor']],
  ['Atom', 'partikel penyusun materi yang sangat kecil', ['alat ukur massa', 'jenis gaya gesek', 'bagian sistem pencernaan']],
  ['Ekosistem', 'hubungan timbal balik makhluk hidup dan lingkungannya', ['kumpulan planet', 'perubahan wujud benda', 'rangkaian listrik tertutup']],
  ['Gaya', 'tarikan atau dorongan yang dapat mengubah gerak benda', ['jumlah zat', 'satuan cahaya', 'jenis larutan']]
];
function ipaQuestion(index: number): Question {
  const fact = ipaFacts[index % ipaFacts.length];
  const grade = grades[index % 3];
  const difficulty = difficulties[(index + 1) % 3];
  const topic = SUBJECT_TOPICS.IPA[index % SUBJECT_TOPICS.IPA.length];
  return {
    id: `ipa-${index + 1}`,
    subject: 'IPA',
    topic,
    difficulty,
    grade,
    question: `Dalam IPA kelas ${grade}, istilah ${fact[0]} paling tepat diartikan sebagai ...`,
    options: optionSet(fact[1] as string, fact[2] as string[]),
    correctAnswer: 0,
    explanation: `${fact[0]} adalah ${(fact[1] as string)}. Konsep ini sering muncul pada topik ${topic}.`,
    hints: ['Ingat kata kunci pada istilah ilmiah tersebut.', 'Eliminasi pilihan yang berasal dari topik IPA berbeda.'],
    rewards: rewardFor(index, difficulty),
    generatedBy: 'static',
    createdAt: now(),
    type: 'multiple_choice'
  };
}

const bahasaFacts = [
  ['Kalimat efektif', 'kalimat yang singkat, jelas, dan tidak bertele-tele', ['kalimat dengan majas berlebihan', 'kalimat tanpa subjek', 'kalimat yang selalu panjang']],
  ['Gagasan utama', 'ide pokok yang menjadi inti paragraf', ['daftar pustaka', 'judul buku', 'catatan kaki']],
  ['Majas metafora', 'perbandingan langsung tanpa kata seperti', ['pengulangan bunyi akhir', 'pertentangan makna', 'urutan peristiwa']],
  ['Teks persuasi', 'teks yang bertujuan mengajak atau memengaruhi pembaca', ['teks berisi percobaan ilmiah', 'teks daftar belanja', 'teks petunjuk arah saja']],
  ['Konjungsi', 'kata penghubung antarkata, frasa, klausa, atau kalimat', ['kata benda tempat', 'kata seru emosi', 'kata sandang saja']]
];
function bahasaQuestion(index: number): Question {
  const fact = bahasaFacts[index % bahasaFacts.length];
  const grade = grades[(index + 1) % 3];
  const difficulty = difficulties[index % 3];
  const topic = SUBJECT_TOPICS['Bahasa Indonesia'][index % SUBJECT_TOPICS['Bahasa Indonesia'].length];
  return {
    id: `bin-${index + 1}`,
    subject: 'Bahasa Indonesia',
    topic,
    difficulty,
    grade,
    question: `Pada materi ${topic}, ${fact[0]} berarti ...`,
    options: optionSet(fact[1] as string, fact[2] as string[]),
    correctAnswer: 0,
    explanation: `${fact[0]} berkaitan dengan ${(fact[1] as string)} sehingga membantu memahami teks secara tepat.`,
    hints: ['Cari kata kunci fungsi istilah tersebut.', 'Pilih jawaban yang paling sesuai dengan konteks penggunaan bahasa.'],
    rewards: rewardFor(index, difficulty),
    generatedBy: 'static',
    createdAt: now(),
    type: 'multiple_choice'
  };
}

const englishFacts = [
  ['simple present tense', 'I study every day.', ['I studying every day.', 'I studied tomorrow.', 'I am study yesterday.']],
  ['past tense of go', 'went', ['goed', 'goes', 'going']],
  ['synonym of happy', 'glad', ['angry', 'tired', 'empty']],
  ['asking for help politely', 'Could you help me, please?', ['Help me now!', 'You must help!', 'Why no help?']],
  ['reading main idea', 'the central message of a text', ['the page number', 'one random word', 'the author address']]
];
function englishQuestion(index: number): Question {
  const fact = englishFacts[index % englishFacts.length];
  const grade = grades[index % 3];
  const difficulty = difficulties[(index + 2) % 3];
  const topic = SUBJECT_TOPICS['Bahasa Inggris'][index % SUBJECT_TOPICS['Bahasa Inggris'].length];
  return {
    id: `eng-${index + 1}`,
    subject: 'Bahasa Inggris',
    topic,
    difficulty,
    grade,
    question: `Choose the best answer for ${fact[0]}:`,
    options: optionSet(fact[1] as string, fact[2] as string[]),
    correctAnswer: 0,
    explanation: `The best answer is "${fact[1]}" because it matches the grammar or meaning required by ${topic}.`,
    hints: ['Read the instruction carefully and identify the grammar clue.', 'Eliminate answers with tense, spelling, or politeness problems.'],
    rewards: rewardFor(index, difficulty),
    generatedBy: 'static',
    createdAt: now(),
    type: 'multiple_choice'
  };
}

const ipsFacts = [
  ['Proklamasi Kemerdekaan Indonesia', '17 Agustus 1945', ['20 Mei 1908', '28 Oktober 1928', '1 Juni 1945']],
  ['Kegiatan produksi', 'kegiatan menghasilkan barang atau jasa', ['kegiatan memakai barang', 'kegiatan menyalurkan barang', 'kegiatan menabung saja']],
  ['Peta', 'gambaran permukaan bumi pada bidang datar dengan skala', ['daftar harga', 'jadwal pelajaran', 'catatan harian']],
  ['Interaksi sosial', 'hubungan timbal balik antarindividu atau kelompok', ['proses batuan membeku', 'perubahan musim', 'penguapan air']],
  ['Kerajaan Sriwijaya', 'kerajaan maritim besar di Sumatra', ['kerajaan agraris di Eropa', 'perusahaan dagang modern', 'nama gunung api']]
];
function ipsQuestion(index: number): Question {
  const fact = ipsFacts[index % ipsFacts.length];
  const grade = grades[(index + 2) % 3];
  const difficulty = difficulties[index % 3];
  const topic = SUBJECT_TOPICS.IPS[index % SUBJECT_TOPICS.IPS.length];
  return {
    id: `ips-${index + 1}`,
    subject: 'IPS',
    topic,
    difficulty,
    grade,
    question: `Pada topik ${topic}, jawaban yang tepat untuk ${fact[0]} adalah ...`,
    options: optionSet(fact[1] as string, fact[2] as string[]),
    correctAnswer: 0,
    explanation: `${fact[0]} berhubungan dengan ${(fact[1] as string)} dalam kajian IPS SMP.`,
    hints: ['Hubungkan istilah dengan ruang, waktu, atau kegiatan manusia.', 'Pilih opsi yang paling sesuai dengan definisi IPS.'],
    rewards: rewardFor(index, difficulty),
    generatedBy: 'static',
    createdAt: now(),
    type: 'multiple_choice'
  };
}

export const STATIC_QUESTIONS_BY_SUBJECT: Record<Subject, Question[]> = {
  Matematika: Array.from({ length: 50 }, (_, i) => mathQuestion(i)),
  IPA: Array.from({ length: 50 }, (_, i) => ipaQuestion(i)),
  'Bahasa Indonesia': Array.from({ length: 50 }, (_, i) => bahasaQuestion(i)),
  'Bahasa Inggris': Array.from({ length: 50 }, (_, i) => englishQuestion(i)),
  IPS: Array.from({ length: 50 }, (_, i) => ipsQuestion(i))
};

export const STATIC_QUESTIONS = Object.values(STATIC_QUESTIONS_BY_SUBJECT).flat();

export const MONSTERS: Monster[] = [
  'Algebra Dragon|Matematika|Naga persamaan yang menjaga gerbang aljabar|Persamaan linear',
  'Geometry Golem|Matematika|Raksasa batu berbentuk bangun ruang|Rumus luas',
  'Statistic Specter|Matematika|Hantu data yang suka membuat grafik|Rata-rata',
  'Fraction Fiend|Matematika|Makhluk pecahan yang membelah diri|Penyederhanaan pecahan',
  'Ratio Raptor|Matematika|Raptor cepat penjaga perbandingan|Rasio setara',
  'Physics Phantom|IPA|Bayangan energi dan gerak|Hukum Newton',
  'Cell Slime|IPA|Slime mikroskopis dari dunia sel|Organel sel',
  'Ecosystem Ent|IPA|Pohon hidup penjaga rantai makanan|Interaksi ekosistem',
  'Atom Imp|IPA|Imp kecil penyusun materi|Nomor atom',
  'Reaction Hydra|IPA|Hydra kimia dengan reaksi berantai|Penyetaraan reaksi',
  'Grammar Goblin|Bahasa Indonesia|Goblin penyusun kalimat rancu|Kalimat efektif',
  'Poetry Siren|Bahasa Indonesia|Siren sastra dengan majas memikat|Majas',
  'Paragraph Ogre|Bahasa Indonesia|Ogre yang menyembunyikan gagasan utama|Ide pokok',
  'Persuasion Pixie|Bahasa Indonesia|Peri ajakan dan argumen|Teks persuasi',
  'Conjunction Kobold|Bahasa Indonesia|Kobold penghubung klausa|Konjungsi',
  'Tense Troll|Bahasa Inggris|Troll penjaga bentuk waktu|Tenses',
  'Vocabulary Vampire|Bahasa Inggris|Vampir penyerap kata baru|Synonym',
  'Reading Revenant|Bahasa Inggris|Roh pemahaman bacaan|Main idea',
  'Expression Elf|Bahasa Inggris|Elf percakapan sopan|Daily expression',
  'Preposition Pirate|Bahasa Inggris|Bajak laut posisi dan arah|Preposition',
  'History Harpy|IPS|Harpy penjaga kronologi|Urutan peristiwa',
  'Geography Griffin|IPS|Griffin peta dan koordinat|Skala peta',
  'Economy Kraken|IPS|Kraken pasar dan produksi|Kegiatan ekonomi',
  'Sociology Shade|IPS|Bayangan interaksi sosial|Norma sosial',
  'Nusantara Naga|IPS|Naga kerajaan maritim|Kerajaan Indonesia',
  'Equation Elemental|Matematika|Elemental angka liar|Operasi hitung',
  'Lightwave Lich|IPA|Lich gelombang cahaya|Pemantulan cahaya',
  'Folklore Fox|Bahasa Indonesia|Rubah cerita rakyat|Unsur intrinsik',
  'Modal Minotaur|Bahasa Inggris|Minotaur should, must, can|Modal verbs',
  'Map Mimic|IPS|Peti peta palsu|Legenda peta'
].map((entry, index) => {
  const [name, subject, description, weakness] = entry.split('|') as [string, Subject, string, string];
  const level = 1 + Math.floor(index / 3);
  const hp = 90 + index * 12;
  return { id: `monster-${index + 1}`, name, image: ['🐉', '🗿', '👻', '👾', '🦖', '🧪', '🦠', '🌳', '⚛️', '🐲'][index % 10], subject, description, hp, maxHp: hp, damage: 10 + level * 2, level, weakness };
});

const itemNames = [
  'Pensil Perunggu', 'Kalkulator Kayu', 'Pedang Aljabar', 'Busur Sinonim', 'Tongkat Energi', 'Perisai Peta', 'Armor Konsentrasi', 'Jubah Memori', 'Sepatu Cepat', 'Helm Logika',
  'Potion Fokus', 'Potion Stamina', 'Potion Inspirasi', 'Potion Waktu', 'Potion Streak', 'Badge Rajin', 'Badge Peneliti', 'Badge Penulis', 'Badge Penjelajah', 'Badge Mentor',
  'Blade Persamaan', 'Staff Fotosintesis', 'Bow Grammar', 'Shield Nusantara', 'Armor Molekul', 'Potion Pemulihan Besar', 'Potion XP', 'Potion Gold', 'Badge Epic Scholar', 'Badge Legendary Sage',
  'Kompas Geografi', 'Buku Sastra', 'Lensa Mikroskop', 'Ransel Statistik', 'Cincin Kreativitas', 'Sarung Tangan Memori', 'Boots Kecepatan', 'Mahkota Literasi', 'Cape Sosial', 'Orb Bilangan',
  'Potion Anti Gugup', 'Potion Review', 'Potion Boss', 'Lencana Combo', 'Lencana Guild', 'Lencana Sahabat', 'Kapak Perbandingan', 'Robe Atom', 'Crossbow Vocabulary', 'Aegis Sejarah'
];
export const ITEMS: Item[] = itemNames.map((name, index) => {
  const category: Item['category'] = index % 5 === 0 || index > 44 ? 'Weapons' : index % 5 === 1 ? 'Armor' : index % 5 === 2 || name.includes('Potion') ? 'Potions' : 'Badges';
  const rarity: Item['rarity'] = index > 44 ? 'Legendary' : index > 29 ? 'Epic' : index > 14 ? 'Rare' : 'Common';
  const icons = { Weapons: '⚔️', Armor: '🛡️', Potions: '🧪', Badges: '🏅' };
  return {
    id: `item-${index + 1}`,
    name,
    category,
    rarity,
    icon: icons[category],
    description: `${name} memberi bantuan belajar dan bertarung sesuai rarity ${rarity}.`,
    effect: category === 'Potions' ? { heal: 30 + index, amount: 5 } : category === 'Weapons' ? { stat: 'intelligence', amount: 1 + (index % 5) } : category === 'Armor' ? { stat: 'memory', amount: 1 + (index % 4) } : { xpMultiplier: 1.05 + (index % 4) / 100 },
    value: 20 + index * 7,
    quantity: category === 'Potions' ? 1 : undefined
  };
});

const achievementNames = [
  'Langkah Pertama', '10 Soal Pertama', 'Pemburu 50 Soal', 'Centurion Quiz', 'Maraton Belajar', 'Akurat 10', 'Akurat 25', 'Akurat 50', 'Streak 3 Hari', 'Streak 7 Hari',
  'Streak 14 Hari', 'Streak 30 Hari', 'Quest Novice', 'Quest Adept', 'Quest Master', 'Battle Starter', 'Monster Hunter', 'Boss Breaker', 'Combo 3', 'Combo 5',
  'Combo 10', 'Level 5', 'Level 10', 'Level 25', 'Level 50', 'Master Matematika', 'Master IPA', 'Master Bahasa', 'Master IPS', 'Collector 5',
  'Collector 15', 'Collector 30', 'Pet Friend', 'Pet Trainer', 'Guild Joiner', 'Guild Hero', 'Friend Maker', 'Social Star', 'Tutor Talk', 'Sage Favorite',
  'Daily Login', 'Weekly Champion', 'Gold Saver', 'XP Grinder', 'Boss Chapter 1', 'Boss Chapter 5', 'Export Hero', 'Dark Mode Explorer', 'Mini Game Winner', 'Legend EduQuest'
];
export const ACHIEVEMENTS: Achievement[] = achievementNames.map((name, index) => {
  const category: Achievement['category'] = index < 14 ? 'Study' : index < 25 ? 'Battle' : index < 38 ? 'Social' : 'Special';
  const metric: Achievement['metric'] = index < 8 ? 'totalQuestionsAnswered' : index < 12 ? 'currentStreak' : index < 15 ? 'questsCompleted' : index < 21 ? 'battlesWon' : index < 25 ? 'level' : index < 32 ? 'totalGoldEarned' : index < 38 ? 'friends' : 'totalXpEarned';
  return {
    id: `ach-${index + 1}`,
    name,
    category,
    description: `Buka pencapaian "${name}" dengan konsisten memakai EduQuest RPG.`,
    icon: ['⭐', '🔥', '⚔️', '📚', '🏆', '💎'][index % 6],
    titleUnlock: TITLES[index % TITLES.length],
    metric,
    requirement: [1, 10, 50, 100, 200, 10, 25, 50, 3, 7, 14, 30, 1, 10, 30, 1, 10, 25, 3, 5, 10, 5, 10, 25, 50][index] ?? (100 + index * 20),
    reward: { xp: 30 + index * 5, gold: 20 + index * 3 }
  };
});

export const PETS: Pet[] = [
  { id: 'pet-1', name: 'Mochi Slime', icon: '🟣', unlockLevel: 10, bonus: '+3% XP dari quest', happiness: 70 },
  { id: 'pet-2', name: 'Kiko Owl', icon: '🦉', unlockLevel: 25, bonus: '+1 hint gratis per hari', happiness: 70 },
  { id: 'pet-3', name: 'Bara Fox', icon: '🦊', unlockLevel: 50, bonus: '+5% damage combo', happiness: 70 },
  { id: 'pet-4', name: 'Nala Cat', icon: '🐱', unlockLevel: 75, bonus: '+5% gold battle', happiness: 70 },
  { id: 'pet-5', name: 'Aero Dragon', icon: '🐲', unlockLevel: 100, bonus: '+10% semua reward', happiness: 70 },
  { id: 'pet-6', name: 'Piko Rabbit', icon: '🐰', unlockLevel: 10, bonus: '+2 speed', happiness: 70 },
  { id: 'pet-7', name: 'Lumi Star', icon: '⭐', unlockLevel: 25, bonus: '+2 creativity', happiness: 70 },
  { id: 'pet-8', name: 'Tera Turtle', icon: '🐢', unlockLevel: 50, bonus: '+20 max HP', happiness: 70 },
  { id: 'pet-9', name: 'Riko Raven', icon: '🐦‍⬛', unlockLevel: 75, bonus: '+2 memory', happiness: 70 },
  { id: 'pet-10', name: 'Nova Pup', icon: '🐶', unlockLevel: 100, bonus: '+3 intelligence', happiness: 70 }
];

export function fallbackQuestions(params: { subject?: string; difficulty?: Difficulty; grade?: Grade; count?: number; topic?: string }) {
  const subject = (params.subject as Subject) || 'Matematika';
  const pool = STATIC_QUESTIONS_BY_SUBJECT[subject] ?? STATIC_QUESTIONS;
  const filtered = pool.filter((q) => (!params.difficulty || q.difficulty === params.difficulty) && (!params.grade || q.grade === params.grade) && (!params.topic || q.topic.toLowerCase().includes(params.topic.toLowerCase())));
  const source = filtered.length >= (params.count ?? 5) ? filtered : pool;
  return source.slice(0, params.count ?? 5).map((q, i) => ({ ...q, id: `${q.id}-fallback-${Date.now()}-${i}` }));
}

export function dailyQuestsFor(dateKey: string): Quest[] {
  const seed = dateKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const subjects = Object.keys(STATIC_QUESTIONS_BY_SUBJECT) as Subject[];
  return Array.from({ length: 10 }, (_, i) => {
    const subject = subjects[(seed + i) % subjects.length];
    const difficulty = difficulties[(seed + i) % difficulties.length];
    const questions = fallbackQuestions({ subject, difficulty, count: 3 });
    return {
      id: `daily-${dateKey}-${i + 1}`,
      title: `Quest Harian ${i + 1}: ${SUBJECT_TOPICS[subject][i % SUBJECT_TOPICS[subject].length]}`,
      description: `Selesaikan 3 soal ${subject} untuk mengumpulkan energi belajar hari ini.`,
      type: 'daily',
      subject,
      difficulty,
      questions,
      rewards: { xp: 80 + i * 8, gold: 40 + i * 5, items: i % 3 === 0 ? [ITEMS[(seed + i) % ITEMS.length]] : [] },
      timeLimit: 300,
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };
  });
}

export function storyQuests(): Quest[] {
  return Array.from({ length: 10 }, (_, chapter) => ({
    id: `story-${chapter + 1}`,
    title: `Chapter ${chapter + 1}: Gerbang ${MONSTERS[chapter].name}`,
    description: `Taklukkan 5 battle chapter dan bersiap menghadapi boss ${MONSTERS[chapter].name}.`,
    type: 'story',
    subject: MONSTERS[chapter].subject,
    difficulty: difficulties[Math.min(2, Math.floor(chapter / 4))],
    questions: fallbackQuestions({ subject: MONSTERS[chapter].subject, count: 5, difficulty: difficulties[Math.min(2, Math.floor(chapter / 4))] }),
    rewards: { xp: 180 + chapter * 35, gold: 90 + chapter * 18, items: [ITEMS[(chapter * 3) % ITEMS.length]] },
    requirements: { minLevel: Math.max(1, chapter * 2) }
  }));
}
