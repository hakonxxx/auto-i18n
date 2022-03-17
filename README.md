## usage in project
```ts
import 'auto-i18n/placeholder'

// function i18nPlaceholder: (phase: string, fileName?: string) => string

const smile = 'ha ha'


// wrap phase needed translate
i18nPlaceholder(`pls translate this phase!`, {
  translationFileName: 'common',
})
// => i18n('pls translate this phase!', {
//   translationFileName: 'common',
// })

i18nPlaceholder(`pls translate this phase! ${smile}`, {
  translationFileName: 'common',
  i18nKey: 'pls',
})
// => i18n('pls', {
//   translationFileName: 'common',
//     args: {
//       smile
//     }
// })

i18nPlaceholder(`pls translate this phase! ${smile}`, {
  translationFileName: 'common',
})
// => i18n('pls translate this phase! {{smile}}', {
//   translationFileName: 'common',
//     args: {
//       smile
//     }
// })

i18nPlaceholder(`pls translate this phase! ${(() => smile)()}`, {
  translationFileName: 'common',
})
// => i18n('pls translate this phase! {{0}}', {
//   translationFileName: 'common',
//     args: {
//       0: smile
//     }
// })
```

## transformFiles
```ts
type CodeSection = {
  start: number
  end: number
  code: string
}
type Collection = {
  origin: CodeSection
  target: CodeSection
  translationFileName?: string
  i18nKey?: string
  key: string
}
type Collections = {
  fileName: string
  collections: Collection[]
}
function transformFiles: (fileNames: string[]) => Collections[]
```

## write i18nKey
```ts
function writeKeys: (collections: Collections[]) => void
```
1. to reuse key, 'a{{b}}' and 'a{{1}}' treat as the same

## write key cache(before commit)
```ts
function writeCache: (entries: string[]) => void
```
1. build dependency graph for each entry, collect fileNames for each entry
2. compare each file modified time with auto-i18n/modified.json
3. ignore files which not changed
4. collect collections from each changed files, write keys into auto-i18n/used-[entry].json
```ts
// auto-i18n/modified.json (git ignored)
{
  'some/file': {
    modified: '2000-01-01'
  }
}
```
```ts
// auto-i18n/used-[entry].json
[
  {
    'pls': {
      translationFileName: 'common'
    }
  }
]
```

## collect keys(SSR or runtime)
1. read auto-i18n/used-[entry].json and collect used keys opts
2. collect key-value pairs from translation file(s) based on used keys opts

## transform settings
```ts
type Ignore = {
  files?: (string | RegExp)[] // /type\.ts|(.+\.d\.ts)/
  kinds?: number[] // [EnumDeclaration, InterfaceDeclaration, TypeLiteral, TypeParameter, TypeReference, TypeAliasDeclaration, ElementAccessExpression, ModuleDeclaration]
  rules?: ((node: Node, ancestors: Node[]) => boolean)[] // [(node) => node.expression?.name === 'log' || node.expression?.escapedText === 'log']
  comments?: string[] // ['i18n ignore']
}

type I18N = {
  path: string // './public/locale/en'
  defaultFileName: string // 'auto-i18n.json'
}

type Match = {
  // contexts?: number[][] // [[ArrowFunction, Block], [FunctionDeclaration, Block]]
  nodes?: ((node: Node, ancestors: Node[]) => boolean)[] // [(node) => node.expression?.name === 'i18nPlaceholder' || node.expression?.escapedText === 'i18nPlaceholder']
  placeholder?: string // i18nPlaceholder
  
  rule
}

type Transform = {
  arg: (node: Node, index: number) => string // (node, index) => getIdentifier(node)?.escapedText.trim() || index
  transformers: ((node: Node) => Node)[] // wrapped targeted node
}

type Setting = Ignore & I18N & Match

```


```ts
type Context = {
  ancestors:  Node[]
  ignoreAll: boolean
}
```