// attribute item
interface OpenSeaAttrItem {
  trait_type: string
}
// property object
interface OpenSeaStringProperty {
  value: string
  display_value: string
}
interface OpenSeaNumberProperty {
  value: number
  display_type?: 'number' | 'boost_percentage' | 'boost_number'
}
interface OpeanSeaDateProperty {
  value: number
  display_type?: 'date'
}
type OpenSeaProperty = OpenSeaStringProperty | OpenSeaNumberProperty | OpeanSeaDateProperty

// metadata basics
export interface OpenSeaNFTMetadataBasics {
  /** nft name */
  name: string
  /** nft description */
  description: string
  /** opeasea external url field */
  external_url?: string
  /** opeasea animation url field */
  animation_url?: string
}

export interface NFTMetadata extends OpenSeaNFTMetadataBasics {
  /** erc1155 nft properties */
  properties?: Record<string, string> & Record<string, OpenSeaProperty>
  /** opeasea attributes */
  attributes?: Array<OpenSeaAttrItem & OpenSeaProperty>
}
