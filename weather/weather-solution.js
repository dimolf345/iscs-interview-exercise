const { TextParser, getFileInputData } = require("./../common");

class WeatherDay {
  constructor(day, maxTemp = 0, minTemp = 0) {
    this.day = this.#checkDay(day);
    this.maxTemp = this.#cleanTempData(maxTemp);
    this.minTemp = this.#cleanTempData(minTemp);
    if(this.maxTemp < this.minTemp) throw new Error('maxTemp must be greater than minTemp')
  }

  calcExcursion() {
    return this.maxTemp - this.minTemp
  }

  #checkDay(day) {
    if (!Number.isInteger(+day)) {
      console.log("Day number must be an integer between 1 and 31");
      return
    } else if (+day < 1 || +day > 31) {
      console.log("Invalid day number");
      return
    } else return +day;
  }

  #cleanTempData(temp) {
    if (Number(temp)) return +temp;
    if (!/\d+/.test(temp)) {
      console.error(`${temp} is not a valid Temperature Data`);
      return null;
    }
    let floatRegex = /^[0-9]+(\.[0-9]*)?/;
    let match = temp.match(floatRegex);
    if (!match) {
      console.log(`Extraction of Temperature data from ${temp} failed`);
      return null;
    }
    return Number(match[0])
  }
}

const createWeaterDays = (input) => {
  if(!(input instanceof TextParser)) {
    throw new Error('Invalid input! You must enter an instance of TextParser class')
  }
  let days = []
  for (let row of input.rows) {
      let wtDay = new WeatherDay(row.data.Dy, row.data.MxT, row.data.MnT)
      days.push(wtDay);
  }
  return days
}

const getMinExcursionDay = (wtDayArr) => {
  let minExDay = wtDayArr[0]
  for (let i= 0; i < wtDayArr.length; i++) {
    if(wtDayArr[i].calcExcursion() < minExDay.calcExcursion()) {
      minExDay = wtDayArr[i]
      console.log('New MinExDay found', minExDay);
    }
  }
  return minExDay;
}


async function main() {
  let input = await getFileInputData('weather.dat');
  const parsedInput = new TextParser(input);
  parsedInput.setHeadFromLine(0, ["Dy", "MxT", "MnT"]);
  parsedInput.createRows();
  let weatherDays = createWeaterDays(parsedInput)
  let result = getMinExcursionDay(weatherDays);
}

main();
