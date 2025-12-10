import * as userData from "../data/users.js";
import * as jobData from "../data/jobs.js";
import crypto from "crypto";

// Simple token generation
function generateToken(userId) {
  return crypto.randomBytes(32).toString("hex");
}

const resolvers = {
  getUser: async ({ id }) => {
    return await userData.getUserById(id);
  },

  getJobs: async ({ filters }) => {
    return await jobData.getJobs(filters || {});
  },

  getJob: async ({ id }) => {
    return await jobData.getJobById(id);
  },

  signup: async ({ input }) => {
    console.log("Input received:", JSON.stringify(input, null, 2));

    try {
      if (!input || !input.email || !input.password || !input.name || !input.userType) {
        console.error("Validation failed: missing required fields");
        throw new Error("All fields are required");
      }

      console.log("Checking for existing user with email:", input.email);
      const existingUser = await userData.getUserByEmail(input.email);
      if (existingUser) {
        console.log("User already exists");
        throw new Error("User with this email already exists");
      }

      console.log("Creating new user...");
      const user = await userData.createUser(input);

      if (!user || !user.id) {
        console.error("User creation failed - invalid user object:", user);
        throw new Error("Failed to create user. Please try again.");
      }

      console.log("User created successfully with ID:", user.id);

      const token = generateToken(user.id);
      console.log("Token generated");

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.passwordHash;

      const result = {
        user: userWithoutPassword,
        token,
      };

      console.log("Signup successful, returning result:", JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  },

  login: async ({ input }) => {
    const user = await userData.validateLogin(input.email, input.password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user.id);

    return {
      user,
      token,
    };
  },

  createJob: async ({ input }) => {
    const employer = await userData.getUserById(input.employerId);
    if (!employer) {
      throw new Error("Employer not found");
    }

    if (employer.userType !== "employer") {
      throw new Error("User is not an employer");
    }

    const job = await jobData.createJob(input);
    return job;
  },

  updateJob: async ({ id, input }) => {
    const existingJob = await jobData.getJobById(id);
    if (!existingJob) {
      throw new Error("Job not found");
    }
    return await jobData.updateJob(id, input);
  },

  deleteJob: async ({ id }) => {
    const existingJob = await jobData.getJobById(id);
    if (!existingJob) {
      throw new Error("Job not found");
    }
    return await jobData.deleteJob(id);
  },
};

export default resolvers;