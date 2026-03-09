# E-Commerce: Inventory & Stock Management

This is a classic "reactive" system. The domain doesn't care how a notification is sent;
it only cares that the stock level has changed.

## The Entity: Product

The Business Rule: A product's StockLevel must never drop below zero. If an order exceeds available stock, throw an exception.

The State Change: Product.ReduceStock(quantity)

## Observer Opportunities

- Low Stock Observer: If stock falls below 5, trigger a "Reorder" process.
- Out of Stock Observer: If stock hits 0, update the website to mark the item as "Unavailable."
