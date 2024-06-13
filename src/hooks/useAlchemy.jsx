import { Alchemy } from 'alchemy-sdk'
import useAppConfig from './useAppConfig'

export default function useAlchemy() {
  const settings = useAppConfig()
  return new Alchemy(settings)
}
