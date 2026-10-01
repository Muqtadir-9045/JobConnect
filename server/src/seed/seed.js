require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Company, Job, Application } = require('../models');
const { ROLES, JOB_STATUS } = require('../utils/constants');
const base = require('./data');
const india = require('./indiaData');
const { DEMO_EMAIL_DOMAIN, candidates, applications } = base;
const companies = [...base.companies, ...india.companies];
const jobs = [...base.jobs, ...india.jobs];

const CLEAR_ONLY = process.argv.includes('--clear');
const DAY = 24 * 60 * 60 * 1000;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysFromNow = (n) => new Date(Date.now() + n * DAY);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emailFor = (name) =>
  `${name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '.')}@${DEMO_EMAIL_DOMAIN}`;

const parseMongoUri = (uri) => {
  const match = uri.match(/^(mongodb(?:\+srv)?):\/\/(?:[^@/]*@)?([^/?]+)(?:\/([^?]*))?/);
  if (!match) return null;
  return {
    srv: match[1] === 'mongodb+srv',
    hosts: match[2].split(',').map((h) => h.replace(/:\d+$/, '').toLowerCase()),
    db: decodeURIComponent(match[3] || ''),
  };
};

const assertSafeEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run: NODE_ENV is "production". This script is for development only.');
  }

  const target = parseMongoUri(process.env.MONGO_URI || '');
  if (!target) throw new Error('MONGO_URI is missing or not a valid MongoDB connection string.');
  if (!target.db) throw new Error('MONGO_URI must name a database explicitly (e.g. mongodb://127.0.0.1:27017/jobconnect).');
  if (/prod/i.test(target.db)) {
    throw new Error(`Refusing to run: database name "${target.db}" looks like production.`);
  }

  const isLocal = !target.srv && target.hosts.every((h) => LOCAL_HOSTS.has(h));
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
    throw new Error(
      `Refusing to run: MONGO_URI points at a non-local server (${target.hosts.join(', ')}). ` +
        'Set SEED_ALLOW_REMOTE=true only if you are certain this is a disposable development database.'
    );
  }
};

