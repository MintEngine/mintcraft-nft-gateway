import _ from 'lodash'
import axios from 'axios'
import {
  ArgeEntityGetMetadata
} from '@mintcraft/types'
import jadepool from '@jadepool/instance'
import { toGatewayURL } from 'nft.storage'

import NFTStorageServ from '../services/nft.storage.service'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgeEntityGetMetadata): Promise<any> => {
  if (_.isEmpty(args.reference)) throw new Error('missing reference.')
  // storage instance
  const nftServ = jadepool.getService('nft.storage') as NFTStorageServ
  const cid = args.reference
  // Throws if the NFT was not found
  const result = await nftServ.storage.check(cid)
  if (result.cid !== cid) {
    throw new Error(`Checked cid is ${result.cid} instead of ${cid}`)
  }

  // FIXME: add options to use custom gateway
  const httpUrl = toGatewayURL(`ipfs://${cid}/metadata.json`)

  // request metadata
  const res = await axios.get(httpUrl.href, { responseType: 'json' })
  if (res.status >= 200 && res.status < 300) {
    return res.data
  }
  throw new Error(`status - ${res.status}: ${res.statusText}`)
}
