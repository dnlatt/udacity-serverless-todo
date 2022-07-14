import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodos } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getTodos event', { event })

    const userId = event.requestContext.authorizer.principalId

    try {
      const items = await getTodos(userId)
      return {
        statusCode: CREATED_STATUS_CODE,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          items
        })
      }
    } catch(e) {

      logger.error('Error - getTodos: ' + e.message)

      return {
        statusCode: SERVER_ERROR_STATUS_CODE,
        body: e.message
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
