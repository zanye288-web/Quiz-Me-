export interface GoogleCloudVoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  type: 'Neural2' | 'Studio' | 'Journey' | 'Wavenet' | 'Standard' | 'Polyglot';
  ssmlGender?: 'FEMALE' | 'MALE' | 'NEUTRAL';
}

export interface SupportedLanguage {
  code: string; // ISO 639-1 or compound code, e.g. 'en', 'es', 'zh-CN'
  bcp47: string; // Full BCP-47 tag, e.g. 'en-US', 'es-ES'
  name: string; // English name
  nativeName: string; // Native name
  flag: string; // Flag emoji
  direction: 'ltr' | 'rtl';
  sampleSentence: string;
  googleCloudVoices: GoogleCloudVoiceOption[];
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en',
    bcp47: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    sampleSentence: 'What is the primary mechanism of cellular energy synthesis?',
    googleCloudVoices: [
      { id: 'en-US-Journey-F', name: 'Journey F (Natural Expressive)', gender: 'Female', type: 'Journey' },
      { id: 'en-US-Journey-D', name: 'Journey D (Natural Expressive)', gender: 'Male', type: 'Journey' },
      { id: 'en-US-Neural2-F', name: 'Neural2 F (Studio Clear)', gender: 'Female', type: 'Neural2' },
      { id: 'en-US-Neural2-D', name: 'Neural2 D (Authoritative)', gender: 'Male', type: 'Neural2' },
      { id: 'en-US-Studio-O', name: 'Studio O (Narrative)', gender: 'Female', type: 'Studio' },
      { id: 'en-US-Studio-Q', name: 'Studio Q (Academic)', gender: 'Male', type: 'Studio' },
      { id: 'en-US-Wavenet-C', name: 'Wavenet C (Clear)', gender: 'Female', type: 'Wavenet' },
      { id: 'en-US-Wavenet-B', name: 'Wavenet B (Warm)', gender: 'Male', type: 'Wavenet' },
    ],
  },
  {
    code: 'en-GB',
    bcp47: 'en-GB',
    name: 'English (UK)',
    nativeName: 'British English',
    flag: '🇬🇧',
    direction: 'ltr',
    sampleSentence: 'Which key principle underpins the separation of concerns?',
    googleCloudVoices: [
      { id: 'en-GB-Neural2-A', name: 'Neural2 A (London Classic)', gender: 'Female', type: 'Neural2' },
      { id: 'en-GB-Neural2-B', name: 'Neural2 B (Academic Tutor)', gender: 'Male', type: 'Neural2' },
      { id: 'en-GB-Neural2-C', name: 'Neural2 C (Oxford Scholar)', gender: 'Female', type: 'Neural2' },
      { id: 'en-GB-Studio-B', name: 'Studio B (BBC Standard)', gender: 'Male', type: 'Studio' },
      { id: 'en-GB-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'es',
    bcp47: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    flag: '🇪🇸',
    direction: 'ltr',
    sampleSentence: '¿Cuál es la función principal de las mitocondrias en la célula?',
    googleCloudVoices: [
      { id: 'es-ES-Neural2-A', name: 'Neural2 A (Castellano Claro)', gender: 'Female', type: 'Neural2' },
      { id: 'es-ES-Neural2-B', name: 'Neural2 B (Castellano Profesor)', gender: 'Male', type: 'Neural2' },
      { id: 'es-ES-Studio-C', name: 'Studio C (Locutor Profesional)', gender: 'Female', type: 'Studio' },
      { id: 'es-ES-Studio-F', name: 'Studio F (Educativo)', gender: 'Male', type: 'Studio' },
      { id: 'es-ES-Wavenet-B', name: 'Wavenet B', gender: 'Male', type: 'Wavenet' },
    ],
  },
  {
    code: 'es-MX',
    bcp47: 'es-MX',
    name: 'Spanish (Latin America / Mexico)',
    nativeName: 'Español (Latinoamérica)',
    flag: '🇲🇽',
    direction: 'ltr',
    sampleSentence: '¿Qué método de JavaScript transforma elementos en un arreglo?',
    googleCloudVoices: [
      { id: 'es-MX-Neural2-A', name: 'Neural2 A (Latinoamérica Femenina)', gender: 'Female', type: 'Neural2' },
      { id: 'es-MX-Neural2-B', name: 'Neural2 B (Latinoamérica Masculino)', gender: 'Male', type: 'Neural2' },
      { id: 'es-MX-Studio-A', name: 'Studio A (Profesor Dinámico)', gender: 'Female', type: 'Studio' },
      { id: 'es-MX-Wavenet-C', name: 'Wavenet C', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'fr',
    bcp47: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    sampleSentence: 'Quel est le rôle primordial de la mitochondrie dans la cellule ?',
    googleCloudVoices: [
      { id: 'fr-FR-Neural2-A', name: 'Neural2 A (Parisienne Claire)', gender: 'Female', type: 'Neural2' },
      { id: 'fr-FR-Neural2-B', name: 'Neural2 B (Enseignant)', gender: 'Male', type: 'Neural2' },
      { id: 'fr-FR-Studio-A', name: 'Studio A (Haute Fidélité)', gender: 'Female', type: 'Studio' },
      { id: 'fr-FR-Studio-D', name: 'Studio D (Académique)', gender: 'Male', type: 'Studio' },
      { id: 'fr-FR-Wavenet-C', name: 'Wavenet C', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'fr-CA',
    bcp47: 'fr-CA',
    name: 'French (Canada)',
    nativeName: 'Français Canadien',
    flag: '🇨🇦',
    direction: 'ltr',
    sampleSentence: 'Quelle fonction permet de manipuler les tableaux efficacement ?',
    googleCloudVoices: [
      { id: 'fr-CA-Neural2-A', name: 'Neural2 A (Québécois)', gender: 'Female', type: 'Neural2' },
      { id: 'fr-CA-Neural2-B', name: 'Neural2 B (Québécois)', gender: 'Male', type: 'Neural2' },
    ],
  },
  {
    code: 'de',
    bcp47: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    sampleSentence: 'Was ist die primäre Aufgabe der Mitochondrien in der Zelle?',
    googleCloudVoices: [
      { id: 'de-DE-Neural2-B', name: 'Neural2 B (Akademisch)', gender: 'Male', type: 'Neural2' },
      { id: 'de-DE-Neural2-F', name: 'Neural2 F (Klar & Modern)', gender: 'Female', type: 'Neural2' },
      { id: 'de-DE-Studio-B', name: 'Studio B (Dozent)', gender: 'Male', type: 'Studio' },
      { id: 'de-DE-Studio-C', name: 'Studio C (Studio Klarheit)', gender: 'Female', type: 'Studio' },
      { id: 'de-DE-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'it',
    bcp47: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    sampleSentence: 'Qual è la funzione fondamentale dei mitocondri cellulari?',
    googleCloudVoices: [
      { id: 'it-IT-Neural2-A', name: 'Neural2 A (Italiano Chiaro)', gender: 'Female', type: 'Neural2' },
      { id: 'it-IT-Neural2-C', name: 'Neural2 C (Docente)', gender: 'Male', type: 'Neural2' },
      { id: 'it-IT-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'pt-BR',
    bcp47: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    direction: 'ltr',
    sampleSentence: 'Qual é a principal função das mitocôndrias celulares?',
    googleCloudVoices: [
      { id: 'pt-BR-Neural2-A', name: 'Neural2 A (Clara e Educativa)', gender: 'Female', type: 'Neural2' },
      { id: 'pt-BR-Neural2-B', name: 'Neural2 B (Professor)', gender: 'Male', type: 'Neural2' },
      { id: 'pt-BR-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'pt-PT',
    bcp47: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (Portugal)',
    flag: '🇵🇹',
    direction: 'ltr',
    sampleSentence: 'Qual é a estrutura responsável pela produção de energia na célula?',
    googleCloudVoices: [
      { id: 'pt-PT-Neural2-A', name: 'Neural2 A (Lisboa)', gender: 'Female', type: 'Neural2' },
      { id: 'pt-PT-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'zh-CN',
    bcp47: 'zh-CN',
    name: 'Chinese (Mandarin Simplified)',
    nativeName: '简体中文 (普通话)',
    flag: '🇨🇳',
    direction: 'ltr',
    sampleSentence: '细胞中线粒体的主要生物学功能是什么？',
    googleCloudVoices: [
      { id: 'cmn-CN-Neural2-A', name: 'Neural2 A (标准普通话女声)', gender: 'Female', type: 'Neural2' },
      { id: 'cmn-CN-Neural2-C', name: 'Neural2 C (知性教师男声)', gender: 'Male', type: 'Neural2' },
      { id: 'cmn-CN-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'zh-TW',
    bcp47: 'zh-TW',
    name: 'Chinese (Traditional / Taiwan)',
    nativeName: '繁體中文 (台灣)',
    flag: '🇹🇼',
    direction: 'ltr',
    sampleSentence: '粒線體在人體細胞中的主要作用為何？',
    googleCloudVoices: [
      { id: 'cmn-TW-Neural2-A', name: 'Neural2 A (台灣優雅女聲)', gender: 'Female', type: 'Neural2' },
      { id: 'cmn-TW-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'zh-HK',
    bcp47: 'zh-HK',
    name: 'Chinese (Cantonese / Hong Kong)',
    nativeName: '粵語 (香港)',
    flag: '🇭🇰',
    direction: 'ltr',
    sampleSentence: '粒線體喺細胞入面發揮緊咩主要功能？',
    googleCloudVoices: [
      { id: 'yue-HK-Neural2-A', name: 'Neural2 A (香港標準女聲)', gender: 'Female', type: 'Neural2' },
      { id: 'yue-HK-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ja',
    bcp47: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    sampleSentence: '細胞内におけるミトコンドリアの主な働きは何ですか？',
    googleCloudVoices: [
      { id: 'ja-JP-Neural2-B', name: 'Neural2 B (明瞭な女性声)', gender: 'Female', type: 'Neural2' },
      { id: 'ja-JP-Neural2-C', name: 'Neural2 C (落ち着いた男性講師)', gender: 'Male', type: 'Neural2' },
      { id: 'ja-JP-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ko',
    bcp47: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    sampleSentence: '세포 내 미토콘드리아의 주된 생물학적 기능은 무엇입니까?',
    googleCloudVoices: [
      { id: 'ko-KR-Neural2-A', name: 'Neural2 A (표준 한국어 여성)', gender: 'Female', type: 'Neural2' },
      { id: 'ko-KR-Neural2-C', name: 'Neural2 C (교육용 전문 남성)', gender: 'Male', type: 'Neural2' },
      { id: 'ko-KR-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ar',
    bcp47: 'ar-XA',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    sampleSentence: 'ما هي الوظيفة البيولوجية الأساسية للميتوكوندريا في الخلية؟',
    googleCloudVoices: [
      { id: 'ar-XA-Neural2-A', name: 'Neural2 A (فصحى أنثى)', gender: 'Female', type: 'Neural2' },
      { id: 'ar-XA-Neural2-B', name: 'Neural2 B (فصحى معلم)', gender: 'Male', type: 'Neural2' },
      { id: 'ar-XA-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    sampleSentence: 'कोशिका में माइटोकॉन्ड्रिया का प्राथमिक कार्य क्या है?',
    googleCloudVoices: [
      { id: 'hi-IN-Neural2-A', name: 'Neural2 A (स्पष्ट शिक्षिका)', gender: 'Female', type: 'Neural2' },
      { id: 'hi-IN-Neural2-B', name: 'Neural2 B (शिक्षक पुरुष)', gender: 'Male', type: 'Neural2' },
      { id: 'hi-IN-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ru',
    bcp47: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    sampleSentence: 'Какова основная функция митохондрий в биологической клетке?',
    googleCloudVoices: [
      { id: 'ru-RU-Neural2-A', name: 'Neural2 A (Чёткий женский)', gender: 'Female', type: 'Neural2' },
      { id: 'ru-RU-Neural2-C', name: 'Neural2 C (Преподаватель)', gender: 'Male', type: 'Neural2' },
      { id: 'ru-RU-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'nl',
    bcp47: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    direction: 'ltr',
    sampleSentence: 'Wat is de voornaamste taak van mitochondriën in een cel?',
    googleCloudVoices: [
      { id: 'nl-NL-Neural2-A', name: 'Neural2 A (Vloeiend Nederlands)', gender: 'Female', type: 'Neural2' },
      { id: 'nl-NL-Neural2-B', name: 'Neural2 B (Docent)', gender: 'Male', type: 'Neural2' },
      { id: 'nl-NL-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'pl',
    bcp47: 'pl-PL',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    direction: 'ltr',
    sampleSentence: 'Jaka jest podstawowa funkcja mitochondriów w komórce?',
    googleCloudVoices: [
      { id: 'pl-PL-Neural2-A', name: 'Neural2 A (Klarowny polski)', gender: 'Female', type: 'Neural2' },
      { id: 'pl-PL-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'tr',
    bcp47: 'tr-TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr',
    sampleSentence: 'Mitokondrinin hücredeki temel biyolojik görevi nedir?',
    googleCloudVoices: [
      { id: 'tr-TR-Neural2-A', name: 'Neural2 A (Akıcı Türkçe)', gender: 'Female', type: 'Neural2' },
      { id: 'tr-TR-Neural2-B', name: 'Neural2 B (Öğretmen)', gender: 'Male', type: 'Neural2' },
      { id: 'tr-TR-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sv',
    bcp47: 'sv-SE',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    direction: 'ltr',
    sampleSentence: 'Vad är mitokondriens primära roll i levande celler?',
    googleCloudVoices: [
      { id: 'sv-SE-Neural2-A', name: 'Neural2 A (Tydlig pedagogik)', gender: 'Female', type: 'Neural2' },
      { id: 'sv-SE-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'id',
    bcp47: 'id-ID',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    direction: 'ltr',
    sampleSentence: 'Apa fungsi utama mitokondria di dalam sel biologis?',
    googleCloudVoices: [
      { id: 'id-ID-Neural2-A', name: 'Neural2 A (Suara Edukasi)', gender: 'Female', type: 'Neural2' },
      { id: 'id-ID-Neural2-B', name: 'Neural2 B (Pria)', gender: 'Male', type: 'Neural2' },
    ],
  },
  {
    code: 'vi',
    bcp47: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    direction: 'ltr',
    sampleSentence: 'Chức năng sinh học cốt lõi của ty thể trong tế bào là gì?',
    googleCloudVoices: [
      { id: 'vi-VN-Neural2-A', name: 'Neural2 A (Giọng Nữ Chuẩn)', gender: 'Female', type: 'Neural2' },
      { id: 'vi-VN-Neural2-D', name: 'Neural2 D (Giọng Nam Sư Phạm)', gender: 'Male', type: 'Neural2' },
    ],
  },
  {
    code: 'th',
    bcp47: 'th-TH',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    direction: 'ltr',
    sampleSentence: 'หน้าที่หลักของไมโทคอนเดรียภายในเซลล์คืออะไร?',
    googleCloudVoices: [
      { id: 'th-TH-Neural2-C', name: 'Neural2 C (เสียงสุภาพสตรี)', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'uk',
    bcp47: 'uk-UA',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    direction: 'ltr',
    sampleSentence: 'Яка основна енергетична функція мітохондрій у клітині?',
    googleCloudVoices: [
      { id: 'uk-UA-Neural2-A', name: 'Neural2 A (Виразна жіноча)', gender: 'Female', type: 'Neural2' },
      { id: 'uk-UA-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'el',
    bcp47: 'el-GR',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    direction: 'ltr',
    sampleSentence: 'Ποιος είναι ο πρωταρχικός ρόλος των μιτοχονδρίων στο κύτταρο;',
    googleCloudVoices: [
      { id: 'el-GR-Neural2-A', name: 'Neural2 A (Ευδιάκριτη εκφώνηση)', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'cs',
    bcp47: 'cs-CZ',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    direction: 'ltr',
    sampleSentence: 'Jaká je klíčová biologická funkce mitochondrií v buňce?',
    googleCloudVoices: [
      { id: 'cs-CZ-Wavenet-A', name: 'Wavenet A (Český přednášející)', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'da',
    bcp47: 'da-DK',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    direction: 'ltr',
    sampleSentence: 'Hvad er mitokondriernes primære funktion i cellen?',
    googleCloudVoices: [
      { id: 'da-DK-Neural2-D', name: 'Neural2 D', gender: 'Female', type: 'Neural2' },
      { id: 'da-DK-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'fi',
    bcp47: 'fi-FI',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    direction: 'ltr',
    sampleSentence: 'Mikä on mitokondrion keskeisin tehtävä elävässä solussa?',
    googleCloudVoices: [
      { id: 'fi-FI-Neural2-A', name: 'Neural2 A (Selkeä opetusääni)', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'no',
    bcp47: 'nb-NO',
    name: 'Norwegian',
    nativeName: 'Norsk (Bokmål)',
    flag: '🇳🇴',
    direction: 'ltr',
    sampleSentence: 'Hva er mitokondrienes viktigste funksjon i cellen?',
    googleCloudVoices: [
      { id: 'nb-NO-Neural2-A', name: 'Neural2 A', gender: 'Female', type: 'Neural2' },
      { id: 'nb-NO-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'hu',
    bcp47: 'hu-HU',
    name: 'Hungarian',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    direction: 'ltr',
    sampleSentence: 'Mi a mitokondrium elsődleges biológiai szerepe a sejtben?',
    googleCloudVoices: [
      { id: 'hu-HU-Wavenet-A', name: 'Wavenet A (Tiszta kiejtés)', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ro',
    bcp47: 'ro-RO',
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    direction: 'ltr',
    sampleSentence: 'Care este rolul principal al mitocondriilor în celulă?',
    googleCloudVoices: [
      { id: 'ro-RO-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'he',
    bcp47: 'he-IL',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    direction: 'rtl',
    sampleSentence: 'מהו התפקיד המרכזי של המיטוכונדריה בתא החי?',
    googleCloudVoices: [
      { id: 'he-IL-Neural2-A', name: 'Neural2 A (עברית רהוטה)', gender: 'Female', type: 'Neural2' },
      { id: 'he-IL-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'tl',
    bcp47: 'fil-PH',
    name: 'Filipino (Tagalog)',
    nativeName: 'Filipino',
    flag: '🇵🇭',
    direction: 'ltr',
    sampleSentence: 'Ano ang pangunahing tungkulin ng mitochondria sa selula?',
    googleCloudVoices: [
      { id: 'fil-PH-Neural2-A', name: 'Neural2 A (Malinaw na Guro)', gender: 'Female', type: 'Neural2' },
      { id: 'fil-PH-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ms',
    bcp47: 'ms-MY',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    direction: 'ltr',
    sampleSentence: 'Apakah fungsi biologi utama mitokondria dalam sel?',
    googleCloudVoices: [
      { id: 'ms-MY-Neural2-A', name: 'Neural2 A', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'bn',
    bcp47: 'bn-BD',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    sampleSentence: 'কোষের মধ্যে মাইটোকন্ড্রিয়ার প্রধান কাজ কী?',
    googleCloudVoices: [
      { id: 'bn-BD-Neural2-A', name: 'Neural2 A (স্পষ্ট বাংলা)', gender: 'Female', type: 'Neural2' },
      { id: 'bn-BD-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ta',
    bcp47: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr',
    sampleSentence: 'செல்லில் மைட்டோகாண்ட்ரியாவின் முதன்மைப் பணி என்ன?',
    googleCloudVoices: [
      { id: 'ta-IN-Neural2-A', name: 'Neural2 A (தெளிவான தமிழ்)', gender: 'Female', type: 'Neural2' },
      { id: 'ta-IN-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'te',
    bcp47: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr',
    sampleSentence: 'కణంలో మైటోకాండ్రియా ప్రధాన విధి ఏమిటి?',
    googleCloudVoices: [
      { id: 'te-IN-Neural2-A', name: 'Neural2 A', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'mr',
    bcp47: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    direction: 'ltr',
    sampleSentence: 'पेशीमध्ये मायटोकॉन्ड्रियाचे मुख्य कार्य काय आहे?',
    googleCloudVoices: [
      { id: 'mr-IN-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ur',
    bcp47: 'ur-PK',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    direction: 'rtl',
    sampleSentence: 'خلیے میں مائٹوکونڈریا کا بنیادی حیاتیاتی فعل کیا ہے؟',
    googleCloudVoices: [
      { id: 'ur-PK-Neural2-A', name: 'Neural2 A (واضح اردو)', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'fa',
    bcp47: 'fa-IR',
    name: 'Persian (Farsi)',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    direction: 'rtl',
    sampleSentence: 'عملکرد اصلی میتوکندری در سلول زنده چیست؟',
    googleCloudVoices: [
      { id: 'fa-IR-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sw',
    bcp47: 'sw-KE',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    direction: 'ltr',
    sampleSentence: 'Ni nini kazi ya msingi ya mitokondria katika chembe hai?',
    googleCloudVoices: [
      { id: 'sw-KE-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ca',
    bcp47: 'ca-ES',
    name: 'Catalan',
    nativeName: 'Català',
    flag: '🇦🇩',
    direction: 'ltr',
    sampleSentence: 'Quina és la funció fonamental dels mitocondris a la cèl·lula?',
    googleCloudVoices: [
      { id: 'ca-ES-Neural2-A', name: 'Neural2 A (Català Acadèmic)', gender: 'Female', type: 'Neural2' },
    ],
  },
  {
    code: 'hr',
    bcp47: 'hr-HR',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    flag: '🇭🇷',
    direction: 'ltr',
    sampleSentence: 'Koja je glavna uloga mitohondrija u živoj stanici?',
    googleCloudVoices: [
      { id: 'hr-HR-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sk',
    bcp47: 'sk-SK',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    direction: 'ltr',
    sampleSentence: 'Aká je kľúčová biologická úloha mitochondrií v bunke?',
    googleCloudVoices: [
      { id: 'sk-SK-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'bg',
    bcp47: 'bg-BG',
    name: 'Bulgarian',
    nativeName: 'Български',
    flag: '🇧🇬',
    direction: 'ltr',
    sampleSentence: 'Каква е основната роля на митохондриите в клетката?',
    googleCloudVoices: [
      { id: 'bg-BG-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sr',
    bcp47: 'sr-RS',
    name: 'Serbian',
    nativeName: 'Српски',
    flag: '🇷🇸',
    direction: 'ltr',
    sampleSentence: 'Која је главна енергетска функција митохондрија у ћелији?',
    googleCloudVoices: [
      { id: 'sr-RS-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'lt',
    bcp47: 'lt-LT',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    flag: '🇱🇹',
    direction: 'ltr',
    sampleSentence: 'Kokia yra pagrindinė mitochondrijų funkcija ląstelėje?',
    googleCloudVoices: [
      { id: 'lt-LT-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'lv',
    bcp47: 'lv-LV',
    name: 'Latvian',
    nativeName: 'Latviešu',
    flag: '🇱🇻',
    direction: 'ltr',
    sampleSentence: 'Kāda ir mitohondriju galvenā funkcija bioloģiskajā šūnā?',
    googleCloudVoices: [
      { id: 'lv-LV-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'et',
    bcp47: 'et-EE',
    name: 'Estonian',
    nativeName: 'Eesti',
    flag: '🇪🇪',
    direction: 'ltr',
    sampleSentence: 'Milline on mitokondrite peamine ülesanne elusrakus?',
    googleCloudVoices: [
      { id: 'et-EE-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sl',
    bcp47: 'sl-SI',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    flag: '🇸🇮',
    direction: 'ltr',
    sampleSentence: 'Kakšna je ključna funkcija mitohondrijev v celici?',
    googleCloudVoices: [
      { id: 'sl-SI-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'is',
    bcp47: 'is-IS',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    flag: '🇮🇸',
    direction: 'ltr',
    sampleSentence: 'Hvert er meginhlutverk hvatbera í lifandi frumu?',
    googleCloudVoices: [
      { id: 'is-IS-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'ga',
    bcp47: 'ga-IE',
    name: 'Irish (Gaeilge)',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    direction: 'ltr',
    sampleSentence: 'Cad é príomhfeidhm na miteacoindre sa chill?',
    googleCloudVoices: [
      { id: 'ga-IE-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'af',
    bcp47: 'af-ZA',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
    direction: 'ltr',
    sampleSentence: 'Wat is die primêre funksie van die mitochondria in die sel?',
    googleCloudVoices: [
      { id: 'af-ZA-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
  {
    code: 'sq',
    bcp47: 'sq-AL',
    name: 'Albanian',
    nativeName: 'Shqip',
    flag: '🇦🇱',
    direction: 'ltr',
    sampleSentence: 'Cili është funksioni kryesor i mitokondrive në qelizë?',
    googleCloudVoices: [
      { id: 'sq-AL-Wavenet-A', name: 'Wavenet A', gender: 'Female', type: 'Wavenet' },
    ],
  },
];

export function getLanguageByCode(codeOrBcp47?: string | null): SupportedLanguage {
  if (!codeOrBcp47) return SUPPORTED_LANGUAGES[0];
  const normalized = codeOrBcp47.toLowerCase().trim();

  // Exact match on code or bcp47
  const exact = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === normalized || l.bcp47.toLowerCase() === normalized
  );
  if (exact) return exact;

  // Prefix match (e.g. 'es-AR' -> 'es')
  const prefix = normalized.split('-')[0];
  const byPrefix = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === prefix || l.bcp47.toLowerCase().startsWith(prefix)
  );
  if (byPrefix) return byPrefix;

  // Match by name
  const byName = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase().includes(normalized) || l.nativeName.toLowerCase().includes(normalized)
  );
  if (byName) return byName;

  return SUPPORTED_LANGUAGES[0]; // fallback to English
}
