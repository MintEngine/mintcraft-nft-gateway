import multer from '@koa/multer'

export interface ParsedArgs {
  /** 区块链的类型 */
  nftPlatform?: string
  /** 存储渠道的类型 */
  nftStorage?: string
  /** 上传的内容 */
  files?: multer.File[]
  /** preset keys */
  presetKeys: string[]
  /** auto keys */
  autoKeys: string[]
  /** 任意数据 */
  [key: string]: any
}
