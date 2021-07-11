import _ from 'lodash'
import { ArgsSendTrx } from '@mintcraft/types'
import buildContext from './invoke-utils/build-context'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsSendTrx): Promise<any> => {
  if (args.rawHex === undefined && args.signed === undefined) {
    throw new Error('weither rawHex or signed array is required.')
  }
  // build contract context
  const { substrateSrv, api, contract } = await buildContext(namespace, args)

  // TODO implement
  throw new Error('unimplemented!')
}
