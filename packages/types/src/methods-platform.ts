import { ParsedArgs } from './methods-shared'

// ------- consts -------
//

// ------- interface -------
//
interface ArgsWithPlatform {
  /** platform argument */
  platform: string
  /** contract address or name argument */
  contract: string
}

export interface ArgsBuildTxMint extends ParsedArgs, ArgsWithPlatform {

}
