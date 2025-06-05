import { Client, CronosEvm } from '@crypto.com/developer-platform-client';
import { config } from '../config';

export const initializeCronosSDK = () => {
  Client.init({
    chain: CronosEvm.Mainnet,
    apiKey: config.cronos.apiKey,
  });
};
