import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomLoader from '../Loader';
import { addUser, setIsAuthenticated } from '../../features/currentUserSlice/currentUserSlice';
import axios from 'axios';
import { useEffect } from 'react';

const loaderIconSvg = () => <svg style={{color: '#003049', width: '30px', position: 'absolute', left: '3px', top: 0}} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>

function CheckUserAuth() {
    const [authLoading, setAuthLoading] = useState(false);
    const [authenticationStatus, setAuthenticationStatus] = useState('');
    const [reloadPage, setReloadPage] = useState(false);
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.currentuser);

    useEffect(()=>{

        const stringifyToken = window.localStorage.getItem('token')
        const authTokenFromLocalStorage = JSON.parse(stringifyToken);

        if(!currentUser.isAuthenticated && authTokenFromLocalStorage && authTokenFromLocalStorage.token && authTokenFromLocalStorage.role === 'user'){
          setAuthLoading(true);
          setReloadPage(false);
          setAuthenticationStatus('Authenticating, please wait ....')
          axios.defaults.headers.common['Authorization'] = `Bearer ${authTokenFromLocalStorage.token}`;
          axios.get(`/user/verify`)
              .then(function (response) {
                  setAuthenticationStatus('Authentication Success')
                  dispatch(addUser({user: response.data.data.user}))
                  dispatch(setIsAuthenticated(true))
                  setAuthLoading(false)
              })
              .catch(function (error) {
                  dispatch(setIsAuthenticated(false))
                  if (error.message.indexOf('Network Error') !== -1) {
                      setAuthenticationStatus('Looks Like you are not connected to the internet');
                      return setReloadPage(true);
                    } else if(error.message.indexOf('Request failed with status code 401') !== -1) {
                        localStorage.removeItem('token');
                        window.location.href ='/?auth=login'
                   return setAuthenticationStatus('Your Session Has Expired')
                  }
                });
            }
            else if(!authTokenFromLocalStorage){
               return window.location.href ='/?auth=login'
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {authLoading && <CustomLoader position="fixed" reloadPage={reloadPage} text={authenticationStatus} Icon={loaderIconSvg()} />}
            {/* {(currentUser.isAuthenticated === false ) && <Redirect to="/?auth=login"/>} */}
        </>

    )
}

export default CheckUserAuth;
