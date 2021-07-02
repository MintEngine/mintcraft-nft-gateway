import _ from 'lodash'
import { NBError } from '@jadepool/types'
import Logger from '@jadepool/logger'

const logger = Logger.of('Methods')

/**
 * @param methodName 调用的方法名
 * @param args 参数名
 * @param ws 调用该方法的socketClient
 */
export default async (methodName: string, namespace: string | undefined, args: object = {}): Promise<any> => {
  const callMethodKey = `${methodName}${typeof namespace === 'string' ? `(${namespace})` : ''}`
  // 进行函数调用
  try {
    let functionImpl = await import(`./${_.kebabCase(methodName)}`)
    if (typeof functionImpl.default === 'function') {
      functionImpl = functionImpl.default
    }
    if (typeof functionImpl === 'function') {
      logger.tag(`Invoke:${callMethodKey}`).logObj(args)
      return functionImpl(args)
    } else {
      throw new NBError(404, 'method should be a function')
    }
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new NBError(404, `missing method ${methodName}.`)
    } else {
      throw err
    }
  }
}
