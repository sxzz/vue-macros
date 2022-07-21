import { compileScript } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { DEFINE_EMITS, DEFINE_MODEL, DEFINE_PROPS } from './constants'
import { isCallOf, parseSFC } from './utils'
import type {
  LVal,
  Node,
  ObjectPattern,
  Statement,
  TSInterfaceBody,
  TSTypeLiteral,
} from '@babel/types'

export const transform = (code: string, filename: string) => {
  let hasDefineProps = false
  let hasDefineEmits = false
  let hasDefineModelCall = false
  let propsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let propsDestructureDecl: Node | undefined
  let propsIdentifier: string | undefined
  let emitsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let modelTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let modelIdentifier: string | undefined
  let modelDestructureDecl: ObjectPattern | undefined

  function processDefinePropsOrEmits(node: Node, declId?: LVal) {
    let type: 'props' | 'emits'
    if (isCallOf(node, DEFINE_PROPS)) {
      type = 'props'
    } else if (isCallOf(node, DEFINE_EMITS)) {
      type = 'emits'
    } else {
      return false
    }
    const fnName = type === 'props' ? DEFINE_PROPS : DEFINE_EMITS

    if (type === 'props') hasDefineProps = true
    else hasDefineEmits = true

    if (node.arguments[0]) {
      throw new SyntaxError('error: 2')
    }

    const typeDeclRaw = node.typeParameters?.params?.[0]
    if (!typeDeclRaw) {
      throw new SyntaxError('Error: 3')
    }
    const typeDecl = resolveQualifiedType(
      typeDeclRaw,
      (node) => node.type === 'TSTypeLiteral'
    ) as TSTypeLiteral | TSInterfaceBody | undefined

    if (!typeDecl) {
      throw new Error(
        `type argument passed to ${fnName}() must be a literal type, ` +
          `or a reference to an interface or literal type.`
      )
    }

    if (type === 'props') propsTypeDecl = typeDecl
    else emitsTypeDecl = typeDecl

    if (declId) {
      if (declId.type === 'ObjectPattern') {
        propsDestructureDecl = declId
      } else {
        propsIdentifier = scriptSetup.loc.source.slice(
          declId.start!,
          declId.end!
        )
      }
    }

    return true
  }

  function processDefineModel(node: Node, declId?: LVal) {
    if (!isCallOf(node, DEFINE_MODEL)) {
      return false
    }

    if (hasDefineModelCall) {
      throw new SyntaxError(`duplicate ${DEFINE_MODEL}() call`)
    }
    hasDefineModelCall = true

    const propsTypeDeclRaw = node.typeParameters?.params[0]
    if (!propsTypeDeclRaw) {
      throw new SyntaxError('Error: 1')
    }
    modelTypeDecl = resolveQualifiedType(
      propsTypeDeclRaw,
      (node) => node.type === 'TSTypeLiteral'
    ) as TSTypeLiteral | TSInterfaceBody | undefined

    if (!modelTypeDecl) {
      throw new Error(
        `type argument passed to ${DEFINE_MODEL}() must be a literal type, ` +
          `or a reference to an interface or literal type.`
      )
    }

    if (declId) {
      if (declId.type === 'ObjectPattern') {
        modelDestructureDecl = declId
        for (const property of declId.properties) {
          if (property.type === 'RestElement') {
            throw new SyntaxError('not supported')
          }
        }
      } else {
        modelIdentifier = scriptSetup.loc.source.slice(
          declId.start!,
          declId.end!
        )
      }
    }

    return true
  }

  function resolveQualifiedType(
    node: Node,
    qualifier: (node: Node) => boolean
  ) {
    if (qualifier(node)) {
      return node
    }
    if (
      node.type === 'TSTypeReference' &&
      node.typeName.type === 'Identifier'
    ) {
      const refName = node.typeName.name
      const isQualifiedType = (node: Node): Node | undefined => {
        if (
          node.type === 'TSInterfaceDeclaration' &&
          node.id.name === refName
        ) {
          return node.body
        } else if (
          node.type === 'TSTypeAliasDeclaration' &&
          node.id.name === refName &&
          qualifier(node.typeAnnotation)
        ) {
          return node.typeAnnotation
        } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          return isQualifiedType(node.declaration)
        }
      }
      const body = sfc.scriptSetup!.scriptSetupAst!
      for (const node of body) {
        const qualified = isQualifiedType(node)
        if (qualified) {
          return qualified
        }
      }
    }
  }

  function extractRuntimeProps(
    node: TSTypeLiteral | TSInterfaceBody
  ): Record<string, string> {
    const members = node.type === 'TSTypeLiteral' ? node.members : node.body
    const map: Record<string, string> = {}
    for (const m of members) {
      if (
        (m.type === 'TSPropertySignature' || m.type === 'TSMethodSignature') &&
        m.key.type === 'Identifier'
      ) {
        const value = scriptSetup.loc.source.slice(
          m.typeAnnotation!.start!,
          m.typeAnnotation!.end!
        )
        map[m.key.name] = value
      }
    }
    return map
  }

  if (!code.includes(DEFINE_MODEL)) return

  const sfc = parseSFC(code, filename)
  if (!sfc.scriptSetup) return

  if (!sfc.scriptSetup.scriptSetupAst) {
    sfc.scriptSetup = compileScript(sfc, {
      id: filename,
    })
  }
  const { scriptSetup } = sfc
  const startOffset = scriptSetup.loc.start.offset
  // const endOffset = scriptSetup.loc.end.offset

  const s = new MagicString(code)

  for (const node of scriptSetup.scriptSetupAst as Statement[]) {
    if (node.type === 'ExpressionStatement') {
      processDefinePropsOrEmits(node.expression)
      if (processDefineModel(node.expression)) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      }
    }

    if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total

      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (decl.init) {
          processDefinePropsOrEmits(decl.init, decl.id)

          if (processDefineModel(decl.init, decl.id)) {
            if (left === 1) {
              s.remove(node.start! + startOffset, node.end! + startOffset)
            } else {
              let start = decl.start! + startOffset
              let end = decl.end! + startOffset
              if (i < total - 1) {
                // not the last one, locate the start of the next
                end = node.declarations[i + 1].start! + startOffset
              } else {
                // last one, locate the end of the prev
                start = node.declarations[i - 1].end! + startOffset
              }
              s.remove(start, end)
              left--
            }
          }
        }
      }
    }
  }

  if (!modelTypeDecl) return

  if (modelTypeDecl.type !== 'TSTypeLiteral') {
    throw new SyntaxError(
      `type argument passed to ${DEFINE_MODEL}() must be a literal type, or a reference to an interface or literal type.`
    )
  }

  const map = extractRuntimeProps(modelTypeDecl)

  const propsText = Object.entries(map)
    .map(([key, value]) => `${key}${value}`)
    .join('\n')

  const emitsText = Object.entries(map)
    .map(([key, value]) => `(evt: 'update:${key}', value${value}): void`)
    .join('\n')

  if (hasDefineProps) {
    s.appendLeft(startOffset + propsTypeDecl!.start! + 1, `${propsText}\n`)
    if (propsDestructureDecl && modelDestructureDecl)
      for (const property of modelDestructureDecl.properties) {
        const text = code.slice(
          startOffset + property.start!,
          startOffset + property.end!
        )
        s.appendLeft(startOffset + propsDestructureDecl.start! + 1, `${text}, `)
      }
  } else {
    let text = ''
    if (modelIdentifier) text = modelIdentifier
    else if (modelDestructureDecl)
      text = code.slice(
        startOffset + modelDestructureDecl.start!,
        startOffset + modelDestructureDecl.end!
      )

    s.appendLeft(
      startOffset,
      `${text ? `const ${text} = ` : ''}defineProps<{
  ${propsText}
}>();\n`
    )
  }
  if (hasDefineEmits) {
    s.appendLeft(startOffset + emitsTypeDecl!.start! + 1, `${emitsText}\n`)
  } else {
    s.appendLeft(
      startOffset,
      `const _${DEFINE_MODEL}_emit = defineEmits<{
  ${emitsText}
}>();\n`
    )
  }

  return {
    code: s.toString(),
    get map() {
      return s.generateMap()
    },
  }
}
