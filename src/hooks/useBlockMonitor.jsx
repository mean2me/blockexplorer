import { useState } from 'react'
import useAlchemy from './useAlchemy'
import useAppConfig from './useAppConfig'
import { calcBlockReward } from '../lib/utils'

let status = false
export default function useBlockMonitor() {
  const [block, setBlock] = useState(null)
  const alchemy = useAlchemy()

  return {
    start: () => {
      if (!status) {
        alchemy.ws.on('block', (blockNumber) => {
          alchemy.core.getBlockWithTransactions(blockNumber).then((blk) => {
            setBlock(blk)
            calcBlockReward(blk)
          })
        })
        status = true
      }
    },
    stop: () => {
      status = false
      alchemy.ws.off('block')
    },
    block,
  }
}
