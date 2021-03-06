import _ from 'lodash'
import Router from '@koa/router'
import { METHOD_NAMESPACE, PLATFORMS, PLATFORM_CHAINIDS } from '@mintcraft/types'
import supportedParams from '../../middlewares/supported-params'
import { buildHandler } from '../factory'

const platformRouter = new Router()
// get contract information
  .get('/:contract/info', buildHandler('token-query-detail-info', METHOD_NAMESPACE.BLOCKCHAIN))
// get owners' balance detail
  .get('/:contract/balance/:address', buildHandler('account-query-balance', METHOD_NAMESPACE.BLOCKCHAIN))
// try build transaction - transfer
  .post('/:contract/build-tx-transfer', buildHandler('build-transaction-transfer', METHOD_NAMESPACE.BLOCKCHAIN, {
    // the transaction signer address, default is 'sender'
    signer: { type: 'string', required: false },
    // token sender
    sender: { type: 'string', required: true },
    // token recipient
    recipient: { type: 'string', required: true },
    // token amount, no decimal
    amount: { type: 'int', required: true, min: 1 },
    // transaction memo (not supported for all platforms)
    memo: { type: 'string', required: false, allowEmpty: true }
  }))
// list all supported contracts
  .get('/', buildHandler('list-supported-tokens', METHOD_NAMESPACE.BLOCKCHAIN))

// export routers
const router = new Router()
// platform and token's contract addesss is included in url
  .use('/:platform/:chainId',
    supportedParams('platform', _.values(PLATFORMS)),
    supportedParams('chainId', (ctx) => PLATFORM_CHAINIDS[ctx.params.platform]),
    platformRouter.routes()
  )

export = router
