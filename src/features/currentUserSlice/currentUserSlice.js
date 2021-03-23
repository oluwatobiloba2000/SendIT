import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

//status:  'idle' || 'succeeded' | 'failed'

export const currentUser = createSlice({
    name: 'currentUser',
    initialState: {
        data: {},
        loading: false,
        errorMessage: null,
        successMessage: null,
        status: 'idle',
        isAuthenticated: false
    },
    reducers: {
        addUser: (state, payload) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.data = payload.payload.user;
        },
        deleteUser: state => {
            state.data = {};
        },
        setIsAuthenticated:(state, action) => {
            state.isAuthenticated = action.payload;
        },
        api_auth_success: (state, action) => {
            state.status = 'success';
            state.loading = false;
            state.errorMessage = null;
            state.successMessage = action.payload;
        },
        api_auth_failed: (state, action) => {
            state.status = 'failed';
            state.loading = false;
            state.errorMessage = action.payload;
        },
        api_auth_pending: (state, action) => {
            state.status = 'pending';
            state.loading = true;
        },
        api_auth_idle: (state, action) => {
            state.status = 'idle';
            state.loading = false;
            state.errorMessage = null;
            state.successMessage = null;
        },
    },
});

export const { addUser, deleteUser, api_auth_success, api_auth_pending, api_auth_failed, api_auth_idle, setIsAuthenticated } = currentUser.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const loginUser = ({ email, password }) => dispatch => {
    dispatch(api_auth_pending());
    axios.post(`/user/login`, {
        email,
        password
    })
        .then(function (response) {
            dispatch(addUser(response.data.data))
            dispatch(api_auth_success('login success'))
            localStorage.setItem('token', JSON.stringify({token: response.data.data.token, role: 'user'}));
            window.location.href = '/user/dashboard'
            dispatch(setIsAuthenticated(true))
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(api_auth_failed('Looks Like you are not connected to the internet'));
            } else if(error.response.data) {
                dispatch(api_auth_failed(error.response.data.message));
            }else{
                dispatch(api_auth_failed('something went wrong'));
            }
        });

};


export const signupUser = ({ email, firstname, lastname,address, phone, password }) => dispatch => {
    dispatch(api_auth_pending());
    axios.post(`/user/signup`, {
        email,
        firstname,
        lastname,
        address,
        phone,
        password
    })
        .then(function (response) {
            dispatch(addUser(response.data.data))
            dispatch(api_auth_success('signup success'))
            localStorage.setItem('token', JSON.stringify({token: response.data.data.token, role: 'user'}))
            window.location.href = '/user/dashboard'
            dispatch(setIsAuthenticated(true))
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(api_auth_failed('Looks Like you are not connected to the internet'));
            } else if(error.response.data) {
                dispatch(api_auth_failed(error.response.data.message));
            }else{
                dispatch(api_auth_failed('something went wrong'));
            }
        });

};


export default currentUser.reducer;
