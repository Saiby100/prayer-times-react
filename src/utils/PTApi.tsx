import cheerio from 'react-native-cheerio';
import log from '@/utils/logger';

type Day = {
  /** Prayer name to time string mapping for a single day. */
  [key: string]: string;
};

class PTApi {
  url: string;
  area: string;

  constructor() {
    this.url = 'https://masjids.co.za/salaahtimes';
    this.area = '';
  }

  setArea = (area: string) => {
    try {
      this.area = area.replaceAll("'", '').replaceAll(' ', '').toLowerCase();
    } catch (error) {
      log.error('PTApi: error setting area', { type: 'api', error: String(error) });
    }
  };

  fetchAreas = async () => {
    try {
      log.info('PTApi: fetching areas', { type: 'api', url: this.url });
      const response = await fetch(this.url);
      const data = await response.text();

      const $ = cheerio.load(data);
      const areas = $('.col-lg-8').find('h5').toArray();
      const result = areas.map((area: string) => $(area).text().trim());
      log.info('PTApi: fetched areas', { type: 'api', count: result.length });
      return result;
    } catch (error) {
      log.error('PTApi: error fetching areas', { type: 'api', error: String(error) });
    }
  };

  /**
   *  Fetch times for the given date.
   * @param date The date for the times
   * @returns An ordered array of json objects with each object representing the day
   */
  fetchTimes = async (date: Date) => {
    try {
      if (!this.area) {
        throw new Error('No area defined. Please use setArea to set a valid area.');
      }
      const newUrl = `${this.url}/${this.area}/${date.getFullYear()}-${date.getMonth() + 1}`;
      log.info('PTApi: fetching times', { type: 'api', url: newUrl, area: this.area });
      const response = await fetch(newUrl);
      const data = await response.text();

      const $ = cheerio.load(data);
      const table = $('table.table-striped');
      const headerTitles: Array<string> = table
        .find('thead')
        .first()
        .find('th')
        .toArray()
        .map((title: object) => $(title).text());

      const results: Array<Day> = [];

      table
        .find('tbody')
        .toArray()
        .forEach((tbody: object) => {
          $(tbody)
            .find('tr')
            .toArray()
            .forEach((tr: object) => {
              const dayObj: Day = {};
              $(tr)
                .find('td')
                .toArray()
                .forEach((td: object, index: number) => {
                  dayObj[headerTitles[index]] = $(td).text();
                });
              results.push(dayObj);
            });
        });

      return results.map((dayObj: Day) => {
        delete dayObj['Date'];
        delete dayObj['Day'];

        return dayObj;
      });
    } catch (error) {
      log.error('PTApi: error fetching times', {
        type: 'api',
        error: String(error),
        area: this.area,
      });
    }
  };
}

export default PTApi;
