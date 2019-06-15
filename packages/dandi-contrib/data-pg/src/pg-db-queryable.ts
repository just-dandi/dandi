import { Constructor, Url, Uuid } from '@dandi/common'
import { DataPropertyMetadata, ModelUtil } from '@dandi/model'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { snakeCase } from 'change-case'
import { QueryResult } from 'pg'

import { PgDbMultipleResultsError, PgDbQueryError } from './pg-db-query-error'

export interface PgDbQueryableClient {
  query(cmd: string, args: any[]): Promise<QueryResult>
}

/**
 * @internal
 */
export class PgDbQueryableBase<TClient extends PgDbQueryableClient> {
  constructor(
    protected modelBuilder: ModelBuilder,
    protected modelBuilderOptions?: ModelBuilderOptions,
  ) {}

  protected async baseQuery(client: TClient, cmd: string, args: any[] = []): Promise<any[]> {
    let result: QueryResult
    if (args) {
      args.forEach((arg, index) => {
        args[index] = this.formatArg(arg)
      })
    }
    try {
      result = await client.query(cmd, args)
    } catch (err) {
      throw new PgDbQueryError(err)
    }
    return result.rows
  }

  protected async baseQueryModel<T>(client: TClient, model: Constructor<T>, cmd: string, args: any[]): Promise<T[]> {
    cmd = this.replaceSelectList(model, cmd)
    const result = await this.baseQuery(client, cmd, args)
    if (!result || !result.length) {
      return []
    }
    return result.map((item) => this.modelBuilder.constructModel(model, item, this.modelBuilderOptions))
  }

  protected async baseQueryModelSingle<T>(client: TClient, model: Constructor<T>, cmd: string, args: any[]): Promise<T> {
    const result = await this.baseQueryModel(client, model, cmd, args)
    if (!result || !result.length) {
      return undefined
    }
    if (result.length > 1) {
      throw new PgDbMultipleResultsError(cmd)
    }
    return result[0]
  }

  public replaceSelectList<T>(model: Constructor<T>, cmd: string): string {
    const ogSelectMatch = cmd.match(/select\s+([\w\s,._]+)\s+from/i)
    if (!ogSelectMatch) {
      return cmd
    }
    const ogSelect = ogSelectMatch[1].split(',').map((field) => field.trim())
    const tableMatch = cmd.match(/from\s+[\w._]+\s+(?:as\s+)?(\w+)/i)
    const table = tableMatch ? tableMatch[1] : null
    const joinMatches = cmd.match(/join\s+[\w._]+\s+(?:as\s+)?(\w+)\s+on/gi)
    const joins = joinMatches ? joinMatches.map((join) => join.match(/join\s+[\w._]+\s+(?:as\s+)?(\w+)/i)[1]) : []
    const aliases = (table ? [table] : []).concat(joins)
    if (!aliases.length) {
      return cmd
    }
    const toKeep = ogSelect.filter((select) => !aliases.includes(select))
    if (toKeep.length === ogSelect.length) {
      return cmd
    }

    const decoratorSelectList = ModelUtil.generatePathList(model, {
      formatter: snakeCase,
      recursionFilter: (meta: DataPropertyMetadata) => !meta.json,
    })
    const matchingDecoratorNames = decoratorSelectList.filter((path) =>
      aliases.find((alias) => path.startsWith(`${alias}.`)),
    )

    if (!matchingDecoratorNames.length) {
      return cmd
    }

    const newSelect = toKeep.concat(matchingDecoratorNames).map((field) => `    ${field} as "${field}"`)

    return cmd.replace(/select\s+([\w\s,._]+)\s+from/i, `select\n${newSelect.join(',\n')}\nfrom`)
  }

  private formatArg(arg: any): any {
    if (arg instanceof Uuid) {
      return `{${arg}}`
    }
    if (arg instanceof Url) {
      return arg.toString()
    }
    if (Array.isArray(arg)) {
      arg.forEach((subArg, index) => {
        arg[index] = this.formatArg(subArg)
      })
    }
    return arg
  }
}
