// HIGH: Directly Iran — 1 match = Iran-related
export const IRAN_TERMS_HIGH: readonly string[] = [
  'iran', 'iranian', 'iranisch', 'iranische', 'iranischen', 'iranischer',
  'tehran', 'teheran', 'isfahan', 'natanz', 'fordo', 'bushehr', 'arak', 'evin', 'qom',
  'khamenei', 'chamenei', 'raisi', 'pezeshkian', 'rouhani',
  'irgc', 'revolutionsgard', 'revolution guard',
  'jcpoa', 'atomabkommen',
  'iran war',
  // Opposition & Protest — direkt Iran
  'mojahedin', 'mek', 'pmoi', 'ncri', 'maryam rajavi', 'reza pahlavi',
  'mahsa amini', 'jina amini',
  // Farsi — direkt Iran
  'ایران', 'تهران', 'خامنه‌ای', 'سپاه', 'اصفهان', 'برجام', 'نیروهای بسیج',
  'مجاهدین', 'مریم رجوی', 'مهسا امینی',
]

// MEDIUM: Iran-nah — 2 matches or 1 MEDIUM + 1 LOW = Iran-related
export const IRAN_TERMS_MEDIUM: readonly string[] = [
  'ayatollah', 'supreme leader', 'mullah',
  'persian gulf', 'persisch', 'hormus', 'basij',
  'hezbollah', 'hisbollah',
  'nuclear deal', 'nuclear program',
  // Opposition & Protest — Iran-nah
  'woman life freedom', 'frau leben freiheit', 'morality police', 'sittenpolizei',
  // Farsi — Iran-nah
  'خلیج فارس', 'تحریم', 'ملا', 'هسته‌ای',
  'زن زندگی آزادی', 'گشت ارشاد',
]

// LOW: Generisch — allein nicht ausreichend
export const IRAN_TERMS_LOW: readonly string[] = [
  'nuclear', 'sanctions', 'cyberattack', 'internet cut',
  'shah', 'caspian', 'mossad', 'reform movement',
  'watchdog', 'connectivity',
  // Farsi — generisch
  'شاه', 'موساد',
]
