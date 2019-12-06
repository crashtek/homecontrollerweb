export default {
  KEY: 'userauthn',
  TITLE: 'User Authentication and Login Experience',
  QUESTIONS: {
    SIGN_IN_TODAY: {
      TEXT: /^How do user sign into you applications today/,
      ANSWERS: {
        USERNAME_AND_PASSWORD: /^Username and password/,
        ENTERPRISE: /^Sign in from external enterprise identity provider/,
        SOCIAL: /^Sign in from external social identity provider/,
        OTHER: /^OTHER ==/
      }
    }
  }
};
