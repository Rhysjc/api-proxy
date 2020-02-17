import { IncomingMessage, ServerResponse } from 'http'
import { get } from 'lodash'
import { send } from 'micro'
import responses from './registry'

export default async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    return send(res, 500)
  }

  let url = req.url.replace(`http://localhost:${process.env.PORT}`, '')

  const queryIndex = url.indexOf('?')

  // Remove query string, just have applications/products now
  url = url.slice(1, queryIndex >= 0 ? queryIndex : undefined)

  // applications/products becomes applications.products
  const parts = url.split('/').join('.')

  const response = get(responses, parts)

  if (response) {
    send(res, 200, response)
  }

  return send(res, 404)
}
