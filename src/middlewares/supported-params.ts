import _ from 'lodash'
import { Middleware, RouterParamContext } from '@koa/router'

export default (field: string, values: string[] | ((ctx: RouterParamContext) => string[])): Middleware => {
  return async (ctx, next) => {
    const name = ctx.params[field]
    let supportedValues: string[]
    if (typeof values === 'function') {
      supportedValues = values(ctx)
    } else {
      supportedValues = values
    }
    if (_.isEmpty(supportedValues) || !_.includes(supportedValues, name)) {
      return ctx.throw(404, `unsupported ${field}: ${name}`)
    }
    // go next
    await next()
  } // end Middleware
}
