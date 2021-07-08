import _ from 'lodash'
import { IConfig } from 'config'
import { ApiPromise, WsProvider } from '@polkadot/api'
import Logger from '@jadepool/logger'
import { BaseService } from '@jadepool/types'
import { JadePool } from '@jadepool/instance'
import { PLATFORMS, PLATFORM_CHAINIDS } from '@mintcraft/types'

const logger = Logger.of('Service', 'Substrate')

// local define
interface EndpointDefine {
  name: string
  url: string
}

class Service extends BaseService {
  // constructor
  constructor (services: any) {
    super('substrate', services)
    this._jadepool = services.jadepool as JadePool
    this._apis = new Map()
  }

  /// Private members
  /** jadepool instance */
  private readonly _jadepool: JadePool
  /** api instance dictionary */
  private readonly _apis: Map<string, ApiPromise|Promise<ApiPromise>>

  /// Accessors
  static get supportedChainIds (): string[] { return PLATFORM_CHAINIDS[PLATFORMS.SUBSTRATE_INK] }
  get config (): IConfig { return this._jadepool.config as IConfig }

  /// Life circles
  /**
   * 初始化
   * @param opts
   */
  async initialize (_opts: object): Promise<void> {
    const endpoints = this.config.get('endpoints')
    logger.tag('Initialized').log(`endpoints=${JSON.stringify(endpoints)}`)
  }

  /**
   * 该Service的优雅退出函数
   * @param signal 退出信号
   */
  async onDestroy (_signal: number): Promise<void> {
    // reset to undefined
    // this._storage = undefined
  }

  /// Methods
  /**
   * get endpoints for specific chain
   * @param chainId
   */
  getEndpoints (chainId: string): EndpointDefine[] {
    const endpoints = this.config.get(`endpoints.${chainId}`)
    if (!_.isArray(endpoints) || endpoints.length === 0) throw new Error(`missing endpoints for ${chainId}`)
    return endpoints
  }

  /**
   * get substrate api promise
   * @param chainId
   */
  async getApiPromise (chainId: string): Promise<ApiPromise> {
    if (!_.includes(Service.supportedChainIds, chainId)) {
      throw new Error('unsupported chain id.')
    }
    const api = this._apis.get(chainId)
    if (api !== undefined) {
      if (api instanceof Promise) {
        return await api
      } else {
        return api
      }
    } else {
      const endpoints = this.getEndpoints(chainId)
      // FIXME pick accessable endpoin
      const endpoint = endpoints[0]
      const promise = ApiPromise.create({
        provider: new WsProvider(endpoint.url)
      }).then(createdApi => {
        // 打印连接成功
        createdApi.on('connected', () => {
          logger.tag('Connected').log(`name=${endpoint.name},url=${endpoint.url}`)
        })
        // 断线则重设api
        createdApi.on('disconnected', () => {
          logger.tag('Disconnected').log(`name=${endpoint.name},url=${endpoint.url}`)
          this._apis.delete(chainId)
        })
        this._apis.set(chainId, createdApi)
        return createdApi
      })
      this._apis.set(chainId, promise)
      return await promise
    }
  }
}

export = Service
