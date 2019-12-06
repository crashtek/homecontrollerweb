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
  const b2c = getBooleanAnswer(questions,
    DISCOVERY_SECTION.ECOSYSTEM,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.TEXT,
    DISCOVERY_SECTION.ECOSYSTEM.QUESTIONS.TYPES_OF_PRODUCTS.ANSWERS.B2C
  );

  const cookbook = b2c ? 'b2c' : 'b2b';

  /*
   We need a question that can answer whether or not SSO is required

  const sso = getBooleanAnswer(questions,
    DISCOVERY_SECTION.USER_DATA,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SOCIAL_LOGIN.TEXT,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SOCIAL_LOGIN.ANSWERS.YES
  );

   */

  const social = getBooleanAnswer(questions,
    DISCOVERY_SECTION.USER_DATA,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SOCIAL_LOGIN.TEXT,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SOCIAL_LOGIN.ANSWERS.YES
  );

  if (social) {
    guidance.push({
      title: 'Social Signup',
      text: `You have an interest in social signup.  Take a look at our [Social Signup documentation](https://auth0.com/docs/architecture-scenarios/implementation/${cookbook}/${cookbook}-provisioning#social-sign-up).`,
      // subsections: []
    });
  }

  const selfSignup = getBooleanAnswer(questions,
    DISCOVERY_SECTION.USER_DATA,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SELF_SIGNUP.TEXT,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.SELF_SIGNUP.ANSWERS.YES
  );

  if (selfSignup) {
    guidance.push({
      title: 'Self Signup',
      text: `Since your users will be able to create their own accounts, take a look at our [Self Signup documentation](https://auth0.com/docs/architecture-scenarios/implementation/${cookbook}/${cookbook}-provisioning#self-sign-up).`,
      // subsections: []
    });
  }

  const migrateUsers = getBooleanAnswer(questions,
    DISCOVERY_SECTION.USER_DATA,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.USER_MIGRATION.TEXT,
    DISCOVERY_SECTION.USER_DATA.QUESTIONS.USER_MIGRATION.ANSWERS.YES
  );

  if (migrateUsers) {
    guidance.push({
      title: 'User Migration',
      text: `There are a couple of approaches you can use to migrate your users into Auth0.  See our [User Migration documentation](https://auth0.com/docs/architecture-scenarios/implementation/${cookbook}/${cookbook}-provisioning#user-migration) to learn more.`,
      // subsections: []
    });
  }

  const unamePasswordSignInToday = getBooleanAnswer(questions,
    DISCOVERY_SECTION.USER_AUTHN_LOGIN,
    DISCOVERY_SECTION.USER_AUTHN_LOGIN.QUESTIONS.SIGN_IN_TODAY.TEXT,
    DISCOVERY_SECTION.USER_AUTHN_LOGIN.QUESTIONS.SIGN_IN_TODAY.ANSWERS.USERNAME_AND_PASSWORD
  );

  if (!migrateUsers && unamePasswordSignInToday) {
    guidance.push({
      title: 'Using your Own Database',
      text: `Since you have existing users, but you don't want to migrate them to Auth0, you will need to setup a Custom Database, see our [Identity store proxy documentation](https://auth0.com/docs/architecture-scenarios/implementation/${cookbook}/${cookbook}-provisioning#identity-store-proxy) to learn more.`,
      // subsections: []
    });
  }

  return guidance;
};

export default {
title: 'Provisioning',
generate
};
