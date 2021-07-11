import type { ArgsQueryTrx, ResultQueryTrx } from '@mintcraft/types'

import buildContext from './invoke-utils/build-context'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsQueryTrx): Promise<ResultQueryTrx> => {
  if (args.txid === undefined) throw new Error('missing required txid.')
  if (args['ref-block-hash'] === undefined && args['ref-block-number'] === undefined) {
    throw new Error('ref-block is required for query tx info')
  }
  // build contract context
  const { substrateSrv, api } = await buildContext(namespace, args)

  let blockHash: string
  if (args['ref-block-number'] !== undefined) {
    const hash = await substrateSrv.getBlockHash(api, args['ref-block-number'])
    blockHash = hash.toHex()
  } else if (args['ref-block-hash'] !== undefined) {
    blockHash = args['ref-block-hash']
  } else {
    throw new Error('missing required block reference.')
  }
  // block info
  const signedBlock = await substrateSrv.getBlock(api, blockHash)
  if (signedBlock === undefined) {
    throw new Error(`failed to find block[${blockHash}]`)
  }
  // find transaction
  let foundTrxIdx: number = -1
  const extrinsics = signedBlock.block.extrinsics
  const foundTrx = extrinsics.find((extrinsic, idx) => {
    if (extrinsic.hash.toString().toLowerCase() === args.txid.toLowerCase()) {
      foundTrxIdx = idx
      return true
    } else {
      return false
    }
  })
  if (foundTrx === undefined) {
    throw new Error(`failed to find transaction(${args.txid}) in block[${blockHash}]`)
  }
  // find events
  const events = await substrateSrv.getBlockEvents(api, blockHash)
  const trxEvents = events.filter(record => record.phase.asApplyExtrinsic.toNumber() === foundTrxIdx)

  return {
    txid: args.txid,
    blockHash,
    blockNumber: signedBlock.block.header.number.unwrap().toNumber(),
    content: foundTrx.toHuman(),
    receipt: {
      events: trxEvents.map(one => one.toHuman())
    }
  }
}
