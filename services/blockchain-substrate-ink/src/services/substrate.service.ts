import _ from 'lodash'
import type { IConfig } from 'config'
import { hexToU8a } from '@polkadot/util'
import { blake2AsHex } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import type { Signer, SignerResult } from '@polkadot/api/types'
import type { SubmittableExtrinsic } from '@polkadot/api/submittable/types'
import type { Vec } from '@polkadot/types'
import type { BlockHash, EventRecord, Header, SignedBlock } from '@polkadot/types/interfaces'
import type { AnyJson, SignerPayloadRaw, SignatureOptions, IExtrinsic } from '@polkadot/types/types'
import Logger from '@jadepool/logger'
import { BaseService } from '@jadepool/types'
import type { JadePool } from '@jadepool/instance'
import { PLATFORMS, PLATFORM_CHAINIDS, ResultTrxBuilt, ResultTrxSent, SignedData } from '@mintcraft/types'

const logger = Logger.of('Service', 'Substrate')

// local define
interface EndpointDefine {
  name: string
  url: string
}

interface ContractDefine {
  name: string
  category: 'nft' | 'token'
  symbol?: string
  address: string
  abi: AnyJson
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
   * get supported contracts
   * @param category contract type
   */
  getSupportedContracts (category: 'nft' | 'token'): ContractDefine[] {
    const contracts = this.config.get<ContractDefine[]>('contracts')
    return contracts.filter(one => one.category === category)
  }

