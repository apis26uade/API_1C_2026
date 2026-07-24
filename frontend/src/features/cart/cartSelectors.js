export const SHIPPING_COST = 12
export const FREE_SHIPPING_MIN = 150

export const selectCartItems = (state) => state.cart.items

export const selectCartId = (state) => state.cart.cartId

export const selectCartSyncing = (state) => state.cart.syncing

export const selectAppliedDiscount = (state) => state.cart.appliedDiscount

export const selectItemCount = (state) =>
  state.cart.items.reduce((count, entry) => count + entry.quantity, 0)

export const selectSubtotal = (state) =>
  state.cart.items.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0)

export const selectDiscountPercent = (state) =>
  state.cart.appliedDiscount?.percentage ?? 0

export const selectDiscountCode = (state) => state.cart.appliedDiscount?.code ?? ''

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state)
  const percent = selectDiscountPercent(state)
  return (subtotal * percent) / 100
}

export const selectShipping = (state) => {
  const subtotal = selectSubtotal(state)
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST
}

export const selectCartTotal = (state) =>
  selectSubtotal(state) - selectDiscountAmount(state) + selectShipping(state)
