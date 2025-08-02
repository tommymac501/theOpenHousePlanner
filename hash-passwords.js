// Temporary script to hash passwords properly for existing users
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const tomPassword = await hashPassword('D@leJr88');
  const jennaPassword = await hashPassword('Hulu25');
  
  console.log(`Tom's hashed password: ${tomPassword}`);
  console.log(`Jenna's hashed password: ${jennaPassword}`);
  
  console.log(`UPDATE users SET password = '${tomPassword}' WHERE name = 'Tom McCarthy';`);
  console.log(`UPDATE users SET password = '${jennaPassword}' WHERE name = 'Jenna McCarthy';`);
}

main().catch(console.error);