export enum CartStatus {
	ACTIVE = 'ACTIVE', // Cart is open and editable
	CHECKED_OUT = 'CHECKED_OUT', // Order has been placed from this cart
	ABANDONED = 'ABANDONED', // Member left without checking out
}
