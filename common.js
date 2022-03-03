const fs = require("fs");
const prompt = require("prompt");

class TextParser {
  constructor(rawText) {
    console.log("Parsing text input...");
    this.lines = this.#parseLines(rawText);
    this.heads = [];
    this.headLineNr = 0;
    this.rows = [];
    console.log(`Found ${this.lines.length} lines`);
  }

  #parseLines(textString) {
    if (typeof textString !== "string") {
      throw new Error("Text parser accepts only strings as a variable");
    }
    let lines = textString.split("\n");
    console.log(lines);
    return lines;
  }

  #findHeadByKey(lineText, keySearch) {
    let regex = new RegExp(`(?<=\\s|^)${keySearch}(?=\\s|$)`);
    const match = lineText.match(regex);
    if (!match) throw new Error(`${keySearch} is not found in ${lineText}`);
    return {
      key: match[0],
      startsAt: match.index,
    };
  }

  #findAllHead(lineText) {
    const heads = [];
    for (let startK = 0; startK < lineText.length; ) {
      if (/\S/.test(lineText[startK])) {
        let endK = startK;
        do {
          endK++;
        } while (endK < lineText.length && /\S/.test(lineText[endK]));
        heads.push({
          key: lineText.substring(startK, endK),
          startsAt: startK,
        });
        startK = endK;
      } else startK++;
    }
    return heads;
  }

  #extractRowData(lineText, lineNum) {
    let regex = new RegExp("\\S+(?=\\s|$)", "g");
    let result = {
      line: lineNum,
      data: {},
    };
    for (let i = 0; i < this.heads.length; i++) {
      let endsAt =
        i < this.heads.length - 1
          ? this.heads[i + 1].startsAt
          : this.heads[i].startsAt + this.heads[i].key.length;
      const parsedField = lineText.slice(this.heads[i].startsAt - 1, endsAt+1);
      let match = parsedField.match(regex);
      if (!match) {
        result.data[this.heads[i].key] = null;
      } else {
        result.data[this.heads[i].key] = match[0];
      }
    }
    return result;
  }

  #isEmptyLine(lineText) {
    const wordRegexp = new RegExp(/\w+/, "g");
    return !wordRegexp.test(lineText);
  }

  #checkLineNum(lineNum) {
    if (
      lineNum < 0 ||
      typeof lineNum !== "number" ||
      lineNum > this.lines.length
    ) {
      throw new Error(
        "Invalid number set for Head or number exceeds document lines"
      );
    }
    let selLine = this.lines[lineNum];
    if (this.#isEmptyLine(selLine))
      throw new Error(`Line ${lineNum} is an empty line. Select another line.`);
    return selLine;
  }

  setHeadFromLine(lineNum = 0, selectedFields = []) {
    const selectedLine = this.#checkLineNum(lineNum);
    if (!Array.isArray(selectedFields)) {
      throw new Error(
        "Invalid fields input. You must enter selected fields as an array"
      );
    }
    if (selectedFields.length > 0) {
      selectedFields.forEach((field) =>
        this.heads.push(this.#findHeadByKey(selectedLine, field))
      );
    } else {
      this.heads = this.#findAllHead(selectedLine);
    }
    this.headLineNr = lineNum;
  }

  createRows() {
    for (let row = this.headLineNr + 1; row < this.lines.length; row++) {
      console.log(`Extracting data from line nr. ${row}`);
      if (this.#isEmptyLine(this.lines[row])) {
        console.log(`Line ${row} is an empty line`);
        continue;
      }
      const rowData = this.#extractRowData(this.lines[row], row);
      console.log(`Success!`);
      this.rows.push(rowData);
    }
  }
}

const getFileInputData = async (filename='') => {
  if(!filename) {
    console.log("Enter input file path:");
    prompt.start();
    filename = await prompt.get("path");
    filename = filename.path;
  }
  try {
    if (!fs.existsSync(filename)) throw new Error("File not found");
    const data = fs.readFileSync(filename, "utf-8");
    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  TextParser,
  getFileInputData,
};

// async function main() {
//   try {
//     const input = await getFileInputData();
//     const parsedInput = new TextParser(input);
//     parsedInput.setHeadFromLine(0, ["Dy", "MxT", "MnT"]);
//     parsedInput.createRows();
//     console.log(parsedInput.rows);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// }

// main();
