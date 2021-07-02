import Logger from '@jadepool/logger'
import jadepool from '@jadepool/instance'
// import * as consts from '@jadepool/consts'
import Context from './context'

const logger = Logger.of('Mintcraft', 'NFT gateway')

async function run (): Promise<void> {
  await jadepool.initialize(new Context())
  // const serviceKey = jadepool.env.processKey
  logger.tag('Context Built').logObj(jadepool.env)
}

if (require.main === module) {
  // eslint-disable-next-line no-void
  void run()
}
