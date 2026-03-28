type AllahName = {
  /** Position in the list (1–99). */
  number: number;
  /** Name in Arabic script. */
  arabic: string;
  /** Romanised transliteration. */
  transliteration: string;
  /** English meaning of the name. */
  meaning: string;
  /** Detailed explanation of the name. */
  description: string;
};

const allahNames: AllahName[] = [
  {
    number: 1,
    arabic: 'الرَّحْمَنُ',
    transliteration: 'Ar-Rahman',
    meaning: 'The Most Gracious',
    description:
      'The One who bestows abundant mercy and blessings upon all creation in this world. This name encompasses all acts of mercy without distinction.',
  },
  {
    number: 2,
    arabic: 'الرَّحِيمُ',
    transliteration: 'Ar-Raheem',
    meaning: 'The Most Merciful',
    description:
      'The One whose deep and specific mercy is especially reserved for the believers. His mercy encompasses all of creation and extends into the Hereafter.',
  },
  {
    number: 3,
    arabic: 'الْمَلِكُ',
    transliteration: 'Al-Malik',
    meaning: 'The King',
    description:
      'The absolute Sovereign who owns and rules everything in the heavens and the earth without need of acquisition. All dominion belongs to Him alone.',
  },
  {
    number: 4,
    arabic: 'الْقُدُّوسُ',
    transliteration: 'Al-Quddus',
    meaning: 'The Most Holy',
    description:
      'The One who is pure and entirely free from all defects, imperfections, and limitations. The angels glorify Him with this name.',
  },
  {
    number: 5,
    arabic: 'السَّلَامُ',
    transliteration: 'As-Salam',
    meaning: 'The Source of Peace',
    description:
      'The One who is free from every imperfection and who grants peace and security to His creation. Paradise is called Dar as-Salam, the Abode of Peace.',
  },
  {
    number: 6,
    arabic: 'الْمُؤْمِنُ',
    transliteration: "Al-Mu'min",
    meaning: 'The Guardian of Faith',
    description:
      'The One who grants security and protection to His creation and testifies to the truth of His own oneness. He is the ultimate source of trust and safety.',
  },
  {
    number: 7,
    arabic: 'الْمُهَيْمِنُ',
    transliteration: 'Al-Muhaymin',
    meaning: 'The Protector',
    description:
      'The One who watches over, guards, and preserves all of creation with complete knowledge and control. Nothing escapes His vigilance.',
  },
  {
    number: 8,
    arabic: 'الْعَزِيزُ',
    transliteration: "Al-'Aziz",
    meaning: 'The Almighty',
    description:
      'The One who possesses unparalleled strength, power, and honor. He is never overcome or diminished, and He is completely self-sufficient.',
  },
  {
    number: 9,
    arabic: 'الْجَبَّارُ',
    transliteration: 'Al-Jabbar',
    meaning: 'The Compeller',
    description:
      'The One who restores and reforms all things according to His will. His decree is irresistible, and He repairs what is broken in His creation.',
  },
  {
    number: 10,
    arabic: 'الْمُتَكَبِّرُ',
    transliteration: 'Al-Mutakabbir',
    meaning: 'The Supreme',
    description:
      'The One who rightfully possesses supreme greatness and majesty. All true pride and greatness belong exclusively to Him.',
  },
  {
    number: 11,
    arabic: 'الْخَالِقُ',
    transliteration: 'Al-Khaliq',
    meaning: 'The Creator',
    description:
      'The One who brings all things into existence from nothing according to His will and plan. He creates with perfect knowledge and wisdom.',
  },
  {
    number: 12,
    arabic: 'الْبَارِئُ',
    transliteration: "Al-Bari'",
    meaning: 'The Originator',
    description:
      'The One who distinguishes and separates His creation, giving each thing its unique form and nature. He brings forth creation free from any model or precedent.',
  },
  {
    number: 13,
    arabic: 'الْمُصَوِّرُ',
    transliteration: 'Al-Musawwir',
    meaning: 'The Fashioner',
    description:
      'The One who gives shape and form to all things in the most perfect manner. He fashions creation in whatever form He wills.',
  },
  {
    number: 14,
    arabic: 'الْغَفَّارُ',
    transliteration: 'Al-Ghaffar',
    meaning: 'The Oft-Forgiving',
    description:
      'The One who repeatedly and abundantly forgives the sins of His servants. His forgiveness covers sins great and small, again and again.',
  },
  {
    number: 15,
    arabic: 'الْقَهَّارُ',
    transliteration: 'Al-Qahhar',
    meaning: 'The All-Subduer',
    description:
      'The One who subjugates and overpowers all of creation. Everything in existence is under His complete dominion and control.',
  },
  {
    number: 16,
    arabic: 'الْوَهَّابُ',
    transliteration: 'Al-Wahhab',
    meaning: 'The Bestower',
    description:
      'The One who gives freely and continuously without expecting anything in return. His gifts are abundant and unconditional.',
  },
  {
    number: 17,
    arabic: 'الرَّزَّاقُ',
    transliteration: 'Ar-Razzaq',
    meaning: 'The Provider',
    description:
      'The One who provides sustenance and all necessities for every living creature. He provides for all beings, both visible and hidden.',
  },
  {
    number: 18,
    arabic: 'الْفَتَّاحُ',
    transliteration: 'Al-Fattah',
    meaning: 'The Opener',
    description:
      'The One who opens all doors, resolves difficulties, and judges between His creation with truth and justice. He opens the doors of mercy and provision.',
  },
  {
    number: 19,
    arabic: 'الْعَلِيمُ',
    transliteration: "Al-'Alim",
    meaning: 'The All-Knowing',
    description:
      'The One whose knowledge encompasses everything — past, present, and future — in the heavens and earth. Nothing is hidden from Him.',
  },
  {
    number: 20,
    arabic: 'الْقَابِضُ',
    transliteration: 'Al-Qabid',
    meaning: 'The Withholder',
    description:
      'The One who constricts and withholds provision or soul according to His wisdom. He takes the souls of the living and restricts bounty as He wills.',
  },
  {
    number: 21,
    arabic: 'الْبَاسِطُ',
    transliteration: 'Al-Basit',
    meaning: 'The Expander',
    description:
      'The One who expands and increases provision, mercy, and well-being for whom He wills. He opens His hand of generosity to His servants.',
  },
  {
    number: 22,
    arabic: 'الْخَافِضُ',
    transliteration: 'Al-Khafid',
    meaning: 'The Abaser',
    description:
      'The One who lowers and humbles the arrogant and the disbelievers. He brings down whoever He wills in accordance with His wisdom and justice.',
  },
  {
    number: 23,
    arabic: 'الرَّافِعُ',
    transliteration: "Ar-Rafi'",
    meaning: 'The Exalter',
    description:
      'The One who raises and honors whom He wills, elevating the believers and the righteous in rank and status in both worlds.',
  },
  {
    number: 24,
    arabic: 'الْمُعِزُّ',
    transliteration: "Al-Mu'izz",
    meaning: 'The Bestower of Honor',
    description:
      'The One who grants honor, dignity, and glory to whom He wills. True honor comes only from Him, and whoever He honors cannot be humiliated.',
  },
  {
    number: 25,
    arabic: 'الْمُذِلُّ',
    transliteration: 'Al-Mudhill',
    meaning: 'The Humiliator',
    description:
      'The One who humiliates and disgraces whom He wills. He lowers those who are arrogant and disobedient through His perfect wisdom and justice.',
  },
  {
    number: 26,
    arabic: 'السَّمِيعُ',
    transliteration: "As-Sami'",
    meaning: 'The All-Hearing',
    description:
      'The One who hears every sound and voice, no matter how soft or distant. He hears the supplication of every servant who calls upon Him.',
  },
  {
    number: 27,
    arabic: 'الْبَصِيرُ',
    transliteration: 'Al-Basir',
    meaning: 'The All-Seeing',
    description:
      'The One who sees all things, from the deepest depths to the highest heavens. His sight penetrates what is hidden and what is apparent.',
  },
  {
    number: 28,
    arabic: 'الْحَكَمُ',
    transliteration: 'Al-Hakam',
    meaning: 'The Judge',
    description:
      'The One who judges between His creation with absolute truth and justice. His judgment is final and no one can overturn His decree.',
  },
  {
    number: 29,
    arabic: 'الْعَدْلُ',
    transliteration: "Al-'Adl",
    meaning: 'The Just',
    description:
      'The One who is perfectly just in all His judgments and dealings. He does not wrong any soul even by the weight of an atom.',
  },
  {
    number: 30,
    arabic: 'اللَّطِيفُ',
    transliteration: 'Al-Latif',
    meaning: 'The Subtle',
    description:
      'The One who is aware of the most minute details and who provides for His creation in subtle and gentle ways they do not perceive.',
  },
  {
    number: 31,
    arabic: 'الْخَبِيرُ',
    transliteration: 'Al-Khabir',
    meaning: 'The All-Aware',
    description:
      'The One who has complete inner knowledge of all things, their hidden realities and true states. He is aware of what lies in the depths of every heart.',
  },
  {
    number: 32,
    arabic: 'الْحَلِيمُ',
    transliteration: 'Al-Halim',
    meaning: 'The Forbearing',
    description:
      'The One who is patient and forbearing with the sins and shortcomings of His servants, not hastening to punish. His clemency gives space for repentance.',
  },
  {
    number: 33,
    arabic: 'الْعَظِيمُ',
    transliteration: "Al-'Azim",
    meaning: 'The Magnificent',
    description:
      'The One whose greatness and majesty surpass all understanding and description. He is too great to be fully comprehended by any mind.',
  },
  {
    number: 34,
    arabic: 'الْغَفُورُ',
    transliteration: 'Al-Ghafur',
    meaning: 'The Forgiving',
    description:
      'The One who forgives sins and covers faults generously. His forgiveness is vast and covers even major sins for those who sincerely repent.',
  },
  {
    number: 35,
    arabic: 'الشَّكُورُ',
    transliteration: 'Ash-Shakur',
    meaning: 'The Appreciative',
    description:
      'The One who recognizes and rewards even the smallest of good deeds, multiplying the reward abundantly for those who obey Him.',
  },
  {
    number: 36,
    arabic: 'الْعَلِيُّ',
    transliteration: "Al-'Ali",
    meaning: 'The Most High',
    description:
      'The One who is above all creation in His essence, power, and majesty. He is exalted above any deficiency or comparison.',
  },
  {
    number: 37,
    arabic: 'الْكَبِيرُ',
    transliteration: 'Al-Kabir',
    meaning: 'The Most Great',
    description:
      'The One who is incomparably great in His being and attributes. His greatness is absolute and encompasses everything in existence.',
  },
  {
    number: 38,
    arabic: 'الْحَفِيظُ',
    transliteration: 'Al-Hafiz',
    meaning: 'The Preserver',
    description:
      'The One who preserves and protects all of creation and keeps exact account of all deeds. He protects the believers from harm and calamity.',
  },
  {
    number: 39,
    arabic: 'الْمُقِيتُ',
    transliteration: 'Al-Muqit',
    meaning: 'The Sustainer',
    description:
      'The One who nourishes and provides sustenance for all living beings. He has the power to provide exactly what each creature needs.',
  },
  {
    number: 40,
    arabic: 'الْحَسِيبُ',
    transliteration: 'Al-Hasib',
    meaning: 'The Reckoner',
    description:
      'The One who takes account of all things and is sufficient for every need of His servants. He knows the precise count of all deeds and affairs.',
  },
  {
    number: 41,
    arabic: 'الْجَلِيلُ',
    transliteration: 'Al-Jalil',
    meaning: 'The Majestic',
    description:
      'The One who possesses glory, grandeur, and majesty in the highest degree. He is revered and exalted above everything in His creation.',
  },
  {
    number: 42,
    arabic: 'الْكَرِيمُ',
    transliteration: 'Al-Karim',
    meaning: 'The Generous',
    description:
      'The One who is infinitely noble and generous, giving abundantly without being asked. He is the most generous of all who give.',
  },
  {
    number: 43,
    arabic: 'الرَّقِيبُ',
    transliteration: 'Ar-Raqib',
    meaning: 'The Watchful',
    description:
      'The One who constantly watches over all of creation and is aware of every thought, word, and action. Nothing escapes His observation.',
  },
  {
    number: 44,
    arabic: 'الْمُجِيبُ',
    transliteration: 'Al-Mujib',
    meaning: 'The Responsive',
    description:
      "The One who answers prayers and responds to the calls of those who call upon Him. He is close to every supplicant and never turns away sincere du'a.",
  },
  {
    number: 45,
    arabic: 'الْوَاسِعُ',
    transliteration: "Al-Wasi'",
    meaning: 'The All-Encompassing',
    description:
      'The One whose knowledge, mercy, and provision encompass all things. His generosity and grace are vast and limitless.',
  },
  {
    number: 46,
    arabic: 'الْحَكِيمُ',
    transliteration: 'Al-Hakim',
    meaning: 'The All-Wise',
    description:
      'The One who acts with perfect wisdom in all His decisions and decrees. He places everything in its proper place with wisdom and purpose.',
  },
  {
    number: 47,
    arabic: 'الْوَدُودُ',
    transliteration: 'Al-Wadud',
    meaning: 'The Loving',
    description:
      'The One who loves His righteous servants and whom the believers love in return. His love is the most perfect and pure form of affection.',
  },
  {
    number: 48,
    arabic: 'الْمَجِيدُ',
    transliteration: 'Al-Majid',
    meaning: 'The Most Glorious',
    description:
      'The One who is far removed from any imperfection and is glorified in the highest degree. His glory is complete and His generosity is boundless.',
  },
  {
    number: 49,
    arabic: 'الْبَاعِثُ',
    transliteration: "Al-Ba'ith",
    meaning: 'The Resurrector',
    description:
      'The One who will resurrect all the dead on the Day of Judgment and send messengers to guide humanity. He alone has the power to restore life.',
  },
  {
    number: 50,
    arabic: 'الشَّهِيدُ',
    transliteration: 'Ash-Shahid',
    meaning: 'The Witness',
    description:
      'The One who witnesses all things in every moment and will bear witness on the Day of Judgment. Nothing occurs beyond His direct knowledge.',
  },
  {
    number: 51,
    arabic: 'الْحَقُّ',
    transliteration: 'Al-Haqq',
    meaning: 'The Truth',
    description:
      'The One who is the ultimate truth and whose existence is absolute and necessary. Everything other than Him is created and contingent on His will.',
  },
  {
    number: 52,
    arabic: 'الْوَكِيلُ',
    transliteration: 'Al-Wakil',
    meaning: 'The Trustee',
    description:
      'The One who is the best guardian and trustee of all affairs. He suffices for all the needs of those who put their trust in Him.',
  },
  {
    number: 53,
    arabic: 'الْقَوِيُّ',
    transliteration: 'Al-Qawiyy',
    meaning: 'The All-Powerful',
    description:
      'The One who possesses perfect and inexhaustible strength. His power knows no limits and cannot be overcome by any force.',
  },
  {
    number: 54,
    arabic: 'الْمَتِينُ',
    transliteration: 'Al-Matin',
    meaning: 'The Firm',
    description:
      'The One whose power is absolute and whose strength is unshakeable. He needs no support and His might never weakens.',
  },
  {
    number: 55,
    arabic: 'الْوَلِيُّ',
    transliteration: 'Al-Waliyy',
    meaning: 'The Protecting Friend',
    description:
      'The One who is the guardian and ally of the believers. He loves them, assists them, and draws them near to Him.',
  },
  {
    number: 56,
    arabic: 'الْحَمِيدُ',
    transliteration: 'Al-Hamid',
    meaning: 'The Praiseworthy',
    description:
      'The One who is deserving of all praise in every circumstance. He is praised for His attributes, actions, names, and everything that comes from Him.',
  },
  {
    number: 57,
    arabic: 'الْمُحْصِي',
    transliteration: 'Al-Muhsi',
    meaning: 'The Counter',
    description:
      'The One who has counted and recorded everything precisely, including every deed of every created being. Nothing is lost or forgotten in His reckoning.',
  },
  {
    number: 58,
    arabic: 'الْمُبْدِئُ',
    transliteration: "Al-Mubdi'",
    meaning: 'The Originator',
    description:
      'The One who initiates creation from nothing, without precedent or model. He begins the creation of every being for the first time.',
  },
  {
    number: 59,
    arabic: 'الْمُعِيدُ',
    transliteration: "Al-Mu'id",
    meaning: 'The Restorer',
    description:
      'The One who will return creation to its origin and restore life after death. He repeats the act of creation just as He originated it.',
  },
  {
    number: 60,
    arabic: 'الْمُحْيِي',
    transliteration: 'Al-Muhyi',
    meaning: 'The Giver of Life',
    description:
      'The One who gives life to all living things and will restore life on the Day of Resurrection. He alone is the source of all life.',
  },
  {
    number: 61,
    arabic: 'الْمُمِيتُ',
    transliteration: 'Al-Mumit',
    meaning: 'The Bringer of Death',
    description:
      'The One who causes death and brings an end to physical life according to His appointed time. Death occurs only by His command.',
  },
  {
    number: 62,
    arabic: 'الْحَيُّ',
    transliteration: 'Al-Hayy',
    meaning: 'The Ever-Living',
    description:
      'The One whose existence is eternal and who is alive in the most perfect and complete sense. His life has no beginning or end.',
  },
  {
    number: 63,
    arabic: 'الْقَيُّومُ',
    transliteration: 'Al-Qayyum',
    meaning: 'The Self-Subsisting',
    description:
      'The One who is self-sufficient and upon whom all of creation depends for their existence. He neither slumbers nor sleeps.',
  },
  {
    number: 64,
    arabic: 'الْوَاجِدُ',
    transliteration: 'Al-Wajid',
    meaning: 'The Finder',
    description:
      'The One who finds and achieves whatever He wills. He is never in need since He already possesses all things in infinite abundance.',
  },
  {
    number: 65,
    arabic: 'الْمَاجِدُ',
    transliteration: 'Al-Majid',
    meaning: 'The Noble',
    description:
      'The One who is supremely noble and generous. His generosity is endless and His noble qualities are beyond measure or comparison.',
  },
  {
    number: 66,
    arabic: 'الْوَاحِدُ',
    transliteration: 'Al-Wahid',
    meaning: 'The One',
    description:
      'The One who is singular and unique, having no partner, rival, or equal. His oneness is the foundation of Islamic belief.',
  },
  {
    number: 67,
    arabic: 'الْأَحَدُ',
    transliteration: 'Al-Ahad',
    meaning: 'The Unique',
    description:
      'The One who is absolutely indivisible and unique in His essence and attributes. He has no partner, offspring, or equivalent whatsoever.',
  },
  {
    number: 68,
    arabic: 'الصَّمَدُ',
    transliteration: 'As-Samad',
    meaning: 'The Eternal',
    description:
      'The One who is independent and self-sufficient, upon whom all creation depends. He is the master sought by all in times of need.',
  },
  {
    number: 69,
    arabic: 'الْقَادِرُ',
    transliteration: 'Al-Qadir',
    meaning: 'The All-Capable',
    description:
      'The One who is able to do all things without any limitation. His power extends over everything in existence.',
  },
  {
    number: 70,
    arabic: 'الْمُقْتَدِرُ',
    transliteration: 'Al-Muqtadir',
    meaning: 'The All-Determiner',
    description:
      'The One who has absolute power and determines all affairs with complete authority. His omnipotence is fully executed in every circumstance.',
  },
  {
    number: 71,
    arabic: 'الْمُقَدِّمُ',
    transliteration: 'Al-Muqaddim',
    meaning: 'The Expediter',
    description:
      'The One who brings forward whatever He wills and places things in their proper order. He advances the rank of the righteous and virtuous.',
  },
  {
    number: 72,
    arabic: 'الْمُؤَخِّرُ',
    transliteration: "Al-Mu'akhkhir",
    meaning: 'The Delayer',
    description:
      'The One who postpones and delays whatever He wills in accordance with His wisdom. He defers the punishment of the sinful to allow time for repentance.',
  },
  {
    number: 73,
    arabic: 'الْأَوَّلُ',
    transliteration: 'Al-Awwal',
    meaning: 'The First',
    description:
      'The One who has no beginning. He existed before all creation and there is nothing that preceded Him.',
  },
  {
    number: 74,
    arabic: 'الْآخِرُ',
    transliteration: 'Al-Akhir',
    meaning: 'The Last',
    description:
      'The One who has no end. He will remain after all creation has perished, and He is the ultimate destination of all things.',
  },
  {
    number: 75,
    arabic: 'الظَّاهِرُ',
    transliteration: 'Az-Zahir',
    meaning: 'The Manifest',
    description:
      'The One who is evident and apparent through His signs in creation. His existence is made clear through the countless proofs in the universe.',
  },
  {
    number: 76,
    arabic: 'الْبَاطِنُ',
    transliteration: 'Al-Batin',
    meaning: 'The Hidden',
    description:
      'The One whose true essence is hidden and beyond the grasp of human perception and intellect. He is closer to creation than they are to themselves.',
  },
  {
    number: 77,
    arabic: 'الْوَالِي',
    transliteration: 'Al-Wali',
    meaning: 'The Governor',
    description:
      'The One who is the guardian and ruler of all creation. He manages all affairs and governs the universe with complete knowledge and power.',
  },
  {
    number: 78,
    arabic: 'الْمُتَعَالِي',
    transliteration: "Al-Muta'ali",
    meaning: 'The Self-Exalted',
    description:
      'The One who is exalted far above all creation and above any attributes that do not befit His majesty. He transcends all limitations.',
  },
  {
    number: 79,
    arabic: 'الْبَرُّ',
    transliteration: 'Al-Barr',
    meaning: 'The Source of Goodness',
    description:
      'The One who is kind, righteous, and the source of all goodness. He treats His servants with great gentleness and benevolence.',
  },
  {
    number: 80,
    arabic: 'التَّوَّابُ',
    transliteration: 'At-Tawwab',
    meaning: 'The Accepter of Repentance',
    description:
      'The One who constantly turns toward His servants in forgiveness and accepts repentance again and again. He loves those who repent to Him.',
  },
  {
    number: 81,
    arabic: 'الْمُنْتَقِمُ',
    transliteration: 'Al-Muntaqim',
    meaning: 'The Avenger',
    description:
      'The One who takes righteous retribution against those who persist in wrongdoing and reject His signs. His vengeance is just and measured.',
  },
  {
    number: 82,
    arabic: 'الْعَفُوُّ',
    transliteration: "Al-'Afuww",
    meaning: 'The Pardoner',
    description:
      'The One who completely erases sins as though they never existed. His pardon goes beyond forgiveness — He obliterates the record of wrongdoing.',
  },
  {
    number: 83,
    arabic: 'الرَّؤُوفُ',
    transliteration: "Ar-Ra'uf",
    meaning: 'The Compassionate',
    description:
      'The One who is extremely kind and compassionate. His compassion is even more intense than His general mercy and is felt in gentleness and care.',
  },
  {
    number: 84,
    arabic: 'مَالِكُ الْمُلْكِ',
    transliteration: 'Malik al-Mulk',
    meaning: 'The Owner of Sovereignty',
    description:
      'The One who owns all kingdoms absolutely. He gives dominion to whom He wills and takes it from whom He wills, exalting and humbling as He wills.',
  },
  {
    number: 85,
    arabic: 'ذُو الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Dhul-Jalali wal-Ikram',
    meaning: 'Lord of Majesty and Generosity',
    description:
      'The One who possesses both incomparable majesty and boundless generosity. The Prophet ﷺ encouraged frequently reciting this magnificent name.',
  },
  {
    number: 86,
    arabic: 'الْمُقْسِطُ',
    transliteration: 'Al-Muqsit',
    meaning: 'The Equitable',
    description:
      'The One who establishes justice with perfect equity and fairness. He deals with all of creation in an absolutely just manner.',
  },
  {
    number: 87,
    arabic: 'الْجَامِعُ',
    transliteration: "Al-Jami'",
    meaning: 'The Gatherer',
    description:
      'The One who gathers all of creation together on the Day of Resurrection and who brings together seemingly opposite things in His creation.',
  },
  {
    number: 88,
    arabic: 'الْغَنِيُّ',
    transliteration: 'Al-Ghani',
    meaning: 'The Self-Sufficient',
    description:
      'The One who is absolutely free of all needs and entirely independent. He needs nothing and no one, while all of creation is in need of Him.',
  },
  {
    number: 89,
    arabic: 'الْمُغْنِي',
    transliteration: 'Al-Mughni',
    meaning: 'The Enricher',
    description:
      'The One who enriches and fulfills the needs of His servants. He is the source of all wealth and sufficiency, and none can enrich except Him.',
  },
  {
    number: 90,
    arabic: 'الْمَانِعُ',
    transliteration: "Al-Mani'",
    meaning: 'The Preventer',
    description:
      'The One who withholds or prevents what He wills in accordance with His wisdom. Sometimes what He prevents is a protection and a mercy.',
  },
  {
    number: 91,
    arabic: 'الضَّارُّ',
    transliteration: 'Ad-Darr',
    meaning: 'The Distresser',
    description:
      'The One who allows harm and difficulty to reach whom He wills as a test or a consequence. He alone controls all harm and benefit.',
  },
  {
    number: 92,
    arabic: 'النَّافِعُ',
    transliteration: "An-Nafi'",
    meaning: 'The Benefactor',
    description:
      'The One who creates benefit and good for whom He wills. All benefit in the universe ultimately flows from His will and decree.',
  },
  {
    number: 93,
    arabic: 'النُّورُ',
    transliteration: 'An-Nur',
    meaning: 'The Light',
    description:
      'The One who illuminates the heavens and the earth. He is the light of all guidance, and through His light the believers find their way.',
  },
  {
    number: 94,
    arabic: 'الْهَادِي',
    transliteration: 'Al-Hadi',
    meaning: 'The Guide',
    description:
      'The One who guides His creation to what is beneficial. He alone grants true guidance to the hearts, and whoever He guides cannot be misled.',
  },
  {
    number: 95,
    arabic: 'الْبَدِيعُ',
    transliteration: "Al-Badi'",
    meaning: 'The Incomparable Originator',
    description:
      'The One who creates in the most wonderful and unprecedented manner. His creation is unique and unlike anything that could be imagined.',
  },
  {
    number: 96,
    arabic: 'الْبَاقِي',
    transliteration: 'Al-Baqi',
    meaning: 'The Everlasting',
    description:
      'The One who endures forever and will never cease to exist. While all creation will perish, He alone remains eternal and permanent.',
  },
  {
    number: 97,
    arabic: 'الْوَارِثُ',
    transliteration: 'Al-Warith',
    meaning: 'The Inheritor',
    description:
      'The One who remains and inherits everything after all creation has perished. He is the ultimate owner after the end of all worldly kingdoms.',
  },
  {
    number: 98,
    arabic: 'الرَّشِيدُ',
    transliteration: 'Ar-Rashid',
    meaning: 'The Guide to the Right Path',
    description:
      'The One who directs all affairs to their proper ends with perfect wisdom. His guidance is infallible and His management of the universe is flawless.',
  },
  {
    number: 99,
    arabic: 'الصَّبُورُ',
    transliteration: 'As-Sabur',
    meaning: 'The Patient',
    description:
      'The One who is infinitely patient and does not hasten punishment upon the wrongdoers. His patience gives all of creation the opportunity to return to Him.',
  },
];

export { allahNames };
export type { AllahName };
