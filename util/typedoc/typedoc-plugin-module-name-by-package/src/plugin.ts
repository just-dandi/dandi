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

  importIncludedMarkdown(module: DeclarationReflection): void {
    // auto-import README.md content for each package
    if (module.comment && module.comment.tags && module.comment.tags.length) {
      module.comment.tags.forEach(tag => {
        tag.text = tag.text.replace(/\[\[include:[\w.-_/]+?\.md]]/g, (include) => {
          const includePath = resolve(dirname(module.originalName), include.match(/include:(.+\.md)/)[1])
          const mdContent = readFileSync(includePath, 'utf-8')

          // convert `code` to symbol references for README files
          if (includePath.endsWith('README.md')) {
            return mdContent.replace(/`[\w@./]+?`/g, (codeRef) => `[[${codeRef.substring(1, codeRef.length - 1)}]]`)
          }
          return mdContent
        })
      })
    }
  }

  fixProjectMarkdownPaths(project: ProjectReflection): void {
    project.readme = project.readme.replace(/\[[@\w./-]+]\(\.\/packages\/[\w./-]+\)/g, link => {
      const packageName = link.match(/\.\/packages\/([\w./-]+)/)[1]
      return `[[@${packageName}]]`
    })
  }

  onResolveBegin(context: Context) {
    this.fixProjectMarkdownPaths(context.project)
    const packageModules = [...this.packageModules.values()]
    packageModules.forEach(module => {
      this.renamePackageModule(module)
      this.importIncludedMarkdown(module)
    })

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
