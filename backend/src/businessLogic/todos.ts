import 'source-map-support/register'
import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todos'

import { getUploadUrl, getAttachmentUrl } from '../storageLayer/todos'

import { TodoItem } from '../models/todos/TodoItem'
import { TodoUpdate } from '../models/todos/TodoUpdate'
import { CreateTodoRequest } from '../models/requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../models/requests/UpdateTodoRequest'

import { createLogger } from '../utils/logger'
import CustomError from '../utils/CustomError'
import {FORBIDDEN_STATUS_CODE, SERVER_ERROR_STATUS_CODE, PAGE_NOT_FOUND_STATUS_CODE} from '../utils/constants'

const todosAccess = new TodosAccess()
const logger = createLogger('businessLogic-todos')

export async function getTodos(
  userId: string
): Promise<TodoItem[] | CustomError> {
  try {
    const todos = await todosAccess.getTodosByUserId(userId)
    logger.info(`Todos of user: ${userId}`, JSON.stringify(todos))
    return todos
  } catch (error) {
    const errorMsg = `Error occurred when getting user's todos`
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem | CustomError> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  try {
    await todosAccess.createTodoItem(newItem)
    logger.info(`Todo ${todoId} for user ${userId}:`, {
      userId,
      todoId,
      todoItem: newItem
    })
    return newItem
  } catch (error) {
    const errorMsg = `Error occurred when creating user todo item`
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void | CustomError> {
  try {
    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new CustomError('Item not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to update item', FORBIDDEN_STATUS_CODE)
    }

    await todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
    logger.info(`Updating todo ${todoId} for user ${userId}:`, {
      userId,
      todoId,
      todoUpdate: updateTodoRequest
    })
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when updating todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void | CustomError> {
  try {
    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new CustomError('Item not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to delete item', FORBIDDEN_STATUS_CODE)
    }

    await todosAccess.deleteTodoItem(todoId)

    logger.info(`Deleting todo ${todoId} for user ${userId}:`, {
      userId,
      todoId
    })
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<void | CustomError> {
  try {
    const attachmentUrl = await getAttachmentUrl(attachmentId)

    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new CustomError('Item not found', PAGE_NOT_FOUND_STATUS_CODE)

    if (item.userId !== userId) {
      throw new CustomError('User is not authorized to update item', FORBIDDEN_STATUS_CODE)
    }

    await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)

    logger.info(
      `Updating todo ${todoId} with attachment URL ${attachmentUrl}`,
      {
        userId,
        todoId
      }
    )
  } catch (error) {
    if (!error.code) {
      error.code = SERVER_ERROR_STATUS_CODE
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export function generateSignedUrl(attachmentId: string): string | CustomError {
  try {
    const uploadUrl = getUploadUrl(attachmentId)
    logger.info(`Presigned Url is generated: ${uploadUrl}`)

    return uploadUrl
  } catch (error) {
    const errorMsg = 'Error occurred when generating presigned Url to upload'
    logger.error(errorMsg)
    return new CustomError(errorMsg, SERVER_ERROR_STATUS_CODE)
  }
}
