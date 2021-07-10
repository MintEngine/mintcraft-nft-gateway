import { pick } from 'lodash'
import jadepool from '@jadepool/instance'
import { ParsedArgs } from '@mintcraft/types'
import SubstrateSrv from '../services/substrate.service'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ParsedArgs): Promise<any> => {
  const substrateSrv = jadepool.getService('substrate') as SubstrateSrv
  const contracts = substrateSrv.getSupportedContracts('token')
  return contracts.map(one => pick(one, ['name', 'address', 'category', 'symbol']))
}
