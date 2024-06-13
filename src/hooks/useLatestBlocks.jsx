import { useState } from 'react'
import useAlchemy from './useAlchemy'

export default function useLatestBlocks(blocskReturned = 10) {
  const alchemy = useAlchemy()
  const [latestBlocks, setLatestBlocks] = useState([])

  if (latestBlocks.length === 0) {
    alchemy.core.getBlockNumber().then((blockNumber) => {
      const promises = Array(blocskReturned)
        .fill(blockNumber)
        .map((blockNumber, i) => {
          return alchemy.core.getBlockWithTransactions(
            parseInt(blockNumber) - i,
          )
        })

      Promise.all(promises).then((blocks) => setLatestBlocks(blocks))
    })
  }

  return latestBlocks
}
