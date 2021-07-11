import type { ArgsBuildTxMint, ResultTrxBuilt } from '@mintcraft/types'

import buildContractContext from './invoke-utils/build-contract-context'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsBuildTxMint): Promise<ResultTrxBuilt> => {
  // build contract context
  const { substrateSrv, api, contract } = await buildContractContext(namespace, args)

  // contract parameters
  const initialSupply = args.initialSupply ?? 1
  const metadataUri = args.metadata

  // We will use these values for the execution
  const value = 0
  const { gasConsumed, result } = await contract.query.create(args.creator, { value, gasLimit: -1 }, initialSupply, metadataUri)
  // contract should implement create message
  if (!result.isOk) {
    throw new Error(`missing "create" message for contract ${args.contract}`)
  }

  // transaction body
  const extrinsic = contract.tx.create({ value, gasLimit: gasConsumed }, initialSupply, metadataUri)

  // return built rawtx
  return await substrateSrv.buildUnsignedExtrinsic(api, args.creator, extrinsic)
}
