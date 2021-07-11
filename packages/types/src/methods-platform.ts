import { ParsedArgs } from './methods-shared'

// ------- consts -------
//

// ------- interface -------
//
export interface ArgsWithPlatform {
  /** platform argument */
  platform: string
  /** platform chain id argument */
  chainId: string
  /** contract address or name argument */
  contract: string
}

interface UnsignedData {
  unsignedRawHex: string
  signingPayload?: string
  signatureOptions?: object
}

interface SignedData {
  unsignedRawHex: string
  signature: string
  recoveryId?: number
}

export interface ResultTrxBuilt {
  sender: string
  transactions: UnsignedData[]
}

export interface ArgsBuildTxMint extends ParsedArgs, ArgsWithPlatform {
  /** nft creator who own the nft at first */
  creator: string
  /** nft metadata url (now only support ipfs or swarm) */
  metadata: string
  /** nft initial supply (erc721 should be always 1) */
  initialSupply?: number
}

export interface ArgsSendTrx extends ParsedArgs, ArgsWithPlatform{
  rawHex?: string
  signed?: SignedData[]
}
