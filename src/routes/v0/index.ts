import Router from '@koa/router'
// routers
import routerNFT from './nft'
import routerStorage from './storage'

const router = new Router()
router.use('/nft', routerNFT.routes())
router.use('/storage', routerStorage.routes())

export = router
