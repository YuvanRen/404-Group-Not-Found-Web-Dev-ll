import { isOpen, connect, ping, set, sAdd, get } from '../config/redisConnection';
import { randomUUID, createHash } from 'crypto';

/**
 * Create a new user
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password (will be hashed)
 * @param {string} userData.name - User name
 * @param {string} userData.userType - 'employer' or 'jobseeker'
 * @returns {Promise<Object>} Created user object
 */
async function createUser(userData) {
  try {
    const { email, password, name, userType } = userData;
    
    // Validate required fields
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }
    
    // Ensure Redis connection
    if (!isOpen) {
      console.log('Redis not open, connecting...');
      await connect();
    }
    
    // Test Redis connection
    await ping();
    
    // Generate unique user ID
    const userId = `user:${randomUUID()}`;
    
    // Hash password (simple hash for now, should use bcrypt in production)
    const passwordHash = createHash('sha256').update(password).digest('hex');
    
    const user = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      userType: userType || 'jobseeker',
      createdAt: new Date().toISOString(),
    };
    
    // Store user data in Redis
    const setResult = await set(userId, JSON.stringify(user));
    if (setResult !== 'OK') {
      throw new Error('Failed to store user data in Redis');
    }
    
    // Also store email -> userId mapping for quick lookups
    await set(`email:${user.email}`, userId);
    
    // Add to users set for easy listing
    await sAdd('users:all', userId);
    
    console.log('User created successfully:', userId);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserById(userId) {
  try {
    // Check Redis connection
    if (!isOpen) {
      await connect();
    }
    
    const userData = await get(userId);
    
    if (!userData) {
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByEmail(email) {
  try {
    // Check Redis connection
    if (!isOpen) {
      await connect();
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const userId = await get(`email:${normalizedEmail}`);
    
    if (!userId) {
      return null;
    }
    
    return getUserById(userId);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
}

/**
 * Validate login credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object if valid, null otherwise
 */
async function validateLogin(email, password) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // Hash provided password and compare
  const passwordHash = createHash('sha256').update(password).digest('hex');
  
  if (user.passwordHash !== passwordHash) {
    return null;
  }
  
  // Return user without password hash
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.passwordHash;
  return userWithoutPassword;
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  validateLogin
};
