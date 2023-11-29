import * as bcrypt from 'bcrypt';

export const encoderPassword = (password: string) => {
  const SALT = bcrypt.genSaltSync();
  return bcrypt.hash(password, SALT);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};
