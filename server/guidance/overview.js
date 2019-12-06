import { SECTION as DISCOVERY_SECTION, QUESTIONS, getBooleanAnswer } from '../discovery/sections';

const addGuidanceForTypesOfProducts = (guidance, questions) => {
  const b2c = getBooleanAnswer(questions,
    DISCOVERY_SECTION.ECOSYSTEM,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.TEXT,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.ANSWERS.B2C
  );
  const b2b = getBooleanAnswer(questions,
    DISCOVERY_SECTION.ECOSYSTEM,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.TEXT,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.ANSWERS.B2B
  );

  if (b2c) {
    /* Found that they use B2C! */
    guidance.push({
      title: 'B2C Applications',
      text: `Since you have some B2C applications in your infrastructure, you will benefit from reviewing our [B2C Cookbook](https://auth0.com/docs/architecture-scenarios/b2c)`,
      // subsections: []
    });
  }

  if (b2b) {
    /* Found that they use B2B! */
    guidance.push({
      title: 'B2B Applications',
      text: `Since you have some B2B applications in your infrastructure, you will benefit from reviewing our [B2B Cookbook](https://auth0.com/docs/architecture-scenarios/b2b)`,
      // subsections: []
    });
  }
};

const generate = (questions) => {
  const guidance = [];

  addGuidanceForTypesOfProducts(guidance, questions);

  return guidance;
};

export default {
  title: 'Overview',
  generate
};
