export default {
  KEY: 'userdata',
  TITLE: 'User Data',
  QUESTIONS: {
    SOCIAL_LOGIN: {
      TEXT: /^Do you plan to support user logins from external social identity providers/,
      ANSWERS: {
        YES: /^Yes/,
        NO: /^No/
      }
    },
    SELF_SIGNUP: {
      TEXT: /^Are users able to create their own accounts/,
      ANSWERS: {
        YES: /^Yes/,
        NO: /^No/
      }
    },
    USER_MIGRATION: {
      TEXT: /^Do you intend to migrate existing user accounts and profile information to Auth0/,
      ANSWERS: {
        YES: /^Yes/,
        NO: /^No/
      }
    }
  }
};
