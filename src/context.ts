import config from 'config'
import jadepool from '@jadepool/instance'
// import * as consts from '@jadepool/consts'

import methedFunc from './methods'

class Context extends jadepool.Context {
  constructor () {
    super(
      'NFT-gateway',
      process.env.npm_package_version ?? process.env.version ?? process.env.VERSION ?? '0.1.0',
      methedFunc,
      config
    )
  }
}

export default Context
