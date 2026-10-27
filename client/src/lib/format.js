export const money = (value) =>
    '₹' + Number(value || 0).toLocaleString('en-IN');

export const err = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong. Please try again.';

export const split = (value) =>
    String(value || '').split(',').map((skill) => skill.trim()).filter(Boolean);
