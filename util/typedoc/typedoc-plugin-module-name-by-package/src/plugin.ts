import { dirname } from 'path'

import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components'
import { Converter } from 'typedoc/dist/lib/converter/converter'
import { Context } from 'typedoc/dist/lib/converter/context'
import { ContainerReflection } from 'typedoc/dist/lib/models/reflections/container'
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract'
import { DeclarationReflection } from 'typedoc/dist/lib/models/reflections/declaration'

export const PLUGIN_NAME = 'module-name-by-package'

const MODULE_REFORMAT_PREFIX = 'packages/'
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

  onResolveBegin() {
    const packageModules = [...this.packageModules.values()]
    packageModules.forEach(module => {
      module.name = `@${module.name.substring(MODULE_REFORMAT_PREFIX.length + 1, module.name.length - MODULE_REFORMAT_SUFFIX.length - 1)}`
    })

    this.modules.forEach((module: DeclarationReflection) => {
      const packageModule = this.getPackageModule(module.originalName)
      if (!packageModule) {
        return
      }

      if (!packageModule.children) {
        packageModule.children = []
      }

      const originalParent = module.parent as ContainerReflection
      originalParent.children.splice(originalParent.children.indexOf(module), 1)
      packageModule.children.push(module)
      module.parent = packageModule

    })
  }

}
