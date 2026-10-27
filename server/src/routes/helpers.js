export const wrap = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const text = (value, min = 1, max = 4000) =>
    typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

export const positive = (value) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

export const dateOk = (value) =>
    value && Number.isFinite(new Date(value).getTime()) && new Date(value) > new Date();

export const pageOpts = (query) => ({
    skip: (Math.min(100, Math.max(1, Number(query.page) || 1)) - 1) * 12,
    limit: 12,
});

export const userPublic = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    bio: user.bio,
    portfolio: user.portfolio || '',
});
