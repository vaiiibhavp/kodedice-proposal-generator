import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4 using the uuid package
 * This is more reliable than crypto.randomUUID() for browser compatibility
 */
export const generateUUID = (): string => {
  return uuidv4();
};
