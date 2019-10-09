const PARSING = 1;
const SKIPPING_SECTION = 2;

const PROPERTY = 'P';
const HEADING = 'H';
const QUESTION = 'Q';

const sections = {
  'Project Goals': 'goals',
  'Application Ecosystem': 'ecosystem'
};

export class Discovery {
  parseProperty(row) {
    const propertyMap = {
      'Date:': 'date',
      'Customer:': 'customer',
      'Auth0 Representative': 'rep'
    };

    if (propertyMap[row[1]]) {
      this.properties[propertyMap[row[1]]] = row[2];
    }
  }

  parseHeading(row) {
    const section = row[1];
    const sectionName = sections[section];
    if (sectionName) {
      this.currentSection = sectionName;
      this[this.currentSection] = [];
      this.state = PARSING;
    } else {
      console.warn(`Skipping unknown header: ${section}`);
      this.state = SKIPPING_SECTION;
    }
  }

  parseAnswer(row) {
    return row.slice(2,row.length-1);
  }

  parseQuestion(row) {
    const question = row[1];
    const answer = row[3] || row[2];
    const checkbox = row[3] ? row[2] : undefined;
    const notes = row[4];

    if (question) {
      // If we have a question here, put all default values in for this question
      const sectionQuestions = this[this.currentSection];
      this.currentQuestion = {question};
      sectionQuestions.push(this.currentQuestion);
    }

    if (answer && (!checkbox || checkbox === 'TRUE')) {
      if (!this.currentQuestion.answer) this.currentQuestion.answer = [];
      this.currentQuestion.answer.push(answer);
    } else {
      console.log ('Carlos, checkbox and answer: ', answer, checkbox);
    }

    if (notes) {
      if (!this.currentQuestion.notes) this.currentQuestion.notes = [];
      this.currentQuestion.notes.push(notes);
    }
  }

  parse(row) {
    if (this.parserMap[row[0]]) this.parserMap[row[0]](row);
  }

  skipSection(row) {
    if (row[0] === HEADING) this.parserMap[HEADING](row);
  }

  constructor(sheet) {
    const values = sheet.range.values;
    console.log(sheet);

    this.parserMap = {
      [PROPERTY]: this.parseProperty.bind(this),
      [HEADING]: this.parseHeading.bind(this),
      [QUESTION]: this.parseQuestion.bind(this)
    };

    this.properties = {};
    this.state = PARSING;

    const stateMap = {
      [PARSING]: this.parse.bind(this),
      [SKIPPING_SECTION]: this.skipSection.bind(this)
    };

    values.forEach(row => stateMap[this.state](row));
  }

  getGoals() { return this.goals; }
  getEcosystem() { return this.ecosystem; }
}

export default Discovery;
