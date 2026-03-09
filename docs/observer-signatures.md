# Why Observer Functions Must Share the Same Signature

## The Problem

In the current `index.ts`, two mock observers are defined and pushed into the same array:

```ts
const sendEmailMock = (email: string, subject: string) => {
  console.log(`Email sent to ${email} with subject "${subject}"`)
}

const saveToDatabaseMock = (data: any) => {
  console.log(`Data saved to database: ${JSON.stringify(data)}`)
}

const observers = []
observers.push(sendEmailMock)
observers.push(saveToDatabaseMock)
```

These two functions have **completely different signatures**:

| Function             | Parameters                        |
| -------------------- | --------------------------------- |
| `sendEmailMock`      | `(email: string, subject: string)` |
| `saveToDatabaseMock` | `(data: any)`                     |

Because they don't share a common shape, TypeScript cannot give `observers` a meaningful type. It falls back to `never[]` (if strict) or `any[]` (if lenient). Either way, type safety is lost — the array could hold anything, and calling observers becomes guesswork.

When you later call:

```ts
observers.forEach((observer) => observer("test one", "test two"))
```

TypeScript has no way to check whether passing two strings is correct for every observer in the list. `saveToDatabaseMock` only expects one argument, so it silently receives an unexpected second argument and ignores it. No error, no warning — a silent bug.

---

## Why the Observer Pattern Requires a Shared Contract

The Observer pattern works by maintaining a **list of callbacks that all accept the same input**. The entity does not know who its observers are — it simply calls each one with the same event. That only works if every observer agrees on what an event looks like.

The contract is expressed as a type:

```ts
type Observer<T> = (event: T) => void
```

Every function in the observers array must conform to `Observer<T>` for the same `T`. If they don't, the array cannot be typed, and the whole pattern breaks down.

---

## The Fix: Define a Shared Domain Event Type

Instead of passing raw strings, define what an event actually is — a plain object with a `type` field and a structured payload:

```ts
type StockReducedEvent = {
  type: "StockReduced"
  productId: string
  newLevel: number
  quantity: number
}

type LowStockEvent = {
  type: "LowStock"
  productId: string
  newLevel: number
}

type DomainEvent = StockReducedEvent | LowStockEvent
```

Then declare the observer type and make every callback conform to it:

```ts
type Observer = (event: DomainEvent) => void

const logObserver: Observer = (event) => {
  console.log(`[LOG] ${event.type}`, event)
}

const emailObserver: Observer = (event) => {
  if (event.type === "LowStock") {
    console.log(`Email sent: stock low for product ${event.productId}`)
  }
}

const observers: Observer[] = []
observers.push(logObserver)
observers.push(emailObserver)
```

Now the array has a concrete type (`Observer[]`), every push is checked at compile time, and calling observers is unambiguous:

```ts
const event: DomainEvent = { type: "LowStock", productId: "abc", newLevel: 2 }
observers.forEach((observer) => observer(event))
```

---

## Key Takeaway

An observer array is only type-safe when every function in it accepts **the same argument type**. In DDD, that argument is a **domain event** — a plain, immutable object that describes what just happened inside the entity. The observers react to the event; the entity does not care what they do with it.
