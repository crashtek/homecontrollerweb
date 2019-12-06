import overview from '../guidance/overview';
import provisioning from '../guidance/provisioning';

const guidanceSections = [
  overview,
  provisioning
];

export class Guidance {
  constructor(discovery) {
    this.discovery = discovery;
  }

  getJSON() {
    return {
      goals: this.discovery.getGoals(),
      notes: this.discovery.getNotes(),
      guidance: this.getGuidance()
    };
  }

  getGuidance() {
    if (!this.guidance) {
      const questions = this.discovery.getQuestions();
      const guidance = [];
      guidanceSections.forEach((section) => {
        guidance.push({
          title: section.title,
          guidance: section.generate(questions)
        });
      });

      this.guidance = guidance;
    }
    return this.guidance;
  }

  dump() {
    const guidance = this.getGuidance();
    console.log(guidance);
  }
}

export default Guidance;

