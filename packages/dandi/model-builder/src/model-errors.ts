import { AppError, Constructor, CUSTOM_INSPECTOR } from '@dandi/common'

import { ModelError } from './model-error'
import { ModelErrorKey } from './model-error-key'

export interface ModelErrorEntry {
  errorData: any
  message?: string
}

export type MemberModelErrorInfo = string | ModelErrorEntry

export type MemberModelErrorsEntry = true | MemberModelErrorInfo | MemberModelErrorInfo[]

export type MemberModelErrors = { [TErrorKey in ModelErrorKey]?: MemberModelErrorsEntry }

export type ModelErrors = {
  [memberPath: string]: MemberModelErrors
}

export interface ModelErrorsStatic {
  create(targetType: Constructor, errors: ModelError[]): ModelErrors
}

function getErrorEntry(error: ModelError): true | MemberModelErrorInfo {
  if (!error.message && !error.errorData) {
    return true
  }
  if (error.message && error.errorData) {
    return {
      errorData: error.errorData,
      message: error.message,
    }
  }
  return error.message || { errorData: error.errorData }
}

function updateEntry(
  existing: MemberModelErrorsEntry,
  next: true | MemberModelErrorInfo,
): MemberModelErrorsEntry {
  if (next === true) {
    return existing || next
  }
  if (!existing || existing === true) {
    return next
  }
  if (Array.isArray(existing)) {
    existing.push(next)
    return existing
  }
  return [existing, next]
}

function getMessagesFromEntry(entry: MemberModelErrorsEntry): string[] {
  if (Array.isArray(entry)) {
    return entry
      .map(item => typeof item === 'string' ? item : item.message)
      .filter(msg => !!msg)
  }

  if (typeof entry === 'string') {
    return [entry]
  }

  if (typeof entry === 'object' && entry.message) {
    return [entry.message]
  }

  return []
}

function formatErrorKey(errorKey: string): string {
  return `(${errorKey})`
}

interface MemberModelMessageInfo {
  errorKey: string
  messages?: string[]
}

function getMemberModelMessages(memberErrors: MemberModelErrors): MemberModelMessageInfo[] {
  return [...Object.entries(memberErrors)].map(([errorKey, errorEntry]) => {
    const messages = getMessagesFromEntry(errorEntry)
    return { errorKey, messages }
  })
}

function formatErrorMessageInfo(info: MemberModelMessageInfo, level: number = 0): string {
  if (!info.messages.length) {
    return formatErrorKey(info.errorKey)
  }
  if (info.messages.length === 1) {
    return `${formatErrorKey(info.errorKey)} ${info.messages[0]}`
  }
  return [
    formatErrorKey(info.errorKey),
    ...info.messages.map(msg => AppError.indentLine(msg, level + 1)),
  ].join('\n')
}

function formatMemberMessageInfo(memberKey: string, messages: MemberModelMessageInfo[], level = 0): string {
  if (messages.length === 1) {
    return AppError.indentLine(`${memberKey} ${formatErrorMessageInfo(messages[0], level)}`, level)
  }
  if (messages.every(info => !info.messages.length)) {
    return AppError.indentLine(`${memberKey} ${formatErrorKey(messages.map(msg => msg.errorKey).join(', '))}`, level)
  }
  return [
    AppError.indentLine(memberKey, level),
    ...messages.map(info => AppError.indentLine(formatErrorMessageInfo(info, level + 1), level + 1)),
  ].join('\n')
}

function generateModelErrorsMessage(targetType: Constructor, modelErrors: ModelErrors): string {
  const memberMessages = [...Object.entries(modelErrors)].reduce((result, [memberKey, memberErrors]) => {
    const memberModelMessages = getMemberModelMessages(memberErrors)
    result.push([memberKey, memberModelMessages])
    return result
  }, [] as [string, MemberModelMessageInfo[]][])

  const [firstMessageMemberKey, firstErroredMemberMessages] = memberMessages[0]
  const [firstErroredMemberErrorMessageInfo] = firstErroredMemberMessages
  const hasMultipleErrors = memberMessages.length > 1 ||
    firstErroredMemberMessages.length > 1 ||
    firstErroredMemberErrorMessageInfo.messages.length > 1
  const preamble = `Error${hasMultipleErrors ? 's' : ''} converting source to model ${targetType.name}:`

  if (!hasMultipleErrors) {
    return `${preamble} ${firstMessageMemberKey} ${formatErrorMessageInfo(firstErroredMemberErrorMessageInfo)}`
  }
  if (memberMessages.length === 1) {
    return `${preamble} ${formatMemberMessageInfo(firstMessageMemberKey, firstErroredMemberMessages)}`
  }
  return [
    preamble,
    ...memberMessages.map(([memberKey, errorMessages]) => {
      return formatMemberMessageInfo(memberKey, errorMessages, 1)
    }),
  ].join('\n')
}

export const ModelErrors: ModelErrorsStatic = {
  create(targetType: Constructor, errors: ModelError[]): ModelErrors {
    if (!errors.length) {
      return undefined
    }

    const modelErrors = errors.reduce((result, error) => {
      const key = error.memberKey
      if (!result[key]) {
        result[key] = {}
      }

      const existing = result[key][error.errorKey]
      const entry = getErrorEntry(error)
      result[key][error.errorKey] = updateEntry(existing, entry)

      return result
    }, {})

    const toString = (): string => {
      return generateModelErrorsMessage(targetType, modelErrors)
    }

    return Object.defineProperties(modelErrors, {
      [CUSTOM_INSPECTOR]: {
        value: toString,
        configurable: false,
      },
      [Symbol.toStringTag]: {
        value: toString,
        configurable: false,
      },
      toString: {
        value: toString,
        configurable: false,
      },
    })
  },
}
