import { URL } from 'url'

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
