import { postData } from './apicomponent';
import jwt from 'jsonwebtoken';
import { exec } from 'child_process';
import papi, { logger } from '@papi/backend';

logger.info('UserAuth is importing!');

interface UserAuthData {
  username: string;
  password: string;
  token: string;
}

class UserAuthManager {
  private authData: UserAuthData | null = null;

  constructor(private username: string, private password: string) {}

  async authenticate() {
    try {
      // Assuming postData() takes username and password and returns a JWT token
      const token = await postData(this.username, this.password);
      this.authData = {
        username: this.username,
        password: this.password,
        token,
      };
      // Send data to main.ts for storage using papi.storage
      await papi.storage.writeUserData(
        { username: this.username },
        JSON.stringify(this.authData)
      );
      return token;
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }

  getToken() {
    return this.authData?.token;
  }
}

const runMainScript = () => {
  console.log('Executing script...');
  exec('npx tsx apicomponent.tsx', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stdout) console.log(`Output: ${stdout}`);
    if (stderr) console.error(`Error: ${stderr}`);
  });
};

export const decodeAndSchedule = async (username: string, password: string) => {
  try {
    const authManager = new UserAuthManager(username, password);
    const token = await authManager.authenticate();
    const decoded: any = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      const expirationTimeMs = decoded.exp * 1000; // Convert seconds to milliseconds
      const currentTimeMs = Date.now();
      const delayMs = expirationTimeMs - currentTimeMs;
      const delayMinutes = delayMs / 60000; // Convert milliseconds to minutes
      const reducedDelayMs = delayMs - 300000; // Reduce delay by 5 minutes (300000 milliseconds)
      const reducedDelayMinutes = reducedDelayMs / 60000; // Convert reduced milliseconds to minutes

      console.log(`Original scheduling time: ${delayMs} milliseconds (${delayMinutes} minutes).`);
      console.log(`Adjusted scheduling time: ${reducedDelayMs} milliseconds (${reducedDelayMinutes} minutes).`);

      setTimeout(runMainScript, reducedDelayMs);
    } else {
      console.error('Expiration time not found in token');
    }
  } catch (error) {
    console.error(`Error retrieving or decoding token: ${error.message}`);
  }
};
