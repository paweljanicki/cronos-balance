import { Client, CronosEvm } from '@crypto.com/developer-platform-client';
import { config } from '../config';
import { ExternalAPIError } from './errors';

export const initializeCronosSDK = () => {
  try {
    Client.init({
      chain: CronosEvm.Mainnet,
      apiKey: config.cronos.apiKey,
    });
  } catch (error) {
    throw new ExternalAPIError('Failed to initialize Cronos SDK', 'INITIALIZATION_ERROR');
  }
};