const readConfig = () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Demo Admin', SEED_DEMO_PASSWORD } = process.env;
  const missing = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SEED_DEMO_PASSWORD'].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')} (see .env.example).`);

  for (const [name, value] of [['ADMIN_PASSWORD', ADMIN_PASSWORD], ['SEED_DEMO_PASSWORD', SEED_DEMO_PASSWORD]]) {
    if (value.length < 8 || Buffer.byteLength(value) > 72) throw new Error(`${name} must be 8 to 72 characters.`);
  }
  const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
  if (adminEmail.endsWith(`@${DEMO_EMAIL_DOMAIN}`)) {
    throw new Error(`ADMIN_EMAIL must not use the demo domain (@${DEMO_EMAIL_DOMAIN}); demo accounts are deleted on every reseed.`);
  }
  return { adminEmail, adminPassword: ADMIN_PASSWORD, adminName: ADMIN_NAME, demoPassword: SEED_DEMO_PASSWORD };
};

const clearDemoData = async () => {
  const demoUsers = await User.find({ email: new RegExp(`@${escapeRegex(DEMO_EMAIL_DOMAIN)}$`, 'i') }).select('_id').lean();
  const userIds = demoUsers.map((u) => u._id);
  const jobIds = (await Job.find({ postedBy: { $in: userIds } }).select('_id').lean()).map((j) => j._id);

  const removed = {
    applications: (await Application.deleteMany({ $or: [{ candidate: { $in: userIds } }, { job: { $in: jobIds } }] })).deletedCount,
    jobs: (await Job.deleteMany({ _id: { $in: jobIds } })).deletedCount,
    companies: (await Company.deleteMany({ createdBy: { $in: userIds } })).deletedCount,
    users: (await User.deleteMany({ _id: { $in: userIds } })).deletedCount,
  };
  console.log(`Cleared demo data: ${JSON.stringify(removed)}`);
};

const ensureAdmin = async ({ adminEmail, adminPassword, adminName }) => {
  const existing = await User.findOne({ email: adminEmail }).select('role').lean();
  if (existing) {
    if (existing.role !== ROLES.ADMIN) throw new Error(`ADMIN_EMAIL (${adminEmail}) belongs to an existing non-admin account.`);
    console.log(`Admin ${adminEmail} already exists (left unchanged).`);
    return;
  }
  await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: ROLES.ADMIN });
  console.log(`Admin created: ${adminEmail}`);
};

const createDemoData = async ({ demoPassword }) => {
  const objectId = () => new mongoose.Types.ObjectId();
  const byKey = (list, label) => {
    const map = new Map();
    for (const item of list) {
      if (map.has(item.key)) throw new Error(`Duplicate ${label} key in seed data: ${item.key}`);
      map.set(item.key, item);
    }
    return map;
  };
  const need = (map, key, label) => {
    if (!map.has(key)) throw new Error(`Seed data refers to an unknown ${label}: "${key}"`);
    return map.get(key);
  };

  const companyIds = new Map(companies.map((c) => [c.key, objectId()]));
  const recruiterIds = new Map(companies.map((c) => [c.key, objectId()]));

  const recruiterDocs = companies.map((c) => ({
    _id: recruiterIds.get(c.key),
    name: c.recruiter.name,
    email: emailFor(c.recruiter.name),
    password: demoPassword,
    role: ROLES.RECRUITER,
    company: companyIds.get(c.key),
    location: c.recruiter.location,
    createdAt: daysAgo(c.createdDaysAgo + 5),
    updatedAt: daysAgo(c.createdDaysAgo + 5),
  }));

  const candidateMap = byKey(candidates, 'candidate');
  const candidateIds = new Map(candidates.map((c) => [c.key, objectId()]));
  const candidateDocs = candidates.map((c, i) => {
    const createdAt = daysAgo(120 - i * 3);
    const doc = {
      _id: candidateIds.get(c.key),
      name: c.name,
      email: emailFor(c.name),
      password: demoPassword,
      role: ROLES.CANDIDATE,
      createdAt,
      updatedAt: createdAt,
    };
    if (c.phone) {
      Object.assign(doc, {
        phone: c.phone,
        location: c.location,
        bio: c.bio,
        skills: c.skills,
        education: c.education,
        experience: c.experience.map((e) => ({
          ...e,
          startDate: new Date(e.startDate),
          ...(e.endDate && { endDate: new Date(e.endDate) }),
        })),
        resumeUrl: `https://resumes.${DEMO_EMAIL_DOMAIN}/${emailFor(c.name).split('@')[0]}.pdf`,
      });
    }
    return doc;
  });
  await User.create([...recruiterDocs, ...candidateDocs], { timestamps: false });

  await Company.create(
    companies.map((c) => ({
      _id: companyIds.get(c.key),
      name: c.name,
      description: c.description,
      industry: c.industry,
      website: c.website,
      location: c.location,
      logoUrl: c.logoUrl,
      createdBy: recruiterIds.get(c.key),
      createdAt: daysAgo(c.createdDaysAgo),
      updatedAt: daysAgo(c.createdDaysAgo),
    })),
    { timestamps: false }
  );

  const jobMap = byKey(jobs, 'job');
  const companyByKey = byKey(companies, 'company');
  const jobIds = new Map(jobs.map((j) => [j.key, objectId()]));
  const jobDocs = jobs.map((j, i) => {
    need(companyByKey, j.company, 'company');
    const createdAt = new Date(Date.now() - j.postedDaysAgo * DAY - ((i * 53) % 300) * 60000);
    const [min, max, currency] = j.salary;
    return {
      _id: jobIds.get(j.key),
      title: j.title,
      description: j.description,
      company: companyIds.get(j.company),
      postedBy: recruiterIds.get(j.company),
      location: j.location,
      jobType: j.jobType,
      skills: j.skills,
      experienceYears: j.experienceYears,
      salary: { min, max, currency },
      ...(j.deadlineDays !== undefined && { deadline: j.deadlineDays >= 0 ? daysFromNow(j.deadlineDays) : daysAgo(-j.deadlineDays) }),
      status: j.status || JOB_STATUS.OPEN,
      createdAt,
      updatedAt: createdAt,
    };
  });
  await Job.insertMany(jobDocs, { timestamps: false });

  const seenPairs = new Set();
  const applicationDocs = applications.map((a, i) => {
    const candidate = need(candidateMap, a.candidate, 'candidate');
    const job = need(jobMap, a.job, 'job');
    const company = need(companyByKey, job.company, 'company');
    const pair = `${a.candidate}:${a.job}`;
    if (seenPairs.has(pair)) throw new Error(`Duplicate application in seed data: ${pair}`);
    seenPairs.add(pair);
    if (!candidate.phone) throw new Error(`Candidate "${a.candidate}" has no resume but has an application.`);

    const appliedDaysAgo = Math.max(0, job.postedDaysAgo - (1 + (i % 4)));
    const createdAt = new Date(Date.now() - appliedDaysAgo * DAY - ((i * 37) % 600) * 60000);
    const updatedAt = a.status === 'pending' ? createdAt : new Date(Math.min(Date.now(), +createdAt + (1 + (i % 3)) * DAY));
    const doc = {
      job: jobIds.get(a.job),
      candidate: candidateIds.get(a.candidate),
      resumeUrl: `https://resumes.${DEMO_EMAIL_DOMAIN}/${emailFor(candidate.name).split('@')[0]}.pdf`,
      status: a.status,
      createdAt,
      updatedAt,
    };
    if (!a.plain) {
      doc.coverLetter = `Dear ${company.name} hiring team,\n\nI would like to be considered for the ${job.title} role. ${candidate.pitch}\n\nThank you for your time.\n${candidate.name}`;
    }
    return doc;
  });
  await Application.insertMany(applicationDocs, { timestamps: false });

  return { recruiterDocs, candidateDocs };
};

