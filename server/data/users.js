import crypto from "crypto";
import { ObjectId } from "mongodb";
import { users as usersCollection } from "../config/mongoCollections.js";

export async function createUser(data) {
  const { email, password, name, userType } = data;

  const users = await usersCollection();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) throw new Error("User with this email already exists");

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  const user = {
    email: normalizedEmail,
    passwordHash,
    name: name.trim(),
    userType,
    createdAt: new Date().toISOString()
  };

  const result = await users.insertOne(user);

  return {
    id: result.insertedId.toString(),
    ...user
  };
}

export async function getUserById(id) {
  const users = await usersCollection();
  const user = await users.findOne({ _id: new ObjectId(id) });
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    userType: user.userType,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash
  };
}

export async function getUserByEmail(email) {
  const users = await usersCollection();
  const user = await users.findOne({ email: email.trim().toLowerCase() });
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    userType: user.userType,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash
  };
}

export async function validateLogin(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== user.passwordHash) return null;

  const { passwordHash, ...result } = user;
  return result;
}
