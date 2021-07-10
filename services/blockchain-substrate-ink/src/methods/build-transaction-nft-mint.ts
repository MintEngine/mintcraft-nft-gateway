import _ from 'lodash'
import jadepool from '@jadepool/instance'
import { ArgsBuildTxMint, ResultTrxBuilt } from '@mintcraft/types'
import { ContractPromise } from '@polkadot/api-contract'
import SubstrateSrv from '../services/substrate.service'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsBuildTxMint): Promise<ResultTrxBuilt> => {
  if (_.isEmpty(args.chainId)) throw new Error('invalid args: missing chain id.')
  if (_.isEmpty(args.contract)) throw new Error('invalid args: missing contract.')

  const substrateSrv = jadepool.getService('substrate') as SubstrateSrv
  // get contract defination
  const define = substrateSrv.ensureContractSupported(args.contract)
  // get api promise
  const api = await substrateSrv.getApiPromise(args.chainId)
  // get contract instance
  const contract = new ContractPromise(api, define.abi, define.address)

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
