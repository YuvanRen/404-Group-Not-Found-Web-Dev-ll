import { ObjectId } from "mongodb";
import { jobs as jobsCollection } from "../config/mongoCollections.js";

export async function createJob(data) {
  const jobs = await jobsCollection();

  const job = {
    employerId: new ObjectId(data.employerId),
    title: data.title,
    description: data.description,
    field: data.field,
    skills: data.skills || [],
    type: data.type || "full-time",
    location: data.location || "",
    active: true,
    createdAt: new Date().toISOString()
  };

  const result = await jobs.insertOne(job);

  return {
    id: result.insertedId.toString(),
    employerId: job.employerId.toString(),
    ...job
  };
}

export async function getJobById(id) {
  const jobs = await jobsCollection();
  const job = await jobs.findOne({ _id: new ObjectId(id) });
  if (!job) return null;

  return {
    id: job._id.toString(),
    employerId: job.employerId.toString(),
    title: job.title,
    description: job.description,
    field: job.field,
    skills: job.skills,
    type: job.type,
    location: job.location,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    active: job.active
  };
}

export async function getJobs(filters = {}) {
  const jobs = await jobsCollection();
  const query = {};

  if (filters.type) query.type = filters.type;
  if (filters.field) query.field = filters.field;
  if (filters.employerId) query.employerId = new ObjectId(filters.employerId);
  if (filters.active !== undefined) query.active = filters.active;
  if (filters.location) query.location = { $regex: filters.location, $options: "i" };
  if (filters.skills && filters.skills.length > 0) query.skills = { $all: filters.skills };

  if (filters.searchTerm) {
    const regex = new RegExp(filters.searchTerm, "i");
    query.$or = [{ title: regex }, { description: regex }];
  }

  const result = await jobs.find(query).sort({ createdAt: -1 }).toArray();

  return result.map(job => ({
    id: job._id.toString(),
    employerId: job.employerId.toString(),
    title: job.title,
    description: job.description,
    field: job.field,
    skills: job.skills,
    type: job.type,
    location: job.location,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    active: job.active
  }));
}

export async function updateJob(id, data) {
  const jobs = await jobsCollection();

  const update = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (update.employerId) update.employerId = new ObjectId(update.employerId);

  const result = await jobs.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );

  const job = result.value;
  if (!job) throw new Error("Job not found");

  return {
    id: job._id.toString(),
    employerId: job.employerId.toString(),
    title: job.title,
    description: job.description,
    field: job.field,
    skills: job.skills,
    type: job.type,
    location: job.location,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    active: job.active
  };
}

export async function deleteJob(id) {
  const jobs = await jobsCollection();
  const result = await jobs.findOneAndDelete({ _id: new ObjectId(id) });
  const job = result.value;
  if (!job) throw new Error("Job not found");

  return {
    id: job._id.toString(),
    employerId: job.employerId.toString(),
    title: job.title,
    description: job.description,
    field: job.field,
    skills: job.skills,
    type: job.type,
    location: job.location,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    active: job.active
  };
}
