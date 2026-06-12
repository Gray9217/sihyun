const jwt = require('jsonwebtoken')

function getJwtSecret() {
  return process.env.JWT_SECRET || 'ssam_dev_jwt_secret_change_me'
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), username: user.username, role: user.role || 'user' },
    getJwtSecret(),
    { expiresIn: '7d' }
  )
}

function parseToken(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, getJwtSecret())
    return { id: payload.userId, username: payload.username, role: payload.role || 'user' }
  } catch {
    return null
  }
}

function optionalAuth(req, res, next) {
  req.user = parseToken(req)
  next()
}

function requireAuth(req, res, next) {
  const user = parseToken(req)
  if (!user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' })
  }
  req.user = user
  next()
}

module.exports = { signToken, requireAuth, optionalAuth }
