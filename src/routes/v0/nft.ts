import Router from '@koa/router'
import { buildHandler } from '../factory'
import * as types from '../../types'

const router = new Router()
  .get('/', buildHandler('', types.METHOD_NAMESPACE.BLOCKCHAIN))

export = router
