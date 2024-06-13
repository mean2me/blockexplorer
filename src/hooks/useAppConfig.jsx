import { Network } from 'alchemy-sdk'

export default function useAppConfig() {
  return {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  }
}
