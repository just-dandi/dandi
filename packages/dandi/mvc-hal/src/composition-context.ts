import { Disposable } from '@dandi/common'
import { Repository } from '@dandi/core/internal'
import { SELF_RELATION } from '@dandi/hal'

export type ParentCompositionContext = { [TProp in keyof CompositionContext]?: CompositionContext[TProp] }

export class CompositionContext implements Disposable {
  public readonly repositories: Repository[]
  public readonly relStack: string[]
  public readonly embeddedRels: string[]
  public readonly repository: Repository
  public readonly path: string

  public static for(rel: string, path: string, embeddedRels: string[]): CompositionContext {
    return new CompositionContext(rel, path, { embeddedRels })
  }

  constructor(rel: string, path: string, parent?: ParentCompositionContext) {
    this.repository = Repository.for(this)
    this.path = path
    if (parent) {
      this.repositories = (parent.repositories || []).slice(0)
      this.relStack = (parent.relStack || []).slice(0)
      this.relStack.push(rel)
    } else {
      this.repositories = []
      this.relStack = [rel]
    }
    if (rel === SELF_RELATION) {
      this.embeddedRels = ((parent && parent.embeddedRels) || []).slice(0)
    } else {
      this.embeddedRels = ((parent && parent.embeddedRels) || []).reduce((result, rel) => {
        const nextDotIndex = rel.indexOf('.')
        if (nextDotIndex < 0) {
          return result
        }
        const nextSegment = rel.substring(0, nextDotIndex)
        if (rel === nextSegment || rel.startsWith(`${nextSegment}.`)) {
          result.push(rel.substring(nextDotIndex + 1))
        }
        return result
      }, [])
    }
    this.repositories.push(this.repository)
  }

  public childFor(rel: string): CompositionContext {
    return new CompositionContext(rel, null, this)
  }

  public dispose(reason: string): void {
    this.repository.dispose(reason)
  }
}
