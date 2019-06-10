import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'

import { ProjectReflection } from 'typedoc'

import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components'
import { Converter } from 'typedoc/dist/lib/converter/converter'
import { Context } from 'typedoc/dist/lib/converter/context'
import { ContainerReflection } from 'typedoc/dist/lib/models/reflections/container'
import { Reflection } from 'typedoc/dist/lib/models/reflections/abstract'
import { DeclarationReflection } from 'typedoc/dist/lib/models/reflections/declaration'

export const PLUGIN_NAME = 'module-name-by-package'

const MODULE_REFORMAT_PREFIX = ''
const MODULE_REFORMAT_SUFFIX = '/index'

@Component({ name: PLUGIN_NAME })
export class ModuleNameByPackagePlugin extends ConverterComponent {

  private modules: DeclarationReflection[]
  private packageModules = new Map<string, DeclarationReflection>()
  private loadedFiles = new Map<string, string>()
  private loadedSections = new Map<string, string>()

  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_BEGIN]: this.onBegin,
      [Converter.EVENT_CREATE_DECLARATION]: this.onCreateDeclaration,
      [Converter.EVENT_RESOLVE_BEGIN]: this.onResolveBegin,
    })
  }

  onBegin() {
    this.modules = []
  }

  onCreateDeclaration(context: Context, reflection: Reflection, node?) {
    if (!node || !node.fileName) {
      return
    }
    if (node.fileName.endsWith('index.ts')) {
      this.packageModules.set(dirname(node.fileName), reflection as DeclarationReflection)
    } else {
      this.modules.push(reflection as DeclarationReflection)
    }
  }

  getPackageModule(filePath: string): DeclarationReflection {
    if (!filePath || filePath === '.' || filePath === '/') {
      return undefined
    }
    const dir = dirname(filePath)
    const dec = this.packageModules.get(dir)
    if (dec) {
      return dec
    }
    return this.getPackageModule(dir)
  }

  renamePackageModule(module: DeclarationReflection): void {
    const ogName = module.name
    module.name = `@${module.name.substring(MODULE_REFORMAT_PREFIX.length + 1, module.name.length - MODULE_REFORMAT_SUFFIX.length - 1)}`
    console.log(`${ogName} -> ${module.name}`)
  }

  loadInclude(includePath: string, section: string) {
    let content = this.loadedFiles.get(includePath)
    if (!content) {
      content = readFileSync(includePath, 'utf-8')
      this.loadedFiles.set(includePath, content)
    }
    if (!section) {
      return content
    }

    const sectionKey = [includePath, section].join('#')
    let sectionContent = this.loadedSections.get(sectionKey)
    if (!sectionContent) {
      const markerStart = content.indexOf(`# ${section}`)
      if (markerStart < 0) {
        throw new Error(`Could not find section "${section}" in file ${includePath}`)
      }
      const markerEnd = markerStart + section.length + 2
      const nextMarkerStart = content.indexOf('# ', markerEnd)
      sectionContent = content
        .substring(markerEnd, nextMarkerStart < 0 ? undefined : nextMarkerStart)
        .trim()
      this.loadedSections.set(sectionKey, sectionContent)
    }
    return sectionContent
  }

  getModuleDirectory(module: Reflection): string {
    if (module.sources && module.sources.length) {
      return dirname(module.sources[0].fileName)
    }
    return this.getModuleDirectory(module.parent)
  }

  importIncludedMarkdown(module: Reflection): void {
    if (!module.comment || !module.comment.hasVisibleComponent()) {
      return
    }
    const cwd = this.getModuleDirectory(module)

    if (module.comment.text) {
      module.comment.text = this.replaceWithMarkdown(cwd, module.comment.text)
    }
    if (module.comment.shortText) {
      module.comment.shortText = this.replaceWithMarkdown(cwd, module.comment.shortText)
    }
    if (module.comment.returns) {
      module.comment.returns = this.replaceWithMarkdown(cwd, module.comment.returns)
    }
    if (module.comment.tags) {
      // auto-import README.md content for each package
      module.comment.tags.forEach(tag => {
        tag.text = this.replaceWithMarkdown(cwd, tag.text)
      })
    }
  }

  replaceWithMarkdown(cwd: string, text: string): string {

    return text.replace(/\[\[include:[\w.\-_/]+?\.md(?:#[\w.\-:]+)?]]/g, (includeTag) => {
      const includePath = resolve(cwd, includeTag.match(/include:(.+\.md)/)[1])
      const sectionMatch = includeTag.match(/#([\w.\-:]+)/)
      const section = sectionMatch ? sectionMatch[1] : undefined
      const content = this.loadInclude(includePath, section)

      // convert `code` to symbol references for README files
      if (includePath.endsWith('README.md')) {
        return content.replace(/`[\w@./]+?`/g, (codeRef) => `[[${codeRef.substring(1, codeRef.length - 1)}]]`)
      }
      return content
    })
  }

  fixProjectMarkdownPaths(project: ProjectReflection): void {
    project.readme = project.readme.replace(/\[[@\w./\-]+]\(\.\/packages\/[\w./-]+\)/g, link => {
      const packageName = link.match(/\.\/packages\/([\w./\-]+)/)[1]
      return `[[@${packageName}]]`
    })
  }

  isDecoratorByComment(ref: Reflection): boolean {
    return ref.comment && ref.comment.tags && !!ref.comment.tags.find(tag => tag.tagName === 'decorator')
  }

  isDecorator(ref: Reflection): boolean {
    if (!(ref as any).signatures) {
      return this.isDecoratorByComment(ref)
    }
    return !!(ref as DeclarationReflection).signatures.find(sig => {
      if (this.isDecoratorByComment(ref)) {
        return true
      }
      if (!sig.type || !(sig.type as any).name) {
        return false
      }
      return (sig.type as any).name.endsWith('Decorator')
    })
  }

  execOnCommentText(module: Reflection, fn: (module: Reflection, text: string) => string): void {
    if (!module.comment || !module.comment.hasVisibleComponent()) {
      return
    }
    if (module.comment.text) {
      module.comment.text = fn(module, module.comment.text)
    }
    if (module.comment.shortText) {
      module.comment.shortText = fn(module, module.comment.shortText)
    }
    if (module.comment.returns) {
      module.comment.returns = fn(module, module.comment.returns)
    }
    if (module.comment.tags) {
      // auto-import README.md content for each package
      module.comment.tags.forEach(tag => {
        tag.text = fn(module, tag.text)
      })
    }
  }

  transformSeeReferences(module: Reflection, text: string): string {
    return text.replace(/{@see \w+(?:<\w+>)?}/g, ref =>
      ref.replace(/{@see (\w+)(?:<\w+>)?}/, (match, type, gType) =>
        `[[${type}${gType ? `<[[${gType}]]>`: ''}]]`
      )
    )
  }

  onResolveBegin(context: Context) {
    this.fixProjectMarkdownPaths(context.project)
    const packageModules = [...this.packageModules.values()]
    packageModules.forEach(module => {
      this.renamePackageModule(module)
    })

    for(const ref of Object.values(context.project.reflections)) {
      this.importIncludedMarkdown(ref)
      this.execOnCommentText(ref, this.transformSeeReferences.bind(this))

      // rename decorators
      if (this.isDecorator(ref)) {
        ref.name = `@${ref.name}()`
      }
    }

    this.modules.forEach((module: DeclarationReflection) => {
      const packageModule = this.getPackageModule(module.originalName)
      if (!packageModule) {
        return
      }

      if (!packageModule.children) {
        packageModule.children = []
      }

      // move the exports from each module file into the package declaration
      // results in the exports being listed under the package instead of their declaring file
      while(module.children && module.children.length) {
        const ref = module.children.shift()
        ref.parent = packageModule
        packageModule.children.push(ref)
      }

      // remove the now empty individual module file declaration
      const originalParent = module.parent as ContainerReflection
      originalParent.children.splice(originalParent.children.indexOf(module), 1)

    })
  }

}
