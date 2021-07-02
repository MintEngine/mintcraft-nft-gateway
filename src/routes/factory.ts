
/**
 * 构造method调用的args
 * @param {String} requestMethodName
 * @param {Context} rctx
 * @param {Object|Function} dataRule 数据权限验证规则
 * @param {Object} opts 额外配置参数
 * @param {Object} [opts.preset=undefined] 预定义对象
 * @param {Boolean} [opts.allowUnruled=false] 允许rule以外的key在data之中
 * @param {Boolean} [opts.flagForNew=false] 当POST请求时，为data设置isNew标记为true，反之为false
 */
async function parseMethodArgs (requestMethodName, rctx, dataRule, opts) {
  // 检测data是否合法
  if (dataRule) {
    if (requestMethodName !== 'GET' && _.isEmpty(data) && !_.isEmpty(dataRule)) {
      throw new NBError(10003)
    }
    const rules = typeof dataRule === 'function' ? (await dataRule(rctx)) : dataRule
    utils.validateParameter(data, _.mapValues(rules, rule => {
      try {
        if (rule.formatStr) rule.format = new RegExp(rule.formatStr)
      } catch (err) {}
      return rule
    }))
    // 仅选取符合Rule的keys
    if (!opts.allowUnruled) {
      data = _.pick(data, _.keys(rules).concat(_.keys(rctx.params)))
    }
  }
  const autoData = rctx.get('autoData', {})
  // 自动参数: API较新时，设置flag
  autoData.isLatest = rctx.apiVersion !== consts.API_VERSION.V1
  // 自动参数 - operator 相关
  if (typeof rctx.operatorId === 'string') {
    autoData.currentOperatorId = rctx.operatorId // 通常是 username
    autoData.currentOperatorObjectId = rctx.operator._id // 这个是对象 id，用于 db 查询
  }
  if (_.isArray(rctx.operatorGroups)) {
    autoData.currentOperatorGroups = _.map(rctx.operatorGroups, one => _.isFunction(one.toObject) ? one.toObject() : one)
  }
  // 自动参数 - 资源相关
  if (typeof rctx.currentModule === 'string') {
    autoData.currentModule = rctx.currentModule
  }
  if (typeof rctx.currentResourceId === 'string') {
    autoData.currentResourceId = rctx.currentResourceId
  }
  if (typeof rctx.currentPermission === 'string') {
    autoData.currentPermission = rctx.currentPermission
  }
  if (rctx.permissionRoles.length > 0) {
    autoData.permissionRoles = _.clone(rctx.permissionRoles)
  }
  // 自动参数：当限制 Resource 设置限制
  if (rctx.availableResources.length > 0) {
    autoData.resourceIds = rctx.availableResources.map(one => one.resource)
  }
  // 自动参数：当具有权限时，设置权限名
  if (rctx.availablePermissions.length > 0) {
    autoData.permissions = _.clone(rctx.availablePermissions)
  }
  if (typeof rctx.accessToken === 'string') {
    autoData.accessToken = rctx.accessToken
  }
  // 自动参数：设置请求相关额外信息
  if (opts.flagForNew) autoData.isNew = requestMethodName === 'POST'
  // 自动参数：appid
  if (rctx.appid !== undefined) {
    const app = await rctx.getCurrentAppliaction(true)
    if (app) autoData.appid = app.id
  }
  // 自动参数：wallet 名称
  const wallet = await rctx.getCurrentWallet(true)
  if (wallet) autoData.wallet = wallet.name
  // 自动参数：chain路由
  const chainKey = await rctx.getCurrentChainKey(true)
  if (chainKey !== undefined) autoData.chain = chainKey
  // 自动参数：coinName 通常为type or token字段
  const token = await rctx.getCurrentToken(true)
  if (token !== undefined) {
    autoData.type = _.toUpper(token.coreType)
    autoData.token = _.toUpper(token.coinName)
  }
  const preset = opts.preset || {}
  // 设置 keys，以便于后续区别
  autoData.presetKeys = _.keys(preset)
  autoData.autoKeys = _.keys(autoData)
  return Object.assign(data, autoData, preset)
}

/**
 * 构造express的route handler
 * @param {String} methodName methods目录下的方法名,核心处理函数
 * @param {String|Function} methodNsp 指定分发的namespace, enum类型|指定Namespace|特定函数
 * @param {Object|Function} dataRule 数据权限验证规则
 * @param {Object} opts 额外配置参数
 * @param {Object} [opts.preset=undefined] 预定义对象
 * @param {Boolean} [opts.allowUnruled=false] 允许rule以外的key在data之中
 * @param {Boolean} [opts.flagForNew=false] 当POST请求时，为data设置isNew标记为true，反之为false
 */
