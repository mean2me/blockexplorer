import { Alchemy, Network, Utils, BigNumber } from 'alchemy-sdk'
import { Duration } from 'luxon'

export function elapsedTime(blockTimestamp) {
  const diff = Date.now() - blockTimestamp
  const d = Duration.fromMillis(diff)
  const days = d.toFormat('dd')
  const time = d.toFormat('hh:mm s ago')
  return `${days > 0 ? days : ''} ${time}`
}

/**
 * - Block reward 2ETH
 * - Transaction gas fees: used gas units + ( baseFeePerGas + maxPriorityFeePerGas ) = transaction fee
 * - Burned fees: baseFeePerGas x gasUsed = burned fees
 * - Uncle and nephew rewards:
 *   If a uncle block is included in the latest block, it becomes a nephew block and miner receives a "nephew reward"
 *   newphew reward is 1/32 of block reward for the miner including it
 *   miner who produced uncle block is also rewarded: (Uncle blockNumber + 8 - Block Number) x block reward / 8 = uncle reward
 *
 * @param {import('alchemy-sdk').Block} block
 */
export async function calcBlockReward(block) {
  const alchemy = new Alchemy({
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  })

  const { receipts } = await alchemy.core.getTransactionReceipts({
    blockNumber: Utils.hexlify(block.number),
  })

  const txFee = receipts
    .map((tx) =>
      BigNumber.from(tx.effectiveGasPrice)
        .mul(BigNumber.from(tx.gasUsed))
        .toBigInt(),
    )
    .reduce((prev, curr) => prev + curr)

  const burntFee = receipts
    .map((tx) =>
      BigNumber.from(block.baseFeePerGas)
        .mul(BigNumber.from(tx.gasUsed))
        .toBigInt(),
    )
    .reduce((p, c) => p + c)

  const blockReward = Utils.formatEther(
    BigNumber.from(txFee - burntFee).toString(),
  )

  return {
    blockReward,
    txFees: Utils.formatEther(BigNumber.from(txFee).toString()),
    burntFees: Utils.formatEther(BigNumber.from(burntFee).toString()),
    block: block.number,
  }
}
