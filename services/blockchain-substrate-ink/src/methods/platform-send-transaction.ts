// import _ from 'lodash'
import type { ArgsSendTrx, ResultTrxSent } from '@mintcraft/types'

import buildContext from './invoke-utils/build-context'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsSendTrx): Promise<ResultTrxSent> => {
  if (args.rawHex === undefined && args.signed === undefined) {
    throw new Error('weither rawHex or signed array is required.')
  }
  // build contract context
  const { substrateSrv, api } = await buildContext(namespace, args)

  // directly send raw hex
  let result: ResultTrxSent
  if (args.rawHex !== undefined) {
    result = await substrateSrv.sumbitTransaction(api, args.rawHex)
  } else if (args.signed !== undefined && args.signed.length > 0) {
    const data = args.signed[0]
    if (data.unsignedRawHex === undefined) throw new Error('missing unsignedRawHex')
    if (data.signature === undefined) throw new Error('missing signature')
    const extrinsic = substrateSrv.decodeExtrinsic(api, data.unsignedRawHex, data)
    result = await substrateSrv.sumbitTransaction(api, extrinsic)
  } else {
    throw new Error('invalid arguments.')
  }
  return result
}
