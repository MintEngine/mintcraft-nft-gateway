import { ParsedArgs } from './methods-shared'

// ------- consts -------
//

// ------- interface -------
//
interface ArgsWithPlatform {
  /** platform argument */
  platform: string
  /** platform chain id argument */
  chainId: string
  /** contract address or name argument */
  contract: string
}

export interface ResultTrxBuilt {
  unsignedRawHex: string
  signingPayload?: string
  signatureOptions?: object
}

export interface ArgsBuildTxMint extends ParsedArgs, ArgsWithPlatform {
  /** nft creator who own the nft at first */
  creator: string
  /** nft metadata url (now only support ipfs or swarm) */
  metadata: string
  /** nft initial supply (erc721 should be always 1) */
  initialSupply?: number
}
