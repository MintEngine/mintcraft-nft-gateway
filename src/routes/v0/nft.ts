import Router from '@koa/router'
import { METHOD_NAMESPACE } from '@mintcraft/types'
import { buildHandler } from '../factory'

const router = new Router()
  .get('/', buildHandler('todo', METHOD_NAMESPACE.BLOCKCHAIN))

export = router
