import Router from '@koa/router'
// routers
import routerNFT from './nft'
import routerStorage from './storage'
import routerTransaction from './txs'

const router = new Router()
// 交易相关
router.use('/txs', routerTransaction.routes())
// NFT 信息
router.use('/nft', routerNFT.routes())
// 存储相关
router.use('/storage', routerStorage.routes())

export = router
