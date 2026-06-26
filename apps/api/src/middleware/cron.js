/**
 * Guards scheduled endpoints. When CRON_SECRET is set in the environment,
 * requests must present it via the `x-cron-secret` header or `?secret=` query
 * param. When it's not set (e.g. local dev), the guard is a no-op so manual
 * triggering still works.
 */
export function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET
  if (!secret) return next()

  const provided = req.get('x-cron-secret') || req.query.secret
  if (provided === secret) return next()

  return res.status(401).json({ error: 'Unauthorized' })
}
