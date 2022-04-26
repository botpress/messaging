# Inspector Kit

Reusable components for the Botpress Studio Inspector

## Usage

1. Install `@botpress/inspector-kit`
   - `yarn add @botpress/inspector-kit`
2. Import component

   ```jsx
   import { useState } from 'react'
   import { Superinput } from '@botpress/inspector-kit'

   const SomeComponent = () => {
     const [value, setValue] = useState()

     return <Superinput value={value} onChange={setValue} />
   }
   ```

3. Import types when necessary

   ```jsx
   import { Superinput, SI_TYPES } from '@botpress/inspector-kit'
   ...
     return <Superinput type={SI_TYPES.EXPRESSION} value={value} onChange={setValue} />

   ```

## Storybook

This package includes a storybook which details the capabilities of each component. Run it using:

```shell
yarn workspace @botpress/inspector-kit storybook
```

## Testing

Components are tested using [react-testing-library](https://github.com/testing-library/react-testing-library) and [ts-jest](https://github.com/kulshekhar/ts-jest).

```shell
yarn workspace @botpress/inspector-kit test
```

## Build package

```shell
yarn workspace @botpress/inspector-kit build
```

## Watch Build

Does not create `doctree` for you, must be generated separately

```shell
yarn workspace @botpress/inspector-kit dev
```

## Super Input

VsCode-like autocomplete for input boxes. Uses Codemirror6 under the hood.

### Building `doctree`

Building the doctree generates a JSON file that exports documentation from `botpress.d.ts`.

```shell
yarn workspace @botpress/inspector-kit doctree
```

### Props

---

```typescript
enum SI_TYPES { // types of SuperInput
  TEMPLATE = 0, // for template strings using the {{}} delimiter
  EXPRESSION = 1, // for full javascript expressions that evaluate its full output
  BOOL = 2 // for full javascript expressions that evaluate its output to a bool
}

export interface ISiProps {
  eventState?: any // variables to pull eval info from, must be IO.IncomingEvent
  value?: string
  type?: SI_TYPES // Type of SuperInput, see above
  autoFocus?: boolean // If true SuperInput will autofocus on initial load
  placeholder?: string // Placeholder value
  noGlobsEvalMsg?: string // Message to show if there is no live info (defaults to not showing a message)
  onChange?: (newValue: string) => any // runs everytime the input changes
}
```

### Adding Documentation to Autocomplete

---

Any documentation added to our `botpress.d.ts` -> `IO.IncomingEvent` type/subtypes will be generated into the `doctree`.

The `botpress.d.ts` file used is located in the studio at `packages/studio-be/src/sdk/botpress.d.ts`

Adding docs above the key like this:

```typescript
/**
 * This  object is used to store data which will be persisted on different timeframes. It allows you to easily
 * store and retrieve data for different kind of situations.
 */
export interface EventState {
```

to add links add a double square brackets around the link and make sure its on the last line by itself like this:

```typescript
/**
 * Docs..
 * More Docs...
 * [[https://google.com]]
 */
export interface EventState {
```

### Useful links

- [Codemirror 6, and all extentions](https://codemirror.net/6/docs/ref/)
- [Lezer, Codemirror's parser](https://lezer.codemirror.net/docs/ref/#lr.Parser)
- [Javascript Sandbox for code eval article](https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/)
