// TODO: Implement job data layer functions
// This module should handle all job-related database operations using Redis
//
// Required functions:
// 1. createJob(jobData) - Create a new job posting
//    - Input: { employerId, title, description, field, skills, type, location }
//    - Should generate unique job ID (e.g., "job:uuid")
//    - Store job data in Redis
//    - Add to jobs sets for filtering (by type, field, employer)
//    - Return the created job object
//
// 2. getJobs(filters) - Retrieve jobs with optional filters
//    - Input: { type, field, employerId } (all optional)
//    - Should query Redis sets based on filters
//    - Return array of job objects
//    - Sort by creation date (newest first)
//
// 3. getJobById(jobId) - Get a single job by ID
//    - Input: jobId (string)
//    - Return job object or null if not found
//
// Redis structure suggestions:
// - Store jobs: redis.set("job:uuid", JSON.stringify(job))
// - Jobs list: redis.sAdd("jobs:all", "job:uuid")
// - By type: redis.sAdd("jobs:type:full-time", "job:uuid")
// - By field: redis.sAdd("jobs:field:Software", "job:uuid")
// - By employer: redis.sAdd("employer:user:uuid:jobs", "job:uuid")
//
// Example job object structure:
// {
//   id: "job:uuid",
//   employerId: "user:uuid",
//   title: "Software Engineer",
//   description: "Job description...",
//   field: "Software",
//   skills: ["JavaScript", "React"],
//   type: "full-time",
//   location: "New York, NY",
//   createdAt: "2024-01-01T00:00:00.000Z",
//   active: true
// }

const redisClient = require('../config/redisConnection');
const { v4: uuidv4 } = require('uuid');

async function createJob(jobData) {
  const jobId = `job:${uuidv4()}`;

  const job = {
    id: jobId,
    employerId: jobData.employerId,
    title: jobData.title,
    description: jobData.description,
    field: jobData.field,
    skills: jobData.skills,
    type: jobData.type,
    location: jobData.location,
    createdAt: new Date().toISOString(),
    active: true
  };

  await redisClient.set(jobId, JSON.stringify(job));

  await redisClient.sAdd('jobs:all', jobId);
  await redisClient.sAdd(`jobs:type:${job.type}`, jobId);
  await redisClient.sAdd(`jobs:field:${job.field}`, jobId);
  await redisClient.sAdd(`employer:${job.employerId}:jobs`, jobId);

  return job;
}

async function getJobs(filters = {}) {
  const {
    type,
    field,
    employerId,
    skills,
    location,
    active,
    searchTerm
  } = filters;

  let jobIds;

  if (employerId) {
    jobIds = await redisClient.sMembers(`employer:${employerId}:jobs`);
  } else if (type && field) {
    jobIds = await redisClient.sInter([
      `jobs:type:${type}`,
      `jobs:field:${field}`
    ]);
  } else if (type) {
    jobIds = await redisClient.sMembers(`jobs:type:${type}`);
  } else if (field) {
    jobIds = await redisClient.sMembers(`jobs:field:${field}`);
  } else {
    jobIds = await redisClient.sMembers('jobs:all');
  }

  if (!jobIds || jobIds.length === 0) {
    return [];
  }

  const jobs = [];
  for (const jobId of jobIds) {
    const jobJson = await redisClient.get(jobId);
    if (jobJson) {
      const job = JSON.parse(jobJson);
      let shouldUse = true;
      if (active !== undefined && job.active !== active) {
        shouldUse = false;
      }

      if (skills && skills.length > 0) {
        const matchesRequiredSkills = skills.every(skill =>
          job.skills.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!matchesRequiredSkills) {
          shouldUse = false;
        }
      }

      if (location && job.location) {
        if (!job.location.toLowerCase().includes(location.toLowerCase())) {
          shouldUse = false;
        }
      }

      if (searchTerm) {
        const sTerm = searchTerm.toLowerCase();
        const foundInTitle = job.title.toLowerCase().includes(sTerm);
        const foundInDescription = job.description.toLowerCase().includes(sTerm);
        if (!foundInTitle && !foundInDescription) {
          shouldUse = false;
        }
      }

      if (shouldUse) {
        jobs.push(job);
      }
    }
  }
  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return jobs;
}

async function getJobById(jobId) {
  const jobs = await redisClient.get(jobId);

  if (!jobs) {
    return null;
  }

  return JSON.parse(jobs);
}

async function updateJob(jobId, updateData) {
  const existingJob = await getJobById(jobId);
  
  if (!existingJob) {
    throw new Error('Job not found');
  }
  
  const didTypeChange = updateData.type && updateData.type !== existingJob.type;
  const didFieldChange = updateData.field && updateData.field !== existingJob.field;
  
  if (didTypeChange) {
    await redisClient.sRem(`jobs:type:${existingJob.type}`, jobId);
    await redisClient.sAdd(`jobs:type:${updateData.type}`, jobId);
  }
  
  if (didFieldChange) {
    await redisClient.sRem(`jobs:field:${existingJob.field}`, jobId);
    await redisClient.sAdd(`jobs:field:${updateData.field}`, jobId);
  }
  
  const updatedJob = {
    ...existingJob,
    ...updateData,
    id: jobId,
    employerId: existingJob.employerId,
    createdAt: existingJob.createdAt,
    updatedAt: new Date().toISOString()
  };
  await redisClient.set(jobId, JSON.stringify(updatedJob));
  
  return updatedJob;
}

async function deleteJob(jobId) {
  const job = await getJobById(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  await redisClient.sRem('jobs:all', jobId);
  await redisClient.sRem(`jobs:type:${job.type}`, jobId);
  await redisClient.sRem(`jobs:field:${job.field}`, jobId);
  await redisClient.sRem(`employer:${job.employerId}:jobs`, jobId);
  
  await redisClient.del(jobId);
  
  return job;
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};
