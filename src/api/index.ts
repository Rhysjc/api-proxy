import { IncomingMessage, ServerResponse } from 'http'
import micro, { send, json } from 'micro'
import axios, { Method, AxiosError } from 'axios'
import responses from '../responses'

const buildUrl = (req: IncomingMessage) => {
  let { url } = req

  if (!url) {
    throw new Error('No URL')
  }

  url = url.replace(`http://localhost:${process.env.PORT}`, '')

  return `${process.env.API_URL}${url}`
}

const setHeaders = (headers: { [header: string]: string }, res: ServerResponse) => {
  Object.keys(headers).forEach((header) => {
    res.setHeader(header, headers[header])
  })
}

const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, headers } = req

  // The host header causes issues with SSL
  delete headers.host

  if (!method) {
    return send(res, 500)
  }

  let body

  if (method === 'POST' || method === 'PATCH') {
    body = await json(req)
  }

  const { data, headers: responseHeaders } = await axios({
    url: buildUrl(req),
    method: method as Method,
    headers,
    data: body,
  })

  setHeaders(responseHeaders, res)

  return send(res, 200, data)
}

const handleError = (error: AxiosError, req: IncomingMessage, res: ServerResponse) => {
  if (error.response) {
    const { status } = error.response

    if (status === 404 || status === 500) {
      return responses(req, res)
    }

    return send(res, status)
  }

  return send(res, 500)
}

export default () => micro(async (req, res) => {
  try {
    await handleRequest(req, res)
  } catch (e) {
    handleError(e, req, res)
  }

  return null
})
