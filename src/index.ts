#!/usr/bin/env ts-node
import Logger from '@jadepool/logger'
import jadepool from '@jadepool/instance'
import consts from '@jadepool/consts'
import { KoaService } from '@jadepool/service-http'

import Context from './context'
import router from './routes'

const logger = Logger.of('Mintcraft', 'NFT gateway')

async function run (): Promise<void> {
  await jadepool.initialize(new Context())

  logger.tag('Context Built').logObj(jadepool.env)
  // http 服务
  const appSrv: KoaService = (await jadepool.registerService(consts.SERVICE_NAMES.KOA, {
    listenManually: true,
    router: router
  })) as KoaService

  // socket.io服务
  await jadepool.registerService(consts.SERVICE_NAMES.SOCKET_IO)

  // 启动listen
  await appSrv.listen()
}

// eslint-disable-next-line no-void
void run()
