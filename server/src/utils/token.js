import jwt from 'jsonwebtoken';

export function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'staffsync_fallback_secret', {
    expiresIn: '30d',
  });
}