function buildMethodInvoker (methodName, methodNsp = NSP_TYPES.NULL, dataRule = null, opts = {}) {
  /**
   * @param {String} requestMethodName 调用的方法名称
   * @param {Context} rctx 请求上下文
   */
  const invoker = async (requestMethodName, rctx) => {
    if (!(rctx instanceof Context)) {
      throw new NBError(10002, 'missing request context.')
    }
    const data = await parseMethodArgs(requestMethodName, rctx, dataRule, opts)
    // 设置正确的namespace
    let namespace
    const invokeOpts = {}
    switch (methodNsp) {
      case NSP_TYPES.NULL:
        namespace = null
        break
      case NSP_TYPES.COIN_TYPE:
        const token = await rctx.getCurrentToken()
        if (!token) throw new NBError(10002, 'missing field: type')
        namespace = token.chainKey
        break
      case NSP_TYPES.ORDER:
        namespace = await rctx.getCurrentChainKey()
        if (!namespace && data.id !== undefined) {
          const Order = jadepool.getModel(consts.MODEL_NAMES.ORDER)
          const order = await Order.findOne({ id: data.id }).exec()
          if (order === null) {
            throw new NBError(40400, `field: id(${data.id})`)
          }
          const chainCfg = await jadepool.configSrv.loadChainCfg(order.type)
          if (!chainCfg) {
            throw new NBError(40400, `type: ${order.type} for order(${data.id})`)
          }
          namespace = chainCfg.key
        }
        if (!namespace) throw new NBError(10002, 'failed to find blockchain by order')
        break
      case NSP_TYPES.CHAIN_KEY:
        const chainKey = await rctx.getCurrentChainKey()
        if (!chainKey) throw new NBError(10002, 'missing param: chain')
        namespace = chainKey
        if (typeof data.sid === 'string') {
          invokeOpts.socketId = data.sid
        }
        break
      case NSP_TYPES.AGENT:
        namespace = NSP_TYPES.AGENT
        if (data.sid) {
          if (data.sid === 'app' || data.sid === 'master') {
            namespace = null
          } else {
            invokeOpts.socketId = data.sid
          }
        }
        break
      default:
        namespace = typeof methodNsp === 'function' ? (await methodNsp(rctx)) : methodNsp
        invokeOpts.isSimple = true
        break
    }
    // 进行函数调用
    return jadepool.invokeMethod(methodName, namespace, data || {}, invokeOpts)
  }
  return invoker
}

/**
 * 构造express的route handler
 * @param {String} methodName methods目录下的方法名,核心处理函数
 * @param {String|Function} methodNsp 指定分发的namespace, enum类型|指定Namespace|特定函数
 * @param {Object|Function} dataRule 数据权限验证规则
 * @param {Object} opts 额外配置参数
 * @param {Object} [opts.preset=undefined] 预定义对象
 * @param {Boolean} [opts.allowUnruled=false] 允许rule以外的key在data之中
 * @param {Boolean} [opts.flagForNew=false] 当POST请求时，为data设置isNew标记为true，反之为false
 * @param {String} [opts.responseMode='json'] 结果处理函数，默认为json
 */
export function buildHandler (methodName, methodNsp = NSP_TYPES.NULL, dataRule = null, opts = {}) {
  const func = async ctx => {
    const rctx = ctx.state.context
    if (!(rctx instanceof Context)) {
      return ctx.throw(400, new NBError(10002, 'missing request context.'))
    }
    const invoker = buildMethodInvoker(methodName, methodNsp, dataRule, opts)
    let result
    try {
      result = await invoker(ctx.method, rctx)
    } catch (err) {
      return ctx.throw(500, err)
    }

    // 根据res模式返回结果
    if (opts.responseMode === RES_MODES.DOWNLOAD) {
      const filepath = _.isObject(result) ? result.filepath : result
      if (typeof filepath !== 'string') {
        throw new Error(10002, `result should be string for MODE(${opts.responseMode})`)
      }
      try {
        fs.accessSync(filepath)
      } catch (err) {
        throw new NBError(404, 'download file not exist!')
      }
      ctx.attachment(filepath)
      await sendfile(ctx, filepath)
    } else {
      // 返回最终的result
      ctx.response.status = 200
      ctx.response.type = 'application/json'
      ctx.response.body = result || {}
    }
  }
  func.desc = methodName
  return func
}
