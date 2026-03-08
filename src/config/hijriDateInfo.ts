type HijriDateInfo = {
  month: string;
  startDay: number;
  endDay: number;
  title: string;
  description: string;
};

const hijriDateInfoConfig: HijriDateInfo[] = [
  {
    month: 'Ramadan',
    startDay: 21,
    endDay: 30,
    title: 'Last 10 Nights of Ramadan',
    description:
      'The last ten nights of Ramadan are the most blessed nights of the year. Among them is Laylatul Qadr (the Night of Power), which is better than a thousand months. Increase in worship, supplication, and seek Laylatul Qadr in the odd nights.',
  },
  {
    month: 'Ramadan',
    startDay: 27,
    endDay: 27,
    title: 'Laylatul Qadr (Most Likely)',
    description:
      'The 27th night of Ramadan is widely regarded as the most likely night for Laylatul Qadr. Stand in prayer, make abundant dua, and recite: "Allahumma innaka afuwwun tuhibbul afwa fa\'fu anni" (O Allah, You are the Pardoner, You love to pardon, so pardon me).',
  },
  {
    month: 'Dhul-Hijjah',
    startDay: 9,
    endDay: 9,
    title: 'Day of Arafah',
    description:
      'The Day of Arafah is one of the greatest days in Islam. Fasting on this day expiates the sins of the previous year and the coming year. It is a day of supplication and seeking forgiveness.',
  },
];

function getHijriDateInfo(day: number, month: string): HijriDateInfo[] {
  return hijriDateInfoConfig.filter(
    (entry) => entry.month === month && day >= entry.startDay && day <= entry.endDay
  );
}

export { hijriDateInfoConfig, getHijriDateInfo };
export type { HijriDateInfo };
