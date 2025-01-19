import cheerio from 'react-native-cheerio';

interface Day  {
  [key: string]: string
}

class PTApi {
  url: string;
  area: string;

  constructor() {
    this.url = 'https://masjids.co.za/salaahtimes';
    this.area = '';
  }

  setArea = (area: string) => {
    try {
      this.area = area.replaceAll('\'', '').replaceAll(' ', '').toLowerCase();
    } catch (error) {
      console.error('Error setting area:', error);
    }
  }

  fetchAreas =  async () => {
    try {
      const response = await fetch(this.url);
      const data = await response.text();

      const $ = cheerio.load(data);
      const areas = $('.col-lg-8').find('h5').toArray();
      return areas.map((area: string) => $(area).text().trim());

    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }

  /**
   *  Fetch times for the given date.
   * @param date The date for the times
   * @returns An ordered array of json objects with each object representing the day
   */
  fetchTimes = async (date: Date) => {
    try {
      if (!this.area) {
        throw new Error('No area defined. Please use setArea to set a valid area.')
      }
      const newUrl = `${this.url}/${this.area}/${date.getFullYear()}-${date.getMonth()+1}`;
      const response =  await fetch(newUrl);
      const data = await response.text();

      const $ = cheerio.load(data);
      const table = $('table.table-striped');
      const headerTitles: Array<string> = table.find('thead').first().find('th').toArray().map((title: object) => $(title).text());

      const results: Array<object> = [];

      table.find('tbody').toArray().forEach((tbody: object) => {
        $(tbody).find('tr').toArray().forEach((tr: object) => {
          const dayObj: Day = {};
          $(tr).find('td').toArray().forEach((td: object, index: number) => {
              dayObj[headerTitles[index]] = $(td).text();
          });
          results.push(dayObj);
        });
      });

      return results;
    } catch (error) {
      console.error('Error fetching times:', error);
    }
  };
}

export default PTApi;
