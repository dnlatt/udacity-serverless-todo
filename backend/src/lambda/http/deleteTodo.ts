import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { NO_CONTENT, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('deleteTodo event', { event })

    try {

      const todoId = event.pathParameters.todoId
      const userId = event.requestContext.authorizer.principalId

      await deleteTodo(userId, todoId)

      return {
        statusCode: NO_CONTENT,
        body: ''
      }

    }catch(e) {
      logger.error('Error - deleteTodo: ' + e.message)

      return {
        statusCode: SERVER_ERROR_STATUS_CODE,
        body: e.message
      }
    }

    
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
