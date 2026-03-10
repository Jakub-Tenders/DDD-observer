# Domain: Ordering Laptops

This project models a small business flow for ordering laptops.

The system starts with raw input (email, SKU, quantity, price) and converts it into trusted domain values.  
After that, domain functions operate only on valid values.

## What an order represents

A `LaptopOrder` is an entity with:

- a unique `id`
- a `customerEmail`
- a list of laptop `lines`
- a `status` (`DRAFT`, `PLACED`, `CANCELLED`)
- a list of observers (subscribers for domain events)

Two orders can look the same, but they are still different because each one has a different identity (`id`).

## Business rules enforced in code

1. SKU format
- A laptop SKU must match this pattern: `LAP-...` with uppercase letters/numbers.
- Invalid SKU is rejected immediately.

2. Customer email
- Email must have a valid basic format.
- Email is normalized to lowercase.

3. Quantity per line
- Quantity must be an integer.
- Quantity must be between 1 and 5 for a single line.

4. Price
- Money is stored in cents (`USD`).
- A line item cannot have zero price.

5. Order size
- You can add laptops only while the order is in `DRAFT`.
- Total laptops in one order cannot exceed 10 units.

6. State transitions
- You can place only a `DRAFT` order.
- You cannot place an empty order.
- You can cancel an order from any non-cancelled state.
- Cancellation requires a reason with at least 5 characters.

## Domain behavior

- `createLaptopOrder(...)` creates a new order entity.
- `addLaptop(...)` adds a validated order line and emits `LaptopAdded`.
- `placeOrder(...)` changes status to `PLACED` and emits `OrderPlaced` with total.
- `cancelOrder(...)` changes status to `CANCELLED` and emits `OrderCancelled`.
- `calculateOrderTotal(...)` computes the money total from all lines.

## Observer pattern in this domain

The order does not know who listens to events.

- `subscribe(order, observer)` adds an observer.
- `unsubscribe(order, observer)` removes an observer.
- `notify(...)` calls all observers with a domain event.

This keeps side effects (logging, emails, analytics) decoupled from the core domain logic.
