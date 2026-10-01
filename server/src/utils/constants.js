const ROLES = Object.freeze({
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
});

const JOB_TYPES = Object.freeze({
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
});

const JOB_STATUS = Object.freeze({
  OPEN: 'open',
  CLOSED: 'closed',
});

const APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

const { PENDING, REVIEWED, SHORTLISTED, INTERVIEW, HIRED, REJECTED } = APPLICATION_STATUS;
const APPLICATION_TRANSITIONS = Object.freeze({
  [PENDING]: [REVIEWED, SHORTLISTED, INTERVIEW, REJECTED],
  [REVIEWED]: [SHORTLISTED, INTERVIEW, REJECTED],
  [SHORTLISTED]: [INTERVIEW, HIRED, REJECTED],
  [INTERVIEW]: [HIRED, REJECTED],
});

const ACTIVE_APPLICATION_STATUSES = Object.freeze(Object.keys(APPLICATION_TRANSITIONS));

const RECRUITER_APPLICATION_STATUSES = Object.freeze([...new Set(Object.values(APPLICATION_TRANSITIONS).flat())]);

module.exports = {
  ROLES,
  JOB_TYPES,
  JOB_STATUS,
  APPLICATION_STATUS,
  APPLICATION_TRANSITIONS,
  ACTIVE_APPLICATION_STATUSES,
  RECRUITER_APPLICATION_STATUSES,
};
