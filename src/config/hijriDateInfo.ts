type HijriDateInfo = {
  month: string | '*';
  startDay: number;
  endDay: number;
  priority: number;
  title: string;
  description: string;
};

const hijriDateInfoConfig: HijriDateInfo[] = [
  // ── Significant Islamic Events (priority 1) ──

  {
    month: 'Muharram',
    startDay: 1,
    endDay: 1,
    priority: 1,
    title: 'Islamic New Year',
    description:
      'The first day of Muharram marks the beginning of the new Islamic year. Reflect on the passing of time, renew your intentions, and ask Allah to make this year one of goodness, growth, and closeness to Him.',
  },
  {
    month: 'Muharram',
    startDay: 10,
    endDay: 10,
    priority: 1,
    title: 'Day of Ashura',
    description:
      "The 10th of Muharram is the Day of Ashura, on which Allah saved Musa (AS) and the Children of Israel from Pharaoh. The Prophet ﷺ fasted this day and encouraged others to fast it. It is a day of gratitude, reflection, and remembrance of Allah's deliverance.",
  },
  {
    month: 'Rabiʻ I',
    startDay: 12,
    endDay: 12,
    priority: 1,
    title: 'Mawlid an-Nabi ﷺ',
    description:
      'The 12th of Rabi al-Awwal is widely commemorated as the birth of the Prophet Muhammad ﷺ. Increase in sending salawat upon him, learn about his noble character, and strive to follow his beautiful example in your daily life.',
  },
  {
    month: 'Rajab',
    startDay: 27,
    endDay: 27,
    priority: 1,
    title: "Isra wal Mi'raj",
    description:
      'The 27th of Rajab marks the Night Journey and Ascension, in which the Prophet ﷺ was taken from Makkah to Jerusalem and then ascended through the heavens. It was on this miraculous night that the five daily prayers were gifted to the Ummah. Reflect on the significance of salah and draw closer to Allah through it.',
  },
  {
    month: 'Shaʻban',
    startDay: 15,
    endDay: 15,
    priority: 1,
    title: 'Shab-e-Barat',
    description:
      "The 15th night of Sha'ban is regarded as a night of forgiveness and mercy. It is reported that Allah looks upon His creation on this night and forgives all except those who hold grudges or associate partners with Him. Spend the night in prayer, seek forgiveness, and let go of any ill feelings toward others.",
  },
  {
    month: 'Ramadan',
    startDay: 1,
    endDay: 1,
    priority: 1,
    title: 'Start of Ramadan',
    description:
      'The blessed month of Ramadan has arrived — the month in which the Quran was revealed, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained. Begin with sincere intention, set your goals for worship, and ask Allah to help you make the most of every moment.',
  },
  {
    month: 'Ramadan',
    startDay: 21,
    endDay: 30,
    priority: 1,
    title: 'Last 10 Nights of Ramadan',
    description:
      'The last ten nights of Ramadan are the most blessed nights of the year. Among them is Laylatul Qadr (the Night of Power), which is better than a thousand months. Increase in worship, supplication, and seek Laylatul Qadr in the odd nights.',
  },
  {
    month: 'Ramadan',
    startDay: 27,
    endDay: 27,
    priority: 1,
    title: 'Laylatul Qadr (Most Likely)',
    description:
      'The 27th night of Ramadan is widely regarded as the most likely night for Laylatul Qadr. Stand in prayer, make abundant dua, and recite: "Allahumma innaka afuwwun tuhibbul afwa fa\'fu anni" (O Allah, You are the Pardoner, You love to pardon, so pardon me).',
  },
  {
    month: 'Shawwal',
    startDay: 1,
    endDay: 1,
    priority: 1,
    title: 'Eid al-Fitr',
    description:
      'Eid Mubarak! Today is a day of celebration, gratitude, and joy marking the completion of Ramadan. Give Zakat al-Fitr before the Eid prayer, attend the prayer, and celebrate with family and community. May Allah accept your fasting, prayers, and good deeds.',
  },
  {
    month: 'Dhuʻl-Hijjah',
    startDay: 9,
    endDay: 9,
    priority: 1,
    title: 'Day of Arafah',
    description:
      'The Day of Arafah is one of the greatest days in Islam. Fasting on this day expiates the sins of the previous year and the coming year. It is a day of supplication and seeking forgiveness.',
  },
  {
    month: 'Dhuʻl-Hijjah',
    startDay: 10,
    endDay: 10,
    priority: 1,
    title: 'Eid al-Adha',
    description:
      'Eid Mubarak! Today is the Day of Sacrifice, commemorating the willingness of Ibrahim (AS) to sacrifice his son in obedience to Allah. Attend the Eid prayer, perform the Qurbani, and share the meat with family, neighbours, and those in need.',
  },

  // ── Fasting Days (priority 2) ──

  {
    month: 'Muharram',
    startDay: 9,
    endDay: 10,
    priority: 2,
    title: 'Fasting of Ashura',
    description:
      'It is recommended to fast on the 9th and 10th of Muharram. The Prophet ﷺ said: "Fasting the Day of Ashura, I hope that Allah will accept it as expiation for the previous year." Adding the 9th distinguishes the Muslim fast from others.',
  },
  {
    month: 'Shawwal',
    startDay: 2,
    endDay: 7,
    priority: 2,
    title: 'Six Days of Shawwal',
    description:
      'The Prophet ﷺ said: "Whoever fasts Ramadan and follows it with six days of Shawwal, it is as if he fasted the entire year." These six days can be fasted consecutively or spread throughout the month after Eid.',
  },
  {
    month: 'Dhuʻl-Hijjah',
    startDay: 1,
    endDay: 9,
    priority: 2,
    title: 'First 9 Days of Dhul-Hijjah',
    description:
      'The first ten days of Dhul-Hijjah are the best days of the year. The Prophet ﷺ said: "There are no days in which righteous deeds are more beloved to Allah than these ten days." Fast as many of these nine days as you can, especially the Day of Arafah, and increase in dhikr, takbeer, and good deeds.',
  },
  {
    month: '*',
    startDay: 13,
    endDay: 15,
    priority: 2,
    title: 'Ayyam al-Beedh (White Days)',
    description:
      'The 13th, 14th, and 15th of each Islamic month are known as the White Days. The Prophet ﷺ encouraged fasting these three days, saying it is like fasting the entire month. These are days when the moon is at its fullest and brightest.',
  },

  // ── Sacred Months (priority 3) ──

  {
    month: 'Muharram',
    startDay: 1,
    endDay: 30,
    priority: 3,
    title: 'Sacred Month of Muharram',
    description:
      'Muharram is one of the four sacred months in which fighting was forbidden. The Prophet ﷺ said: "The best fasting after Ramadan is in the month of Muharram." Increase in voluntary fasting and good deeds throughout this blessed month.',
  },
  {
    month: 'Rajab',
    startDay: 1,
    endDay: 30,
    priority: 3,
    title: 'Sacred Month of Rajab',
    description:
      'Rajab is one of the four sacred months and marks the beginning of the spiritual journey toward Ramadan. The Prophet ﷺ used to say: "O Allah, bless us in Rajab and Sha\'ban, and allow us to reach Ramadan." Use this month to prepare your heart and increase in worship.',
  },
  {
    month: 'Dhuʻl-Qiʻdah',
    startDay: 1,
    endDay: 30,
    priority: 3,
    title: "Sacred Month of Dhul-Qi'dah",
    description:
      "Dhul-Qi'dah is one of the four sacred months in which Allah has prohibited wrongdoing. It is the month preceding Dhul-Hijjah and a time to prepare spiritually for the blessed days of Hajj and sacrifice that lie ahead.",
  },
  {
    month: 'Dhuʻl-Hijjah',
    startDay: 1,
    endDay: 30,
    priority: 3,
    title: 'Sacred Month of Dhul-Hijjah',
    description:
      'Dhul-Hijjah is one of the four sacred months and contains the greatest days of the year. It is the month of Hajj, the Day of Arafah, and Eid al-Adha. Fill this month with dhikr, takbeer, tahmeed, and tahleel, and strive to draw closer to Allah through sacrifice and devotion.',
  },
];

function getHijriDateInfo(day: number, month: string): HijriDateInfo[] {
  return hijriDateInfoConfig
    .filter(
      (entry) =>
        (entry.month === '*' || entry.month === month) &&
        day >= entry.startDay &&
        day <= entry.endDay
    )
    .sort((a, b) => a.priority - b.priority);
}

export { hijriDateInfoConfig, getHijriDateInfo };
export type { HijriDateInfo };
