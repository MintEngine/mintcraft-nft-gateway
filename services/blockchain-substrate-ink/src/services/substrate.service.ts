// import _ from 'lodash'
import { IConfig } from 'config'
import { BaseService } from '@jadepool/types'
import { JadePool } from '@jadepool/instance'
import Logger from '@jadepool/logger'

const logger = Logger.of('Service', 'Substrate')

class Service extends BaseService {
  // constructor
  constructor (services: any) {
    super('substrate', services)
    this._jadepool = services.jadepool as JadePool
  }

  /// Private members
  /** jadepool instance */
  private readonly _jadepool: JadePool
  /** api instance */
  // private _storage?: NFTStorage

  /// Accessors
  get config (): IConfig { return this._jadepool.config as IConfig }
  // get client (): NFTStorage {
  //   if (this._storage === undefined) {
  //     throw new Error('storage isn‘t initialized.')
  //   }
  //   return this._storage
  // }

  /// Methods
  /**
   * 初始化
   * @param opts
   */
  async initialize (_opts: object): Promise<void> {
    // TODO
    logger.tag('Initialized').log(`endpoint=${1}`)
  }

  /**
   * 该Service的优雅退出函数
   * @param signal 退出信号
   */
  async onDestroy (_signal: number): Promise<void> {
    // reset to undefined
    // this._storage = undefined
  }
}

export = Service
