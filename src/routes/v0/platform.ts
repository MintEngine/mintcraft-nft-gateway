import Router from '@koa/router'
import { METHOD_NAMESPACE } from '@mintcraft/types'
import { buildHandler } from '../factory'

const platformRouter = new Router()
// send raw transcation data
  .post('/send-rawtx', buildHandler('platform-send-rawtx', METHOD_NAMESPACE.BLOCKCHAIN, {
    rawtx: { type: 'string', required: true }
  }))
// get transaction basic infomation
  .get('/tx/:hash', buildHandler('platform-query-transaction', METHOD_NAMESPACE.BLOCKCHAIN))
// get transaction detail infomation (not supported for all platforms)
  .get('/tx/:hash/detail', buildHandler('platform-query-transaction-detail', METHOD_NAMESPACE.BLOCKCHAIN))
// platform summary info
  .get('/', buildHandler('platform-query-info', METHOD_NAMESPACE.BLOCKCHAIN))

// export routers
const router = new Router()
  .post('/:platform', platformRouter.routes())
  .get('/', buildHandler('list-all-platforms', METHOD_NAMESPACE.NULL))

export = router
