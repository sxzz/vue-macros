import { defineComponent } from 'vue'

const Comp = defineComponent(
  ({ bar = 'bar'!, ...props }: { bar: 'bar'; baz: 'baz' }) => {
    const foo = defineModel('foo', {
      validator: (value) => {
        return value === 'foo'
      },
      required: false,
      type: String,
    })
    return <div>{[foo.value, bar, props.baz]}</div>
  },
  { inheritAttrs: false },
)

const Comp1 = defineComponent((props: { bar: 'bar' }) => {
  const foo = defineModel('foo')
  return <div>{[foo.value, props['bar']]}</div>
})
