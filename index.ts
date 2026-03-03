import { v4 as uuidv4 } from "uuid"
import type { ProductId } from "./src/domain/product/types.js"
import type { Product } from "./src/domain/product/product.js"
import type { StockReducedEvent } from "./src/domain/events/events.js"
import {
	createPrice,
	createProduct,
	createQuantity,
	createStockLevel,
	reduceStock,
} from "./src/domain/product/factories.js"
import { observers } from "./src/infrastructure/observers/observer.js"
import { sendEmailMock } from "./src/infrastructure/observers/email.js"
import { saveToDatabaseMock } from "./src/infrastructure/observers/database.js"

// first product (easy construction)
const product1: Product = {
	id: uuidv4() as ProductId,
	name: "Shoes",
	price: createPrice(100),
}

console.log(product1)

observers.push(sendEmailMock)
observers.push(saveToDatabaseMock)

// second product (with validation)
try {
	const product2: Product = createProduct(uuidv4(), "Shirt", createPrice(50))
	console.log(product2)
	observers.forEach((observer) =>
		observer({
			type: "ProductCreated",
			productId: product2.id,
			name: product2.name,
			price: product2.price,
		}),
	)
} catch (error) {
	if (error instanceof Error) {
		console.error(error.message)
	} else {
		console.error("Unknown error")
	}
}

// Simulate stock reduction

const stockLevel = createStockLevel(10)
const quantity = createQuantity(2)

const stockReducedEvent: StockReducedEvent = {
	type: "StockReduced",
	productId: product1.id,
	newLevel: reduceStock(stockLevel, quantity),
	quantity,
}

// Notify observers about stock reduction

observers.forEach((observer) => observer(stockReducedEvent))
