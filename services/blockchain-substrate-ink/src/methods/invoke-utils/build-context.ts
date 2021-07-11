import _ from 'lodash'
import jadepool from '@jadepool/instance'
import type { ArgsWithPlatform } from '@mintcraft/types'

import SubstrateSrv from '../../services/substrate.service'

export = async (namespace: string, args: ArgsWithPlatform) => {
  if (_.isEmpty(args.chainId)) throw new Error('invalid args: missing chain id.')

  // get substrate instance
  const substrateSrv = jadepool.getService('substrate') as SubstrateSrv
  // get api promise
  const api = await substrateSrv.getApiPromise(args.chainId)

  // return all instances
  return { substrateSrv, api }
}
