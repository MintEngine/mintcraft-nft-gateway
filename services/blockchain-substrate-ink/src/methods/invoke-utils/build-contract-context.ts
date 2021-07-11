import _ from 'lodash'
import type { ArgsWithContract } from '@mintcraft/types'
import { ContractPromise } from '@polkadot/api-contract'

import buildContext from './build-context'

export = async (namespace: string, args: ArgsWithContract) => {
  if (_.isEmpty(args.contract)) throw new Error('invalid args: missing contract.')

  const { substrateSrv, api } = await buildContext(namespace, args)
  // get contract defination
  const define = substrateSrv.ensureContractSupported(args.contract)
  // get contract instance
  const contract = new ContractPromise(api, define.abi, define.address)
  // return all instances
  return { substrateSrv, api, contract }
}
