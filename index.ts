import { v4 as uuidv4 } from "uuid"

type ProductName = "Shoes" | "Shirt" | "Pants"

type PriceNumber = number & { readonly __brand: unique symbol }

function createPrice(value: number): PriceNumber {
	if (value < 0) {
		throw new Error("Value must be positive")
	}

	return value as PriceNumber
}

// factory function
function createProduct(
	id: string,
	name: ProductName,
	price: PriceNumber,
): Product {
	if (name !== "Shoes" && name !== "Shirt" && name !== "Pants") {
		throw new Error("Name must be Shoes, Shirt, or Pants")
	}

	if (!id) {
		throw new Error("Id must be provided")
	}

	if (price < 0) {
		throw new Error("Price must be positive")
	}

	return {
		id: uuidv4() as ProductId,
		name,
		price,
	}
}
type Product = {
	id: ProductId
	name: ProductName
	price: PriceNumber
}

type ProductId = string & { readonly __brand: unique symbol }
type StockLevel = number & { readonly __brand: unique symbol }

type ProductCreatedEvent = {
	readonly type: "ProductCreated"
	readonly productId: ProductId
	readonly name: ProductName
	readonly price: PriceNumber
}

type PriceUpdatedEvent = {
	readonly type: "PriceUpdated"
	readonly productId: ProductId
	readonly oldPrice: PriceNumber
	readonly newPrice: PriceNumber
}

// ✅ Precise — the event carries what changed and why
type StockReducedEvent = {
	readonly type: "StockReduced"
	readonly productId: ProductId
	readonly newLevel: StockLevel
	readonly quantity: Quantity
}
type DomainEvent = ProductCreatedEvent | PriceUpdatedEvent | StockReducedEvent

type Quantity = number & { readonly __brand: unique symbol }

type Observer = (event: DomainEvent) => void

const observers: Observer[] = []

// first product (easy construction)
const product1: Product = {
	id: uuidv4() as ProductId,
	name: "Shoes",
	price: createPrice(100),
}

console.log(product1)

const sendEmailMock: Observer = (event: DomainEvent) => {
	console.log(`Email sent for event ${event.type}`)
}

const saveToDatabaseMock: Observer = (event: DomainEvent) => {
	console.log(`Data saved to database for event ${event.type}`)
}
observers.push(sendEmailMock)
observers.push(saveToDatabaseMock)

try {
	const product2 = createProduct(uuidv4(), "Shirt", createPrice(50))
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
