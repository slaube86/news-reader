export interface CountryEntry {
  code: string
  name: string
  lat: number
  lng: number
  terms: string[]
}

export const COUNTRIES: CountryEntry[] = [
  // Naher Osten & Zentralasien
  { code: 'IR', name: 'Iran', lat: 32.4, lng: 53.7, terms: ['iran', 'tehran', 'teheran', 'persisch', 'persian', 'isfahan', 'ایران', 'تهران', 'اصفهان', 'قم', 'شیراز', 'مشهد', 'iranian', 'iranisch', 'iranische'] },
  { code: 'IQ', name: 'Irak', lat: 33.2, lng: 43.7, terms: ['irak', 'iraq', 'bagdad', 'baghdad', 'basra', 'kurdistan', 'عراق', 'بغداد'] },
  { code: 'SY', name: 'Syrien', lat: 35.0, lng: 38.0, terms: ['syrien', 'syria', 'damaskus', 'damascus', 'aleppo', 'syrian', 'سوریه', 'دمشق'] },
  { code: 'IL', name: 'Israel', lat: 31.0, lng: 34.8, terms: ['israel', 'jerusalem', 'tel aviv', 'gaza', 'netanjahu', 'netanyahu', 'israelisch', 'israeli', 'اسرائیل', 'بیت‌المقدس'] },
  { code: 'PS', name: 'Palästina', lat: 31.9, lng: 35.2, terms: ['palästin', 'palestin', 'westbank', 'west bank', 'westjordanland', 'ramallah', 'gaza', 'hamas', 'فلسطین', 'غزه'] },
  { code: 'LB', name: 'Libanon', lat: 33.9, lng: 35.8, terms: ['libanon', 'lebanon', 'beirut', 'hisbollah', 'hezbollah', 'لبنان', 'بیروت', 'حزب‌الله'] },
  { code: 'JO', name: 'Jordanien', lat: 31.2, lng: 36.5, terms: ['jordanien', 'jordan', 'amman', 'اردن', 'عمان'] },
  { code: 'SA', name: 'Saudi-Arabien', lat: 23.9, lng: 45.1, terms: ['saudi', 'riad', 'riyadh', 'mekka', 'mecca', 'medina', 'عربستان', 'ریاض'] },
  { code: 'AE', name: 'VAE', lat: 23.4, lng: 53.8, terms: ['emirate', 'dubai', 'abu dhabi', 'امارات', 'دبی'] },
  { code: 'YE', name: 'Jemen', lat: 15.6, lng: 48.5, terms: ['jemen', 'yemen', 'sanaa', 'huthi', 'houthi', 'یمن', 'صنعا', 'حوثی'] },
  { code: 'OM', name: 'Oman', lat: 21.5, lng: 55.9, terms: ['oman', 'maskat', 'muscat', 'عمان'] },
  { code: 'QA', name: 'Katar', lat: 25.3, lng: 51.2, terms: ['katar', 'qatar', 'doha', 'قطر', 'دوحه'] },
  { code: 'BH', name: 'Bahrain', lat: 26.0, lng: 50.5, terms: ['bahrain', 'بحرین'] },
  { code: 'KW', name: 'Kuwait', lat: 29.3, lng: 47.5, terms: ['kuwait', 'کویت'] },
  { code: 'AF', name: 'Afghanistan', lat: 33.9, lng: 67.7, terms: ['afghanistan', 'kabul', 'taliban', 'افغانستان', 'کابل', 'طالبان'] },
  { code: 'PK', name: 'Pakistan', lat: 30.4, lng: 69.3, terms: ['pakistan', 'islamabad', 'karatschi', 'karachi', 'پاکستان', 'اسلام‌آباد'] },
  { code: 'TR', name: 'Türkei', lat: 38.9, lng: 35.2, terms: ['türkei', 'turkey', 'türkisch', 'turkish', 'ankara', 'istanbul', 'erdogan', 'ترکیه', 'آنکارا', 'استانبول'] },
  { code: 'AZ', name: 'Aserbaidschan', lat: 40.1, lng: 47.6, terms: ['aserbaidschan', 'azerbaijan', 'baku', 'آذربایجان', 'باکو'] },
  { code: 'AM', name: 'Armenien', lat: 40.1, lng: 44.5, terms: ['armenien', 'armenia', 'jerewan', 'yerevan', 'ارمنستان'] },
  { code: 'GE', name: 'Georgien', lat: 42.3, lng: 43.4, terms: ['georgien', 'georgia', 'tiflis', 'tbilisi', 'گرجستان'] },
  { code: 'TM', name: 'Turkmenistan', lat: 38.9, lng: 59.6, terms: ['turkmenistan', 'aschgabat', 'ashgabat', 'ترکمنستان'] },

  // Europa
  { code: 'DE', name: 'Deutschland', lat: 51.2, lng: 10.5, terms: ['deutschland', 'germany', 'german', 'berlin', 'münchen', 'hamburg', 'آلمان', 'برلین'] },
  { code: 'US', name: 'USA', lat: 37.1, lng: -95.7, terms: ['usa', 'vereinigte staaten', 'united states', 'washington', 'pentagon', 'white house', 'weißes haus', 'آمریکا', 'واشنگتن', 'کاخ سفید', 'american'] },
  { code: 'RU', name: 'Russland', lat: 61.5, lng: 105.3, terms: ['russland', 'russia', 'moskau', 'moscow', 'putin', 'kreml', 'kremlin', 'روسیه', 'مسکو', 'پوتین'] },
  { code: 'CN', name: 'China', lat: 35.9, lng: 104.2, terms: ['china', 'peking', 'beijing', 'chinesisch', 'chinese', 'چین', 'پکن'] },
  { code: 'GB', name: 'Großbritannien', lat: 55.4, lng: -3.4, terms: ['großbritannien', 'britain', 'british', 'london', 'england', 'uk', 'بریتانیا', 'لندن', 'انگلیس'] },
  { code: 'FR', name: 'Frankreich', lat: 46.2, lng: 2.2, terms: ['frankreich', 'france', 'french', 'paris', 'macron', 'فرانسه', 'پاریس'] },
  { code: 'UA', name: 'Ukraine', lat: 48.4, lng: 31.2, terms: ['ukraine', 'kiew', 'kyiv', 'selensky', 'zelensky', 'اوکراین', 'کی‌یف'] },
  { code: 'IT', name: 'Italien', lat: 41.9, lng: 12.6, terms: ['italien', 'italy', 'italian', 'rom', 'rome', 'ایتالیا', 'رم'] },
  { code: 'ES', name: 'Spanien', lat: 40.5, lng: -3.7, terms: ['spanien', 'spain', 'spanish', 'madrid', 'اسپانیا'] },
  { code: 'PL', name: 'Polen', lat: 51.9, lng: 19.1, terms: ['polen', 'poland', 'warschau', 'warsaw', 'لهستان'] },
  { code: 'AT', name: 'Österreich', lat: 47.5, lng: 14.6, terms: ['österreich', 'austria', 'wien', 'vienna', 'اتریش'] },
  { code: 'CH', name: 'Schweiz', lat: 46.8, lng: 8.2, terms: ['schweiz', 'switzerland', 'bern', 'zürich', 'genf', 'geneva', 'سوئیس'] },

  // Afrika
  { code: 'EG', name: 'Ägypten', lat: 26.8, lng: 30.8, terms: ['ägypten', 'egypt', 'kairo', 'cairo', 'suez', 'مصر', 'قاهره'] },
  { code: 'LY', name: 'Libyen', lat: 26.3, lng: 17.2, terms: ['libyen', 'libya', 'tripolis', 'tripoli', 'لیبی'] },
  { code: 'SD', name: 'Sudan', lat: 12.9, lng: 30.2, terms: ['sudan', 'khartum', 'khartoum', 'سودان'] },
  { code: 'SO', name: 'Somalia', lat: 5.2, lng: 46.2, terms: ['somalia', 'mogadischu', 'mogadishu', 'سومالی'] },

  // Asien
  { code: 'IN', name: 'Indien', lat: 20.6, lng: 79.0, terms: ['indien', 'india', 'indian', 'delhi', 'mumbai', 'modi', 'هند', 'دهلی'] },
  { code: 'KP', name: 'Nordkorea', lat: 40.3, lng: 127.5, terms: ['nordkorea', 'north korea', 'pjöngjang', 'pyongyang', 'kim jong', 'کره شمالی'] },
  { code: 'KR', name: 'Südkorea', lat: 35.9, lng: 127.8, terms: ['südkorea', 'south korea', 'seoul', 'کره جنوبی'] },
  { code: 'JP', name: 'Japan', lat: 36.2, lng: 138.3, terms: ['japan', 'tokio', 'tokyo', 'ژاپن', 'توکیو'] },

  // Amerika
  { code: 'BR', name: 'Brasilien', lat: -14.2, lng: -51.9, terms: ['brasilien', 'brazil', 'brasilia', 'برزیل'] },
  { code: 'VE', name: 'Venezuela', lat: 6.4, lng: -66.6, terms: ['venezuela', 'caracas', 'ونزوئلا'] },
  { code: 'CU', name: 'Kuba', lat: 21.5, lng: -77.8, terms: ['kuba', 'cuba', 'havanna', 'havana', 'کوبا'] },
]
