export default {
  KEY: 'ecosystem',
  TITLE: 'Application Ecosystem',
  QUESTIONS: {
    TYPES_OF_PRODUCTS: {
      TEXT: /^What types of products do you offer that require integration with Auth0/,
      ANSWERS: {
        B2C: /^B2C: Business-to-consumer/,
        B2B: /^B2B: Business-to-business/,
        B2E: /^B2E: Business-to-employee/
      }
    },
    TYPES_OF_APPLICATION: {
      TEXT: /^What types of products do you offer that require integration with Auth0/,
      ANSWERS: {
        REGULAR_WEB_APPS: /^Regular web applications/,
        SINGLE_PAGE_APPS: /^Single-page web applications/,
        ANDROID: /^Android mobile applications/,
        IOS: /^iOS mobile applications/,
        WINDOWS: /^Windows applications/,
        MAC: /^MacOS applications/,
        M2M: /^Machine-to-machine client/,
        OTHER: /^Other, specify/
      }
    },
    EMBEDDED_DEVICE: {
      TEXT: /^Have you built devices with embedded code that require Auth0 integration/,
      ANSWERS: {
        YES: /^Yes/,
        NO: /^No/
      }
    }
  }
}
