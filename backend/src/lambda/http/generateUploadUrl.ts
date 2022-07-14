import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  generateSignedUrl,
  updateAttachmentUrl
} from '../../businessLogic/todos'
import CustomError from '../../utils/CustomError'
import { createLogger } from '../../utils/logger'
import { OK_STATUS_CODE } from '../../utils/constants';

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('generateUploadUrl event', { event })

    const todoId = event.pathParameters.todoId
    const userId = event.requestContext.authorizer.principalId
    const attachmentId = uuid.v4()

    const uploadUrlRes = generateSignedUrl(attachmentId)

    logger.info('Generating signed url ', uploadUrlRes)

    if (uploadUrlRes instanceof CustomError) {
      return {
        statusCode: uploadUrlRes.code,
        body: JSON.stringify({ msg: uploadUrlRes.message })
      }
    }

    const uploadAttachmentUrlRes = await updateAttachmentUrl(
      userId,
      todoId,
      attachmentId
    )
    if (uploadAttachmentUrlRes instanceof CustomError) {
      return {
        statusCode: uploadAttachmentUrlRes.code,
        body: JSON.stringify({ msg: uploadAttachmentUrlRes.message })
      }
    }
    return {
      statusCode: OK_STATUS_CODE,
      body: JSON.stringify({ uploadUrl: uploadUrlRes })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
