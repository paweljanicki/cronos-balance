import { Client, CronosEvm, Token } from '@crypto.com/developer-platform-client';

Client.init({
  chain: CronosEvm.Mainnet,
  apiKey: process.env.CRONOS_EXPLORER_API_KEY || '',
});

export const getCronosBalance = async (address: string) => {
  const nativeBalance = await Token.getNativeTokenBalance(address);
  console.log(nativeBalance);
  return nativeBalance;
};

export const getCrc20Balance = async ({
  walletAddress,
  tokenAddress,
}: {
  walletAddress: string;
  tokenAddress: string;
}) => {
  const erc20Balance = await Token.getERC20TokenBalance(walletAddress, tokenAddress);
  console.log(erc20Balance);
  return erc20Balance;
};

// 0xA897312A1882dBb79827dB2C5E0abAb438f38C6F 0x66e428c3f67a68878562e79a0234c1f83c208770