  /**
   * ensure the contract and return it
   */
  ensureContractSupported (contractOrNameOrSymbol: string): ContractDefine {
    const inputName = _.trim(contractOrNameOrSymbol).toLowerCase()
    const contracts = this.config.get<ContractDefine[]>('contracts')
    const found = contracts.find(one => {
      return one.name.toLowerCase() === inputName ||
        one.address.toLowerCase() === inputName ||
        (one.symbol !== undefined ? one.symbol.toLowerCase() === inputName : false)
    })
    if (found === undefined) {
      throw new Error(`${contractOrNameOrSymbol} didn't find.`)
    }
    return found
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

  /**
   * wrap timeout for promise
   * @param promise
   */
  private async _wrapPromiseRequest<T> (promise: Promise<T>): Promise<T> {
    const timeout = 5000 // 5 seconds
    return await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('request timeout.'))
      }, timeout)
      promise.then(resolve).catch(reject).finally(() => {
        clearTimeout(timeoutId)
      })
    })
  }

  /**
   * get nonce
   */
  async getAccountNextNonce (api: ApiPromise, address: string): Promise<number> {
    const nonce = await this._wrapPromiseRequest(api.rpc.system.accountNextIndex(address))
    return nonce.toNumber()
  }

  /**
   * get block hash by block number
   */
  async getBlockHash (api: ApiPromise, num: number): Promise<BlockHash> {
    return await this._wrapPromiseRequest(api.rpc.chain.getBlockHash(num))
  }

  /**
   * get block
   */
  async getBlock (api: ApiPromise, hash?: number | string): Promise<SignedBlock> {
    let signedBlock: SignedBlock
    if (hash === undefined) {
      signedBlock = await this._wrapPromiseRequest(api.rpc.chain.getBlock())
    } else if (typeof hash === 'number') {
      const hashStr = await this._wrapPromiseRequest(api.rpc.chain.getBlockHash(hash))
      signedBlock = await this._wrapPromiseRequest(api.rpc.chain.getBlock(hashStr))
    } else {
      signedBlock = await this._wrapPromiseRequest(api.rpc.chain.getBlock(hash))
    }
    return signedBlock
  }

  /**
   * block header
   */
  async getBlockHeader (api: ApiPromise, hash?: number | string): Promise<Header> {
    const signedBlock = await this.getBlock(api, hash)
    return signedBlock.block.header
  }

  /**
   * block events
   */
  async getBlockEvents (api: ApiPromise, hash: string | BlockHash): Promise<Vec<EventRecord>> {
    return await this._wrapPromiseRequest(api.query.system.events.at(hash))
  }

  /**
   * build the extrinsic
   */
  async buildUnsignedExtrinsic (api: ApiPromise, sender: string, extrinsic: SubmittableExtrinsic<'promise'>, mortalBlocks: number = 64): Promise<ResultTrxBuilt> {
    const senderAddressNonce = await this.getAccountNextNonce(api, sender)
    const header = await this.getBlockHeader(api)

    // add signing data
    const options: SignatureOptions = {
      blockHash: header.hash,
      era: api.registry.createType('ExtrinsicEra', {
        current: header.number,
        period: mortalBlocks // default mortal blocks is 64
      }),
      nonce: senderAddressNonce,
      genesisHash: api.genesisHash,
      runtimeVersion: api.runtimeVersion,
      signedExtensions: api.registry.signedExtensions
    }
    // unsigned rawhex with faked sig
    const unsignedRawHex = extrinsic.signFake(sender, options).toHex()
    // hacking the payload
    options.signer = new RawSigner()
    const signedFaked = await extrinsic.signAsync(sender, options)
    const signingPayload = signedFaked.signature.toHex()
    return {
      sender,
      transactions: [
        { unsignedRawHex, signingPayload }
      ]
    }
  }

  /**
   * decode extrinsic with signature
   * @param api
   * @param unsignedRawHex should be the result of buildUnsignedExtrinsic method, which is the hex string with a fake signature
   * @param signature signature hex
   */
  decodeExtrinsic (api: ApiPromise, unsignedRawHex: string, signingData?: Partial<SignedData>): IExtrinsic {
    if (!unsignedRawHex.startsWith('0x')) unsignedRawHex = '0x' + unsignedRawHex
    const decodedExtrinsic = api.registry.createType('Extrinsic', hexToU8a(unsignedRawHex), { isSigned: true, version: api.extrinsicVersion })
    // sender should be signer
    const sender = decodedExtrinsic.signer
    if (_.isEmpty(sender)) throw new Error('missing signer after parsing unsignedRawHex.')
    // now replace the right signature into the extrinsic
    if (signingData !== undefined) {
      if (signingData.signature === undefined) throw new Error('missing signature.')
      if (signingData.signingPayload === undefined) throw new Error('missing signing payload.')
      // FIXME: we should ensure signature is signed by sender
      // FIXME: we should ensure signingPayload is the payload for unsignedRawHex or create payload by unsignedRawHex
      const payload = api.registry.createType('ExtrinsicPayload', hexToU8a(signingData.signingPayload), { version: api.extrinsicVersion })
      decodedExtrinsic.addSignature(sender, signingData.signature, payload.toU8a())
    }
    return decodedExtrinsic
  }

  /**
   * sumbit transaction to blockchain
   */
  async sumbitTransaction (api: ApiPromise, extrinsic: IExtrinsic | string): Promise<ResultTrxSent> {
    let decodedExtrinsic: IExtrinsic
    if (typeof extrinsic === 'string') {
      decodedExtrinsic = this.decodeExtrinsic(api, extrinsic)
    } else {
      decodedExtrinsic = extrinsic
    }

    return await this._wrapPromiseRequest(new Promise((resolve, reject) => {
      api.rpc.author.submitAndWatchExtrinsic(decodedExtrinsic, async (status) => {
        if (status.isInvalid) { return reject(new Error('invalid extrinsic')) }
        if (status.isDropped) { return reject(new Error('dropped extrinsic')) }
        if (!status.isFinalized && !status.isInBlock) return
        // get block hash
        const blockHash = status.isInBlock ? status.asInBlock : status.asFinalized
        // get block number
        const header = await api.rpc.chain.getHeader(blockHash)
        // final return
        resolve({
          txid: decodedExtrinsic.hash.toHex(),
          blockHash: blockHash.toHex(),
          blockNumber: header.number.unwrap().toNumber()
        })
      }).catch(reject)
    }))
  }
}

/**
 * Fake signer to expose payload hex
 */
class RawSigner implements Signer {
  public async signRaw ({ data }: SignerPayloadRaw): Promise<SignerResult> {
    return await new Promise((resolve, reject): void => {
      const hashed = (data.length > (256 + 1) * 2)
        ? blake2AsHex(data)
        : data
      resolve({ id: 1, signature: hashed })
    })
  }
}

export = Service
