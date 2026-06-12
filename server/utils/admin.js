function getAdminEmails() {
  const raw = process.env.ADMIN_EMAIL || ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function isAdminEmail(email) {
  if (!email) return false
  return getAdminEmails().includes(String(email).trim().toLowerCase())
}

function resolveRole(email) {
  return isAdminEmail(email) ? 'admin' : 'user'
}

async function syncUserRole(user) {
  if (!user) return user
  const nextRole = resolveRole(user.email)
  if (user.role !== nextRole) {
    user.role = nextRole
    await user.save()
  }
  return user
}

module.exports = { getAdminEmails, isAdminEmail, resolveRole, syncUserRole }
