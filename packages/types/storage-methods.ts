import { URL } from 'url'
import { ParsedArgs } from './shared-methods'

interface OpenSeaAttrItem {
  trait_type: string
}
interface OpenSeaStringAttr {
  value: string
  display_value: string
}
interface OpenSeaNumberAttr {
  value: number
  display_type?: 'number' | 'boost_percentage' | 'boost_number'
}
interface OpeanSeaDateAttr {
  value: number
  display_type?: 'date'
}
type OpenSeaAttr = OpenSeaStringAttr | OpenSeaNumberAttr | OpeanSeaDateAttr

export interface ArgsEntityUpload extends ParsedArgs {
  /** nft name */
  name: string
  /** nft description */
  description: string
  /** erc1155 nft properties */
  properties?: Record<string, string> & Record<string, OpenSeaAttr>
  /** opeasea attributes */
  attributes?: Array<OpenSeaAttrItem & OpenSeaAttr>
  /** opeasea external url field */
  external_url?: string
  /** opeasea animation url field */
  animation_url?: string
}

export interface ResultEntityUploaded {
  /** the main hash id for the NFT that encloses all of the files including metadata.json for the NFT */
  hashId: string
  /** metadata url */
  url: URL
  /** metadata json */
  metadata?: object
  /** metadata json with gateway url  */
  embed?: object
}
