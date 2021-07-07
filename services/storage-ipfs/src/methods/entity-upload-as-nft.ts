import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { URL } from 'url'
import { File } from 'nft.storage'
import jadepool from '@jadepool/instance'
import {
  UPLOADING_FIELDS,
  ArgsEntityUpload,
  ResultEntityUploaded,
  NFTMetadata
} from '@mintcraft/types'

import NFTStorageServ from '../services/nft.storage.service'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsEntityUpload): Promise<ResultEntityUploaded> => {
  if (_.isEmpty(args.name)) throw new Error('invalid args: missing name.')
  if (_.isEmpty(args.description)) throw new Error('invalid args: missing description.')

  // build nft metadata
  const data: NFTMetadata = {
    name: args.name,
    description: args.description
  }
  // erc1155 format
  if (typeof args.properties === 'string') {
    let json
    try {
      json = JSON.parse(args.properties)
    } catch (err) {}
    // TODO ensure json string is valid
    if (json !== undefined && !_.isArray(json)) {
      data.properties = json
    }
  }
  // opensea format
  if (typeof args.attributes === 'string') {
    let json
    try {
      json = JSON.parse(args.attributes)
    } catch (err) {}
    // TODO ensure json string is valid
    if (_.isArray(json)) {
      data.attributes = json
    }
  }
  // extra data
  if (typeof args.animation_url === 'string') {
    data.animation_url = args.animation_url
  }
  if (typeof args.external_url === 'string') {
    data.external_url = args.external_url
  }

  // preview image
  const previewImage = args.files?.find(one => one.fieldname === UPLOADING_FIELDS.PREVIEW)
  if (previewImage === undefined) {
    throw new Error('invalid args: missing preview image.')
  }

  // nft content
  const content = args.files?.find(one => one.fieldname === UPLOADING_FIELDS.CONTENT)
  if (content === undefined) {
    throw new Error('invalid args: missing content field.')
  }
  // ensure properties exists
  data.properties = data.properties ?? {}

  // storage instance
  const nftServ = jadepool.getService('nft.storage') as NFTStorageServ

  // store metadata
  const metadata = await nftServ.storage.store(_.merge(data, {
    image: new File([await fs.promises.readFile(previewImage.path)], previewImage.filename, {
      type: previewImage.mimetype
    }),
    // extra mintcraft special field
    properties: {
      mintcraft: {
        content: new File([await fs.promises.readFile(content.path)], content.filename, {
          type: content.mimetype
        }),
        content_type: path.extname(content.filename)
      }
    }
  }))

  return {
    hashId: metadata.ipnft,
    url: new URL(metadata.url),
    metadata: metadata.data,
    embed: metadata.embed()
  }
}
