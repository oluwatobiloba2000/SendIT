import { createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import axios from 'axios';


//status:  'idle' || 'succeeded' | 'failed'

export const companyOrderReducer = createSlice({
    name: 'CompanyOrder',
    initialState: {
        ordersToApprove: [],
        ordersToApprove_status: 'idle',
        loading_ordersToApprove: false,
        ordersToApprove_errorMessage: null,
        ordersToApprove_successMessage: null,

        orders: [],
        orders_status: 'idle',
        loading_orders: false,
        orders_successMessage: null,
        orders_errorMessage: null,

        order_analytics: {},
        order_analytics_status: 'idle',
        loading_order_analytics: false,
        order_analytics_successMessage: null,
        order_analytics_errorMessage: null,

        current_viewed_order: {},
        loading_current_viewed_order: false,
        current_viewed_order_status: 'idle',
        current_viewed_order_errorMessage: null,
        current_viewed_order_successMessage: null,

    },
    reducers: {
        addOrder: (state, payload) => {
            state.orders.unshift(payload.payload);
        },
        addOrderToApprove: (state, action) =>{
            state.ordersToApprove.unshift(action.payload);
        },
        api_approve_order_success: (state, action) => {
            state.ordersToApprove.splice(state.ordersToApprove.findIndex(order => order.track_number === action.payload.track_number), 1);
        },
        api_ordersToApprove_pending: (state, action) => {
            state.ordersToApprove_status = 'pending';
            state.loading_ordersToApprove = true;
        },
        api_ordersToApprove_success: (state, action) => {
            state.ordersToApprove_status = 'success';
            state.loading_ordersToApprove = false;
            state.ordersToApprove_errorMessage = null;
            state.ordersToApprove_successMessage = action.payload.message;
            state.ordersToApprove = action.payload.orders;
        },
        api_ordersToApprove_failed: (state, action) => {
            state.ordersToApprove_status = 'failed';
            state.loading_ordersToApprove = false;
            state.ordersToApprove_errorMessage = action.payload.message;
        },
        api_orders_pending: (state, action) => {
            state.orders_status = 'pending';
            state.loading_orders = true;
        },
        api_orders_success: (state, action) => {
            state.orders_status = 'success';
            state.loading_orders = false;
            state.orders_errorMessage = null;
            state.orders_successMessage = action.payload.message;
            state.orders = action.payload.orders;
        },
        api_orders_failed: (state, action) => {
            state.orders_status = 'failed';
            state.loading_orders = false;
            state.orders_errorMessage = action.payload.message;
        },
        api_order_analytics_pending: (state, action) => {
            state.order_analytics_status = 'pending';
            state.loading_order_analytics = true;
        },
        api_order_analytics_success: (state, action) => {
            state.order_analytics_status = 'success';
            state.loading_order_analytics = false;
            state.order_analytics_errorMessage = null;
            state.order_analytics_successMessage = action.payload.message;
            state.order_analytics = action.payload.order_analytics;
        },
        api_order_analytics_failed: (state, action) => {
            state.order_analytics_status = 'failed';
            state.loading_order_analytics = false;
            state.order_analytics_errorMessage = action.payload.message;
        },
        api_current_viewed_order_pending: (state, action) => {
            state.current_viewed_order_status = 'pending';
            state.loading_current_viewed_order = true;
        },
        api_current_viewed_order_success: (state, action) => {
            state.current_viewed_order_status = 'success';
            state.loading_current_viewed_order = false;
            state.current_viewed_order_errorMessage = null;
            state.current_viewed_order_successMessage = action.payload.message;
            state.current_viewed_order = action.payload.current_viewed_order;
        },
        api_current_viewed_order_failed: (state, action) => {
            state.current_viewed_order_status = 'failed';
            state.loading_current_viewed_order = false;
            state.current_viewed_order_errorMessage = action.payload.message;
        },
        api_current_viewed_order_idle: (state, action) => {
            state.current_viewed_order_status = 'idle'
            state.current_viewed_order_errorMessage = null;
            state.current_viewed_order_successMessage = null;
        },
        api_orders_status_idle: (state, action) => {
            state.orders_status = 'idle';
            state.orders_successMessage = null;
            state.orders_errorMessage = null;
        },
        api_order_analytics_idle: (state, action) => {
            state.order_analytics_status = 'idle';
            state.order_analytics_successMessage = null;
            state.order_analytics_errorMessage = null;

        }
    },
});

export const {
    api_current_viewed_order_failed,
    api_current_viewed_order_pending,
    api_current_viewed_order_success,
    api_order_analytics_failed,
    api_order_analytics_pending,
    api_order_analytics_success,
    api_orders_failed,
    api_orders_pending,
    api_current_viewed_order_idle,
    api_order_analytics_idle,
    api_orders_status_idle,
    api_orders_success,
    addOrder,
    api_ordersToApprove_failed,
    api_ordersToApprove_pending,
    api_ordersToApprove_success,
    api_approve_order_success,
    addOrderToApprove
} = companyOrderReducer.actions;


export const company_fetch_orders_analytics = () => dispatch => {
    dispatch(api_order_analytics_pending());
    axios.get(`/company/orders/analytics`)
        .then(function (response) {
            dispatch(api_order_analytics_success({ order_analytics: response.data.data.data, message: 'success' }));
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(api_order_analytics_failed({ message: 'Looks Like you are not connected to the internet' }));
            } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                window.location.href = '/company/login';
                dispatch(api_order_analytics_failed({ message: 'Not Authorized' }));
            } else {
                dispatch(api_order_analytics_failed({ message: 'something went wrong' }));
            }
        });

};

export const fetch_orders_ToApprove = () => dispatch => {
    dispatch(api_ordersToApprove_pending());
    axios.get(`/company/order/pending`)
        .then(function (response) {
            dispatch(api_ordersToApprove_success({ orders: response.data.data, message: 'success' }));
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(api_ordersToApprove_failed({ message: 'Looks Like you are not connected to the internet' }));
            } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                message.error('Session expired', 1);
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/company/login'
                }, 2000)
                dispatch(api_ordersToApprove_failed({ message: 'Not Authorized' }));
            } else {
                dispatch(api_ordersToApprove_failed({ message: 'something went wrong' }));
            }
        });

};

export const fetch_all_orders_company = () => dispatch => {
    dispatch(api_orders_pending());
    axios.get(`/company/orders`)
        .then(function (response) {
            dispatch(api_orders_success({ orders: response.data.data.data, message: 'success' }));
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(api_orders_failed({ message: 'Looks Like you are not connected to the internet' }));
            } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                message.error('Session expired', 1);
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/company/login'
                }, 2000)
                dispatch(api_orders_failed({ message: 'Not Authorized' }));
            } else {
                dispatch(api_orders_failed({ message: 'something went wrong' }));
            }
        });
};


export default companyOrderReducer.reducer;
