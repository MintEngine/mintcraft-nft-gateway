// import files
import '@koa'
import { File } from '@koa/multer'

// koa-bodyparser
declare module 'koa' {
  interface Request {
    body: string | Record<string, unknown>
    rawBody: string
    // multer upload
    file?: File
    files?: File[]
  }
}
