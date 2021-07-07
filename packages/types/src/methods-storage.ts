import { URL } from 'url'
import { ParsedArgs } from './methods-shared'
import { OpenSeaNFTMetadataBasics, NFTMetadata } from './nft'

// ------- consts -------
//
export const UPLOADING_FIELDS = {
  CONTENT: 'content',
  PREVIEW: 'preview'
}

// ------- interface -------
//
interface ArgsWithReference {
  /** reference argument for the entity */
  reference: string
  /** store argument for the entity */
  store: string
}

export interface ArgsEntityUpload extends ParsedArgs, OpenSeaNFTMetadataBasics {
  /** nft properties json string */
  properties?: string
  /** nft attributes json string */
  attributes?: string
}

export interface ResultEntityUploaded {
  /** the main hash id for the NFT that encloses all of the files including metadata.json for the NFT */
  hashId: string
  /** metadata url */
  url: URL
  /** metadata json */
  metadata?: NFTMetadata
  /** metadata json with gateway url  */
  embed?: NFTMetadata
}

export type ArgsEntityGetMetadata = ParsedArgs & ArgsWithReference & {
  asGatewayUrl?: boolean
}
