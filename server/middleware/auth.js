export const authenticate = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to perform this action' })
  }

  req.user = {
    id: req.session.user.id,
    name: req.session.user.name,
    userType: req.session.user.userType
  }

  next()
}
