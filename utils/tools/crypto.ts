import { createHash } from 'crypto';

export const md5Hash = (name: string) => {
  const md5 = createHash('md5');
  return md5.update(name).digest('hex');
}