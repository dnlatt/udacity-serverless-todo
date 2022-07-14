import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../models/requests/UpdateTodoRequest'

import { createLogger } from '../../utils/logger'
import { CREATED_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('updateTodo event', { event })

    try {
      const todoId = event.pathParameters.todoId
      const userId = event.requestContext.authorizer.principalId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

      await updateTodo(userId, todoId, updatedTodo)

      return {
        statusCode: CREATED_STATUS_CODE,
        body: ''
      }

    } catch (e) {
      logger.error('Error - updateTodo: ' + e.message)

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
