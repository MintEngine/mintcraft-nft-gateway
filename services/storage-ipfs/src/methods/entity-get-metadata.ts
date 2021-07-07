import _ from 'lodash'
import axios from 'axios'
import {
  ArgsEntityGetMetadata
} from '@mintcraft/types'
import jadepool from '@jadepool/instance'
import { toGatewayURL } from 'nft.storage'

import NFTStorageServ from '../services/nft.storage.service'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsEntityGetMetadata): Promise<any> => {
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
    const ret = res.data
    // convert to gateway url
    if (args.asGatewayUrl === true) {
      if (typeof ret?.image === 'string') ret.image = toGatewayURL(ret.image)
      const contentUrl = ret?.properties?.mintcraft?.content
      if (typeof contentUrl === 'string') {
        ret.properties.mintcraft.content = toGatewayURL(contentUrl)
      }
    }
    return ret
  }
  throw new Error(`status - ${res.status}: ${res.statusText}`)
}
