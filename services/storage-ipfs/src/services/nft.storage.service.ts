import _ from 'lodash'
import { IConfig } from 'config'
import { NFTStorage } from 'nft.storage'
import { BaseService } from '@jadepool/types'
import { JadePool } from '@jadepool/instance'
import Logger from '@jadepool/logger'

const logger = Logger.of('Service', 'Nft Storage')

class Service extends BaseService {
  // constructor
  constructor (services: any) {
    super('nft.storage', services)
    this._jadepool = services.jadepool as JadePool
  }

  /// Private members
  /** jadepool instance */
  private readonly _jadepool: JadePool
  /** nft.storage instance */
  private _storage?: NFTStorage

  /// Accessors
  get config (): IConfig { return this._jadepool.config as IConfig }
  get storage (): NFTStorage {
    if (this._storage === undefined) {
      throw new Error('storage isn‘t initialized.')
    }
    return this._storage
  }

  /// Methods
  /**
   * 初始化
   * @param opts
   */
  async initialize (_opts: object): Promise<void> {
    const endpoint: string = this.config.get('nftStorage.endpoint')
    if (_.isEmpty(endpoint)) throw new Error('missing nft.storage endpoint config.')
    const token: string = this.config.get('nftStorage.accessToken')
    if (_.isEmpty(token) || token.length < 200) throw new Error('missing nft.storage token config.')
    // create nft instance
    this._storage = new NFTStorage({ token, endpoint })
    logger.tag('Initialized').log(`endpoint=${endpoint}`)
  }

  /**
   * 该Service的优雅退出函数
   * @param signal 退出信号
   */
  async onDestroy (_signal: number): Promise<void> {
    // reset to undefined
    this._storage = undefined
  }
}

export = Service
