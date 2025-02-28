import { HELPER_PREFIX } from '@vue-macros/common'
import type { TransformOptions } from '.'

export function getGlobalTypes(options: TransformOptions): string {
  const defineSlots = options.defineSlots.alias
    .flatMap((alias) => [
      `declare function ${alias}<T extends Record<string, any>>(): Partial<T>;`,
      `declare function ${alias}<T extends Record<string, any>>(slots: T): T;\n`,
    ])
    .join('')
  const defineExpose = options.defineExpose.alias
    .map(
      (alias) =>
        `declare function ${alias}<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): Exposed;`,
    )
    .join('')
  const defineStyle = options.defineStyle.alias
    .map(
      (alias) =>
        `declare const ${alias}: { <T>(...args: ${HELPER_PREFIX}StyleArgs): T; scss: <T>(...args: ${HELPER_PREFIX}StyleArgs)=> T; sass: <T>(...args: ${HELPER_PREFIX}StyleArgs)=> T; stylus: <T>(...args: ${HELPER_PREFIX}StyleArgs)=> T; less: <T>(...args: ${HELPER_PREFIX}StyleArgs)=> T; postcss: <T>(...args: ${HELPER_PREFIX}StyleArgs)=> T };\n`,
    )
    .join('')
  const defineModel = options.defineModel.alias
    .map((alias) =>
      alias === 'defineModel' ? 'defineModel' : `defineModel: ${alias}`,
    )
    .join(', ')
  const defineComponent = options.defineComponent.alias
    .map((alias) =>
      ['defineComponent', 'defineVaporComponent'].includes(alias)
        ? ''
        : `defineComponent: ${alias}`,
    )
    .filter(Boolean)
    .join(', ')
  return `
const { ${defineModel}, ${defineComponent} } = await import('vue')
${defineSlots}
${defineExpose}
${defineStyle}
type ${HELPER_PREFIX}StyleArgs = [style: string, options?: { scoped?: boolean }];
type ${HELPER_PREFIX}PrettifyLocal<T> = { [K in keyof T]: T[K]; } & {};
type __VLS_IsAny<T> = 0 extends 1 & T ? true : false;
type __VLS_PickNotAny<A, B> = __VLS_IsAny<A> extends true ? B : A;
`
}
