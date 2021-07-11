import _ from 'lodash'
import jadepool from '@jadepool/instance'
import { ArgsWithPlatform } from '@mintcraft/types'
import { ContractPromise } from '@polkadot/api-contract'
import SubstrateSrv from '../../services/substrate.service'

export = async (namespace: string, args: ArgsWithPlatform) => {
  if (_.isEmpty(args.chainId)) throw new Error('invalid args: missing chain id.')
  if (_.isEmpty(args.contract)) throw new Error('invalid args: missing contract.')

  const substrateSrv = jadepool.getService('substrate') as SubstrateSrv
  // get contract defination
  const define = substrateSrv.ensureContractSupported(args.contract)
  // get api promise
  const api = await substrateSrv.getApiPromise(args.chainId)
  // get contract instance
  const contract = new ContractPromise(api, define.abi, define.address)
  // return all instances
  return { substrateSrv, api, contract }
}
