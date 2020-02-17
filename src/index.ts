import { config } from 'dotenv'
import api from './api'

(async () => {
  config()

  const server = api()

  await server.listen(process.env.PORT)

  console.log('Listening')
})()
