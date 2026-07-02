export const JWT_SECRET = process.env.JWT_SECRET || 'viras-dev-change-me';
export const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60 * 8);
