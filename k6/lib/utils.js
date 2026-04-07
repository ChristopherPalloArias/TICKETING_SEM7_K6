/**
 * Lightweight generic helper functions.
 */

export const generateRandomString = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createRandomUser = () => {
  return {
    username: `user_${generateRandomString(6)}`,
    email: `${generateRandomString(8)}@example.com`,
  };
};
