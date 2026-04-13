import { combineReducers } from '@reduxjs/toolkit'
import { customersSlice } from '@slices/customers/customers-slice'
import { orderFormSlice } from '@slices/orderForm/order-form-slice'
import { ordersSlice } from '@slices/orders/orders-slice'
import { productsSlice } from '@slices/products/products-slice'
import { profileOrdersSlice } from '@slices/profile-orders/profile-orders-slice'
import { userSlice } from '@slices/user/user-slice'
import basketSlice from './slice/basket'

export const rootReducer = combineReducers({
    [basketSlice.name]: basketSlice.reducer,
    [productsSlice.name]: productsSlice.reducer,
    [orderFormSlice.name]: orderFormSlice.reducer,
    [userSlice.name]: userSlice.reducer,
    [ordersSlice.name]: ordersSlice.reducer,
    [customersSlice.name]: customersSlice.reducer,
    [profileOrdersSlice.name]: profileOrdersSlice.reducer,
})
