import { useCallback, useEffect, useState } from 'react'
import useBlockMonitor from './hooks/useBlockMonitor'
import useLatestBlocks from './hooks/useLatestBlocks'
import styles from './LatestBlocks.module.css'
import { calcBlockReward, elapsedTime } from './lib/utils'

export const LatestBlocks = () => {
  const [blocks, setBlocks] = useState([])
  const { start, block } = useBlockMonitor()
  const latestBlocks = useLatestBlocks()
  const [rewards, setRewards] = useState([])

  const update = useCallback((latestBlocksArr) => {
    if (!Array.isArray(latestBlocksArr)) return
    setBlocks((prev) => {
      return [
        ...latestBlocksArr,
        ...(Array.isArray(prev) ? prev.slice(0, 9) : []),
      ]
    })
  }, [])

  const init = useCallback((blocks) => {
    setBlocks(blocks)
  }, [])

  useEffect(() => {
    if (blocks && latestBlocks && !blocks.length && latestBlocks.length > 0) {
      init(latestBlocks)
    }
  }, [blocks, latestBlocks, init])

  useEffect(() => {
    if (block) {
      update([block])
    }
  }, [block, update])

  if (blocks?.length) start()

  const fetchRewards = useCallback(async () => {
    if (blocks.length) {
      const filteredBlocks = blocks.filter((block) => !rewards[block.number])

      if (filteredBlocks.length) {
        for await (let b of filteredBlocks) {
          await new Promise((resolve) => {
            calcBlockReward(b).then(({ blockReward }) => {
              setRewards((prev) => {
                return { ...prev, ...{ [b.number]: blockReward } }
              })
              setTimeout(() => {
                resolve(true)
              }, 1000)
            })
          })
        }
      }
    }
  }, [blocks, rewards])

  useEffect(() => {
    if (blocks?.length) fetchRewards()
  }, [blocks, fetchRewards])

  return (
    <div className={styles.container}>
      <div className={styles.blocks}>
        <div className={styles.header}>
          <h4>Latest blocks</h4>
        </div>
        {blocks?.map((block) => (
          <div key={block.hash}>
            <div className={styles.grid}>
              <div className={styles.blocknum}>
                <h4>{block.number}</h4>
                <small className={styles.small}>
                  {elapsedTime(parseInt(block.timestamp * 1000))}
                </small>
              </div>
              <div className={styles.recipient}>
                <h4>
                  Fee recipient:{' '}
                  <small className={styles.small}>{block.miner}</small>
                </h4>
                <small className={styles.small}>
                  {block.transactions.length} txsns
                </small>
              </div>
              <div className={styles.blockReward}>
                <div title="Block reward">
                  {rewards[block.number]
                    ? `${rewards[block.number]} ETH`
                    : 'loading...'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
