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
}

export interface ArgsWithContract extends ArgsWithPlatform {
  /** contract address or name argument */
  contract: string
}

export interface UnsignedData {
  unsignedRawHex: string
  signingPayload?: string
  signatureOptions?: object
}

export interface SignedData {
  unsignedRawHex: string
  signingPayload?: string
  signature: string
  recoveryId?: number
}

export interface ResultTrxBuilt {
  sender: string
  transactions: UnsignedData[]
}

export interface ArgsBuildTxMint extends ParsedArgs, ArgsWithContract {
  /** nft creator who own the nft at first */
  creator: string
  /** nft metadata url (now only support ipfs or swarm) */
  metadata: string
  /** nft initial supply (erc721 should be always 1) */
  initialSupply?: number
}

export interface ArgsSendTrx extends ParsedArgs, ArgsWithPlatform {
  rawHex?: string
  signed?: SignedData[]
}

/**
 * basic transaction data
 */
interface TrxBasics {
  txid: string
  blockHash?: string
  blockNumber?: number
}

export interface ResultTrxSent extends TrxBasics { }

export interface ArgsQueryTrx extends ParsedArgs, ArgsWithPlatform {
  txid: string
  'ref-block-hash'?: string
  'ref-block-number'?: number
}

export interface ResultQueryTrx extends TrxBasics {
  content: any
  receipt?: any
}