# YSDS tslint rules
A collection of tslint rules used by YSDS.

## binary-comparison-type
Disallows binary comparisons where operands are not numbers. This rule requires tslint to be executed with
the type checker enabled (tslint -p tsconfig.json).
```typescript
// nope
'yee' > 'a'

// nope
{} > {}

// OK
5 > 4

// nope
const x: string = 'yee'
x > 5

// nope
const x = 'yee'
x > 5

// nope
function yee(x: {}) {
  return x > 5
}
```

## block-nesting
Prevent excessive block nesting. Function blocks reset the depth counter. Maximum
nesting depth is configurable.
```typescript
if (true) {
  if (true) {
    // nope (when max depth is set to 2)
    if (true) {
    }
  }
}
```


## no-any-declaration
Disallows the `any` type in type declarations. Explicit up casts are permitted for
convenience.

```typescript
// nope
const x: any = 1

// nope
const x: { a: any } = { a: 1 }

// nope
function x(arg: any) {
}

// nope
interface X {
    a: any
}

// ok
const x = 1 as any

// ok
const x = { a: 1 } as { a: any }

// ok
function x<T extends any[]>(...args: T) {
}
```
