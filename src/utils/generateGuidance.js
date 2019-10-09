const dumpQuestion = (question) => {
  console.log(`${question.question}`);
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
};

export const generateGuidance = (discovery) => {
  const goals = discovery.getGoals();
  console.log("GOALS");
  goals.forEach(dumpQuestion);

  const ecosystemQs = discovery.getEcosystem();
  const answeredQuestions = [];
  const unansweredQuestions = [];
  ecosystemQs.forEach(question => {
    if (question.answer || question.notes) answeredQuestions.push(question);
    else unansweredQuestions.push(question);
  });

  console.log("ANSWERED QUESTION");
  answeredQuestions.forEach(dumpQuestion );

  console.log("UNANSWERED QUESTION");
  unansweredQuestions.forEach(dumpQuestion);
};


export default generateGuidance;
