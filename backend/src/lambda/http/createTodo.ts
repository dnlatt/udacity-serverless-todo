import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateTodoRequest } from '../../models/requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';


const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('createTodo event', { event })

    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId = event.requestContext.authorizer.principalId
      const response = await createTodo(userId, newTodo)

      return {
        statusCode: CREATED_STATUS_CODE,
        body: JSON.stringify({
          item: {
            ...response
          }
        })
      }

    } catch (e) {

      logger.error('Error - createTodo: ' + e.message)

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
