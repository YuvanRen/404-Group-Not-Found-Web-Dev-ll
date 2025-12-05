import express from 'express'
import { createUser, validateLogin, } from '../data/users.js'

const router = express.Router()

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ error: 'All fields must be provided' })
    }

    const newUser = await createUser({ name, email, password, userType})
    return res.json(newUser)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
})

// Login route
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password must be provided'})
    }

    const user = await validateLogin(email, password)
    req.session.user = {
      _id: user._id,
      name: user.name,
      userType: user.userType
    }
    return res.json(user)
  } catch (e) {
    return res.status(401).json({ error: e.message})
  }
})

// Logout route
router.post('/logout', authenticate, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    return res.json({ message: 'Successfully logged out' });
  });
});

export default router
