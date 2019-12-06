import { sectionTitleToKey, isSpecialSection } from './sections';
const PARSING = 1;
const SKIPPING_SECTION = 2;

const PROPERTY = 'P';
const HEADING = 'H';
const QUESTION = 'Q';

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
    const sectionName = sectionTitleToKey[section];
    if (sectionName) {
      this.currentSection = sectionName;
      if (isSpecialSection(sectionName)) {
        this[this.currentSection] = [];
      } else {
        this.questions[this.currentSection] = [];
      }
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
      const sectionQuestions = (isSpecialSection(this.currentSection)) ? this[this.currentSection] : this.questions[this.currentSection];
      this.currentQuestion = {question};
      sectionQuestions.push(this.currentQuestion);
    }

    if (answer && (!checkbox || checkbox === 'TRUE')) {
      if (!this.currentQuestion.answer) this.currentQuestion.answer = [];
      this.currentQuestion.answer.push(answer);
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

    this.questions = {};
    this.goals = [];
    this.notes = [];
    this.properties = {};
    this.state = PARSING;

    const stateMap = {
      [PARSING]: this.parse.bind(this),
      [SKIPPING_SECTION]: this.skipSection.bind(this)
    };

    values.forEach(row => stateMap[this.state](row));
  }

  getGoals() { return this.goals; }
  getNotes() { return this.notes; }
  getQuestions() { return this.questions; }
  static dumpQuestion(question) {
    const noAnswer = question.answer ? '' : '[NOT ANSWERED] ';
    console.log(`${noAnswer}${question.question}`);
    if (question.answer) {
      console.log("ANSWER");
      question.answer.forEach(answer => {
        console.log(`\t${answer.split("\n").join("\n\t")}\n`);
      });
    }
    if (question.notes) {
      console.log("NOTES");
      question.notes.forEach(note => {
        console.log(`\t${note.split("\n").join("\n\t")}\n`);
      });
    }
  }

  dump() {
    const goals = this.getGoals();
    console.log("GOALS");
    goals.forEach(Discovery.dumpQuestion);

    const notes = this.getNotes();
    console.log("NOTES");
    notes.forEach(Discovery.dumpQuestion);

    const questions = this.getQuestions();
    Object.keys(questions).forEach((sectionName) => {
      console.log(`\n***********\nNEXT SECTION: ${sectionName}\n***********`);
      const section = questions[sectionName];
      const answeredQuestions = [];
      const unansweredQuestions = [];
      section.forEach(question => {
        if (question.answer) answeredQuestions.push(question);
        else unansweredQuestions.push(question);
      });

      answeredQuestions.forEach(Discovery.dumpQuestion);
      unansweredQuestions.forEach(Discovery.dumpQuestion);
    });
  }
}

export default Discovery;
