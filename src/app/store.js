import { configureStore } from '@reduxjs/toolkit';
import currentUserReducer from '../features/currentUserSlice/currentUserSlice';
import userOrderReducer from '../features/order_user_slice/order_user_slice';
import currentCompanyReducer from '../features/company_slice/current_company_slice';
import order_company_slice from '../features/order_company_slice/order_company_slice';

export default configureStore({
  reducer: {
    currentuser: currentUserReducer,
    userOrder: userOrderReducer,
    currentCompany: currentCompanyReducer,
    companyOrder: order_company_slice
  },
});
