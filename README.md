# YSDS tslint rules
A collection of tslint rules used by YSDS.

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
