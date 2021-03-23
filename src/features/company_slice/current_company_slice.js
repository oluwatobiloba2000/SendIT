import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

//status:  'idle' || 'succeeded' | 'failed'

export const currentCompany = createSlice({
    name: 'currentCompany',
    initialState: {
        data: {},
        loading: false,
        errorMessage: null,
        successMessage: null,
        status: 'idle',
        isAuthenticated: false
    },
    reducers: {
        addCompany: (state, payload) => {
            state.data = payload.payload.company;
        },
        deleteCompany: state => {
            state.data = {};
        },
        company_setIsAuthenticated:(state, action) => {
            state.isAuthenticated = action.payload;
        },
        company_api_auth_success: (state, action) => {
            state.status = 'success';
            state.loading = false;
            state.errorMessage = null;
            state.successMessage = action.payload;
        },
        company_api_auth_failed: (state, action) => {
            state.status = 'failed';
            state.loading = false;
            state.errorMessage = action.payload;
        },
        company_api_auth_pending: (state, action) => {
            state.status = 'pending';
            state.loading = true;
        },
        company_api_auth_idle: (state, action) => {
            state.status = 'idle';
            state.loading = false;
            state.errorMessage = null;
            state.successMessage = null;
        },
    },
});

export const { addCompany, deleteCompany, company_api_auth_success, company_api_auth_pending, company_api_auth_failed, company_api_auth_idle, company_setIsAuthenticated } = currentCompany.actions;


export const loginCompany = ({ email, password }) => dispatch => {
    dispatch(company_api_auth_pending());
    axios.post(`/company/login`, {
        email,
        password
    })
        .then(function (response) {
            dispatch(company_api_auth_success('login success'))
            localStorage.setItem('token', JSON.stringify({token: response.data.data.token, role: 'company'}));
            window.location.href = '/company/dashboard'
            dispatch(company_setIsAuthenticated(true))
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(company_api_auth_failed('Looks Like you are not connected to the internet'));
            } else if(error.response.data) {
                dispatch(company_api_auth_failed(error.response.data.message));
            }else{
                dispatch(company_api_auth_failed('something went wrong'));
            }
        });

};


export const signupCompany = ({ email, name: company_name, logo, phonenumber: phone, password }) => dispatch => {
    dispatch(company_api_auth_pending());
    axios.post(`/company/signup`, {
        email,
        company_name,
        logo,
        phone,
        password
    })
        .then(function (response) {
            dispatch(company_api_auth_success('signup success'))
            localStorage.setItem('token', JSON.stringify({token: response.data.data.token, role: 'company'}))
            window.location.href = '/company/dashboard'
            dispatch(company_setIsAuthenticated(true))
        })
        .catch(function (error) {
            if (error.message.indexOf('Network Error') !== -1) {
                dispatch(company_api_auth_failed('Looks Like you are not connected to the internet'));
            } else if(error.response.data) {
                dispatch(company_api_auth_failed(error.response.data.message));
            }else{
                dispatch(company_api_auth_failed('something went wrong'));
            }
        });

};


export default currentCompany.reducer;
