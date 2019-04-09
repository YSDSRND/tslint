# YSDS tslint rules
A collection of tslint rules used by YSDS.

## binary-comparison-type
Disallows binary comparisons where operands are not numbers. Only works for literal
values and identifiers with a declared type.
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

// OK, inferred string literal so we can't detect this without type information.
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
