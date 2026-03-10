import { v4 as uuidv4 } from "uuid"

/*
 ** avoid any "weird" number as input
 */

/* 1.  factory function  */
/*  a factory function creates a new object  */

/* 2.  constructor function  */
// OOP
// a constructor function creates a new object and sets its properties

// create a primitive obsessed type
type Order = {
	id: OrderId
	customerEmail: Email
	sku: Sku
	priceInCents: Price
	quantity: number
	isPriority: boolean
	status: OrderStatus
	observers: Observer<OrderEvent>[]
}

function calculateLineTotal(order: Order): number {
	return order.priceInCents * order.quantity
}

function createOrder(input: {
	customerEmail: string
	sku: string
	priceInCents: number
	quantity: number
	isPriority: boolean
}): Order {
	const order: Order = {
		id: createOrderId(uuidv4()),
		customerEmail: createEmail(input.customerEmail),
		sku: createSku(input.sku),
		priceInCents: createPrice(input.priceInCents),
		quantity: input.quantity,
		isPriority: input.isPriority,
		status: "open",
		observers: [],
	}
	notify(order, {
		type: "OrderCreated",
		payload: { orderId: order.id },
	})
	return order
}

function addItem(order: Order, addQuantity: number): Order {
	if (order.status !== "open") {
		throw new Error("cannot add to closed order")
	}
	if (addQuantity <= 0) {
		throw new Error("invalid quantity")
	}
	const nextOrder: Order = {
		...order,
		quantity: order.quantity + addQuantity,
	}
	notify(nextOrder, {
		type: "OrderItemAdded",
		payload: { orderId: nextOrder.id, quantity: addQuantity },
	})
	return nextOrder
}

function cancelOrder(order: Order): Order {
	if (order.status !== "open") {
		throw new Error("order already closed")
	}
	const nextOrder: Order = {
		...order,
		status: "cancelled",
	}
	notify(nextOrder, {
		type: "OrderCancelled",
		payload: { orderId: nextOrder.id },
	})
	return nextOrder
}

function subscribe(order: Order, observer: Observer<OrderEvent>): Order {
	return {
		...order,
		observers: [...order.observers, observer],
	}
}

function unsubscribe(order: Order, observer: Observer<OrderEvent>): Order {
	return {
		...order,
		observers: order.observers.filter((current) => current !== observer),
	}
}

function notify(order: Order, event: OrderEvent): void {
	for (const observer of order.observers) {
		observer(event)
	}
}

function printShippingLabel(customerEmail: Email, sku: Sku): void {
	console.log(`shipping label -> email: ${customerEmail}, sku: ${sku}`)
}

function createEmail(raw: string): Email {
	if (!raw.includes("@")) {
		throw new Error("invalid email")
	}
	return raw as Email
}

function createSku(raw: string): Sku {
	if (raw.trim().length === 0) {
		throw new Error("invalid sku")
	}
	return raw as Sku
}

function createPrice(raw: number): Price {
	if (raw < 0) {
		throw new Error("invalid price")
	}
	return raw as Price
}

function createOrderId(raw: string): OrderId {
	return raw as OrderId
}

function createCurrency(raw: string): Currency {
	if (raw.trim().length !== 3) {
		throw new Error("invalid currency")
	}
	return raw.toUpperCase() as Currency
}

function createMoney(amount: number, currency: string): Money {
	return {
		amount: createPrice(amount),
		currency: createCurrency(currency),
	}
}

function addMoney(a: Money, b: Money): Money {
	if (a.currency !== b.currency) {
		throw new Error("currency mismatch")
	}
	return {
		amount: createPrice(a.amount + b.amount),
		currency: a.currency,
	}
}

// modify this code for testing !!
// this replicates user input
type Price = number & { readonly __brand: unique symbol }
type Email = string & { readonly __brand: unique symbol }
type Sku = string & { readonly __brand: unique symbol }
type Currency = string & { readonly __brand: unique symbol }
type OrderId = string & { readonly __brand: unique symbol }

type OrderStatus = "open" | "cancelled"

type OrderEvent =
	| { type: "OrderCreated"; payload: { orderId: OrderId } }
	| { type: "OrderItemAdded"; payload: { orderId: OrderId; quantity: number } }
	| { type: "OrderCancelled"; payload: { orderId: OrderId } }

type Observer<T> = (event: T) => void

type Money = {
	readonly amount: Price
	readonly currency: Currency
}

let orderOne = createOrder({
	customerEmail: "alice@example.com",
	sku: "LAP-DEV-01",
	priceInCents: 50000,
	quantity: 1,
	isPriority: false,
})

const logObserver: Observer<OrderEvent> = (event) => {
	console.log("observer log:", event.type)
}
const emailObserver: Observer<OrderEvent> = (event) => {
	console.log("observer email:", event.type)
}
const uiObserver: Observer<OrderEvent> = (event) => {
	console.log("observer ui:", event.type)
}

orderOne = subscribe(orderOne, logObserver)
orderOne = subscribe(orderOne, emailObserver)
orderOne = subscribe(orderOne, uiObserver)

const orderTwo = addItem(orderOne, 2)
const orderThree = unsubscribe(orderTwo, emailObserver)
const orderFour = cancelOrder(orderThree)

console.log("order one total:", calculateLineTotal(orderOne))
console.log("order two total:", calculateLineTotal(orderTwo))
console.log("order four status:", orderFour.status)

// invalid input demo (uncomment to test)
// createEmail("not-an-email")
// createPrice(-1)
// createSku("")

const moneyA = createMoney(50000, "usd")
const moneyB = createMoney(2500, "usd")
const totalMoney = addMoney(moneyA, moneyB)
console.log("money total:", totalMoney.amount, totalMoney.currency)

// silent bug: both arguments are strings, so TypeScript cannot tell they were swapped
// printShippingLabel(orderOne.sku, orderOne.customerEmail)
printShippingLabel(orderOne.customerEmail, orderOne.sku)

console.log("silent bugs that are now blocked:")
console.log("- raw number into priceInCents")
console.log("- swapping sku and email in shipping label")
console.log("- invalid email, sku, or negative price throw on create")
