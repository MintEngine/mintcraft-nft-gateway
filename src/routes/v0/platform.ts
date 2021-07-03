import Router from '@koa/router'

const platformRouter = new Router()

// export routers
const router = new Router()
  .post('/:platform', platformRouter.routes())

export = router