const printSummary = async ({ recruiterDocs, candidateDocs }) => {
  const group = async (Model, field) =>
    Object.fromEntries((await Model.aggregate([{ $group: { _id: `$${field}`, n: { $sum: 1 } } }])).map((g) => [g._id, g.n]));

  console.log('\nDemo data ready:');
  console.log(`  users        ${await User.countDocuments()}  ${JSON.stringify(await group(User, 'role'))}`);
  console.log(`  companies    ${await Company.countDocuments()}`);
  console.log(`  jobs         ${await Job.countDocuments()}  ${JSON.stringify(await group(Job, 'status'))}`);
  console.log(`  applications ${await Application.countDocuments()}  ${JSON.stringify(await group(Application, 'status'))}`);
  console.log('\nLogins (password: SEED_DEMO_PASSWORD from your .env)');
  console.log('  Recruiters:', recruiterDocs.map((r) => r.email).join(', '));
  console.log('  Candidates:', candidateDocs.map((c) => c.email).join(', '));
  console.log('  Admin:      ADMIN_EMAIL / ADMIN_PASSWORD from your .env');
};

const main = async () => {
  console.log('*** JobConnect DEMO seed - development use only ***');
  assertSafeEnvironment();
  const config = CLEAR_ONLY ? null : readConfig();

  await connectDB();
  await Promise.all([User, Company, Job, Application].map((m) => m.init()));

  if (CLEAR_ONLY) {
    await clearDemoData();
    return;
  }
  await ensureAdmin(config);
  await clearDemoData();
  await printSummary(await createDemoData(config));
};

main()
  .catch((err) => {
    console.error(`Seed aborted: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
