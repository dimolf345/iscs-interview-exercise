const fs = require("fs");
const prompt = require("prompt");

class TextParser {
  //TextParser create a table with columns(this.heads) and rows
  //from a text file, using RegExp
  constructor(rawText) {
    console.log("Parsing text input...");
    this.lines = this.#parseLines(rawText);
    this.heads = [];
    this.headLineNr = 0;
    this.rows = [];
    console.log(`Found ${this.lines.length} lines`);
  }

  //splits rawText in lines by finding newlines (\n)
  #parseLines(textString) {
    if (typeof textString !== "string") {
      throw new Error("Text parser accepts only strings as a variable");
    }
    let lines = textString.split("\n");
    console.log(lines);
    return lines;
  }

// #findHeadByKey searches for a specified key to use as a column. the key is
 //searched as a word between space boundaries. functions returns
 //the column name in the key property and the index of the first
 //letter of the keySearch variable
  #findHeadByKey(lineText, keySearch) {
    let regex = new RegExp(`(?<=\\s|^)${keySearch}(?=\\s|$)`);
    const match = lineText.match(regex);
    if (!match) throw new Error(`${keySearch} is not found in ${lineText}`);
    return {
      key: match[0],
      startsAt: match.index,
    };
  }

  //finds all the non space characters to use as column (heads). Used imperative
  //approach for better performances. when the startK index finds non space
  //chars the endK index finds the last letter of the word or the end of the
  //lineText
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

//extractRowData creates an object for each linetext.
//it searches for any non space chars looking immediately "below" the char
// indexes of each column in this.heads
  #extractRowData(lineText, lineNum) {
    let regex = new RegExp("\\S+(?=\\s|$)", "g");
    let result = {
      line: lineNum,
      data: {},
    };
    for (let i = 0; i < this.heads.length; i++) {
      //endsAt is set as the startsAt index of the next column or as the
      //startsAt index plus the length of the column_key
      let endsAt =
        i < this.heads.length - 1
          ? this.heads[i + 1].startsAt -1
          : this.heads[i].startsAt + this.heads[i].key.length;
      //parsed field is the substring immediately below the name of the column
      //in the rawText
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

//setHeadFromLine reads the lineNum of the parsed text to find column keys.
//if selected is not specified, it finds all the key with this.#findAllHead,
//otherwise it will use this.#findHeadByKey
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


//getFileInputData opens a text file if specified, otherwise it will aks
//input for file path. returns the text file as a string
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
