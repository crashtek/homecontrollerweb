import _ from 'lodash';

import apis from './apis';
import devices from './devices';
import ecosystem from './ecosystem';
import goals from './goals';
import mfa from './mfa';
import notes from './notes';
import orgs from './orgs';
import regulatory from './regulatory';
import thirdParty from './thirdparty';
import userAdmin from './useradmin';
import userAuthn from './userauthn';
import userData from './userdata';

export const SECTION = {
  APIS_AUTHZ: apis,
  DEVICES: devices,
  ECOSYSTEM: ecosystem,
  GOALS: goals,
  MFA: mfa,
  NOTES: notes,
  ORGS: orgs,
  REGULATORY: regulatory,
  THIRD_PARTY: thirdParty,
  USER_ADMIN: userAdmin,
  USER_AUTHN_LOGIN: userAuthn,
  USER_DATA: userData
};

export const getBooleanAnswer = (questions, section, questionRegex, answerRegex) => {
  const ecosystem = questions[section.KEY];
  const question = ecosystem.find(question => question.question.match(questionRegex));
  return question && question.answer && !!question.answer.find(answer => answer.match(answerRegex));
};

export const isSpecialSection = (section) => ([SECTION.GOALS.KEY, SECTION.NOTES.KEY].indexOf(section) >= 0);

export const sectionTitleToKey = (() => {
  const mapping = {};
  Object.keys(SECTION).forEach(key =>
  {
    const section = SECTION[key];
    mapping[section.TITLE] = section.KEY
  });
  return mapping;
})();

export const sectionKeyToTitle = _.invert(sectionTitleToKey);
