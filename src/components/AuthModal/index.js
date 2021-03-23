import { Alert, Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import useQuery from '../../customhook/useQuery';
import Logo from '../Logo';
import './authmodal.css'
import AuthSvg from '../../img/delivery_auth_guy.svg';
import CustomButton from '../Button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { api_auth_idle, loginUser, signupUser } from '../../features/currentUserSlice/currentUserSlice';
import * as yup from "yup";
import { useDispatch, useSelector } from 'react-redux';

const Loginschema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(4).required(),
});

const Signupschema = yup.object().shape({
  email: yup.string().email().required(),
  firstname: yup.string().min(2).required(),
  phone: yup.string().min(10).required(),
  address: yup.string().min(4).required(),
  lastname: yup.string().min(2).required(),
  password: yup.string().min(4).required(),
});

function Auth({setShowModal, refreshAfterSuccess, disableClose}) {
  const { register: registerLogin, handleSubmit: handleloginSubmit, errors: errorsLogin } = useForm({
    resolver: yupResolver(Loginschema)
  });
  const { register: registerSignup, handleSubmit: handlesignupSubmit, errors: errorsSignup } = useForm({
    resolver: yupResolver(Signupschema)
  });
   const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuser);
  const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const onSubmitLoginForm = data => {
    dispatch(loginUser(data));
    dispatch(api_auth_idle());
  };

  const onSubmitSignupForm = data => {
    dispatch(signupUser(data));
    dispatch(api_auth_idle());
  };



  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (query.get('auth') === 'login' || query.get('auth') === 'signup') {
      showModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get('auth')])


  const handleCloseModal = () => {
    setVisible(false);
    history.push(location.pathname);
  };

  return (
    <Modal
      visible={setShowModal || visible}
      style={{ top: 20 }}
      onOk={handleOk}
      className="auth_modal"
      confirmLoading={confirmLoading}
      width={800}
      onCancel={disableClose ? '' : handleCloseModal}
    >
      {/* {currentUser.isAuthenticated && <Redirect to="/user/dashboard"/>} */}
      {((currentUser.isAuthenticated && currentUser.status === 'success') && refreshAfterSuccess) && window.location.reload()}

      {query.get('auth') === 'login'  || setShowModal === true ? (
        <div className="modal_container">
          <div className="svg_modal">
            <Logo className="auth_logo" />

            <img src={AuthSvg} className="auth_svg" alt="delivery" />
            <svg style={{ position: 'absolute', right: '-150px', bottom: 0 }} width="285" height="289" viewBox="0 0 285 289" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g style={{ mixBlendMode: 'overlay' }}>
                <path d="M285 144.5C285 224.305 221.201 289 142.5 289C63.7994 289 0 224.305 0 144.5C0 64.6949 63.7994 0 142.5 0C221.201 0 285 64.6949 285 144.5Z" fill="#003049" />
                <path d="M285 144.5C285 224.305 221.201 289 142.5 289C63.7994 289 0 224.305 0 144.5C0 64.6949 63.7994 0 142.5 0C221.201 0 285 64.6949 285 144.5Z" fill="url(#paint0_linear)" />
              </g>
              <defs>
                <linearGradient id="paint0_linear" x1="142.5" y1="0" x2="142.5" y2="289" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" />
                  <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>

          {setShowModal ? '' : <div className="control_auth_btn">
              <h4>Don't have an account ?</h4>
              <Link to="/?auth=signup">
                <CustomButton type="secondary">
                  Signup
                </CustomButton>
              </Link>
            </div>}
          </div>

          <div className="form_content">
            <div className="form_body">
              <div className="auth_form_text">
                <h3>Login</h3>
                <svg style={{ position: 'absolute', left: '-3px', top: '31px' }} width="90" height="17" viewBox="0 0 90 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.47994 15.4037C35.387 3.07519 73.6995 4.62618 88.6173 6.94274" stroke="#F77F00" stroke-width="3" />
                </svg>
              </div>

              {/* login form begins */}
              <form className="auth_form" onSubmit={handleloginSubmit(onSubmitLoginForm)}>
                {currentUser.status === 'failed' ? <Alert
                  message={currentUser.errorMessage}
                  showIcon
                  style={{margin: '5px 0'}}
                  type="error"
                  closable
                /> : currentUser.status === 'success' ?
                <Alert
                message={currentUser.successMessage}
                showIcon
                style={{margin: '5px 0'}}
                type="success"
                closable
              />: ''
              }
                <label for="email" className="auth_form_label">Email</label>
                <input id="email" type="email" ref={registerLogin} className="email_input" name="email" />
                {errorsLogin.email && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsLogin.email.message} type="error" />}
           
                <label for="password" style={{ marginTop: '15px' }} className="auth_form_label">Password</label>
                <input type="password" id="password" ref={registerLogin} className="password_input" name="password" />
                {errorsLogin.password && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsLogin.password.message} type="error" />}
                <Link style={{ marginTop: '5px' }} to="/forgotpassword">Forgot Password?</Link>

                <div className="auth_btn_container">
                  <input style={{ position: 'absolute', bottom: 0, zIndex: 2, width: '61%', opacity: 0, cursor: 'pointer' }} type="submit" />
                  <CustomButton loading={currentUser && currentUser.loading} style={{ width: '180px' }} type="primary">Login</CustomButton>

                </div>
                  {setShowModal === true && <Button style={{width: '56%', marginTop: '28px', margin: '15px auto'}} onClick={()=>{
                     localStorage.removeItem('token');
                     window.location.href = '/'
                    }} type="primary">Go Home</Button> }
                    {
                      JSON.parse(localStorage.getItem('token')) && JSON.parse(localStorage.getItem('token')).role === 'user' && <Button style={{width: '56%', marginTop: '28px', margin: '15px auto'}} onClick={()=>{
                        window.location.href = '/user/dashboard'
                       }} type="primary">Go To Dashboard</Button>
                    }
              </form>
              {/* login form ends */}
              <div className="mobile_auth_switch">
                  <p>Don't have an account ?
                    <Link to="/?auth=signup">
                      <CustomButton  type="secondary">
                        Signup
                      </CustomButton>
                    </Link>
                  </p>
                </div>
            </div>
          </div>
        </div>
      ) : query.get('auth') === 'signup'  ? (
        <div className="modal_container">
          <div className="svg_modal">
            <Logo className="auth_logo" />

            <img src={AuthSvg} alt="delivery" />
            <svg style={{ position: 'absolute', right: '-150px', bottom: 0 }} width="285" height="289" viewBox="0 0 285 289" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g style={{ mixBlendMode: 'overlay' }}>
                <path d="M285 144.5C285 224.305 221.201 289 142.5 289C63.7994 289 0 224.305 0 144.5C0 64.6949 63.7994 0 142.5 0C221.201 0 285 64.6949 285 144.5Z" fill="#003049" />
                <path d="M285 144.5C285 224.305 221.201 289 142.5 289C63.7994 289 0 224.305 0 144.5C0 64.6949 63.7994 0 142.5 0C221.201 0 285 64.6949 285 144.5Z" fill="url(#paint0_linear)" />
              </g>
              <defs>
                <linearGradient id="paint0_linear" x1="142.5" y1="0" x2="142.5" y2="289" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" />
                  <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="control_auth_btn">
              <h4>Already have an account ?</h4>
              <Link to="/?auth=login">
                <CustomButton  type="secondary">
                  Login
                </CustomButton>
              </Link>
            </div>
          </div>

          <div className="form_content">
            <div className="create_acc_form_body">
              <div className="auth_form_text">
                <h3>Create Account</h3>
                <svg width="255" style={{ position: 'absolute', top: '31px', left: '3px', transform: 'rotate(- 1deg)' }} height="18" viewBox="0 0 287 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.691615 16.4507C114.295 3.73681 238.284 4.93118 286.078 7.1176" stroke="#F77F00" stroke-width="3" />
                </svg>

              </div>

              <form className="auth_form" onSubmit={handlesignupSubmit(onSubmitSignupForm)}>
              {currentUser.status === 'failed' ? <Alert
                  message={currentUser.errorMessage}
                  showIcon
                  style={{margin: '5px 0'}}
                  type="error"
                  closable
                /> : currentUser.status === 'success' ?
                <Alert
                message={currentUser.successMessage}
                showIcon
                style={{margin: '5px 0'}}
                type="success"
                closable
              />: ''
              }
                <label for="email" className="auth_form_label">Email</label>
                <input id="email" type="email" ref={registerSignup} className="email_input" name="email" />
                {errorsSignup.email && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.email.message} type="error" />}

                <label for="firstname"  style={{ marginTop: '15px' }} className="auth_form_label">Firstname</label>
                <input type="text" ref={registerSignup} id="firstName" className="firstname_input" name="firstname" />
                {errorsSignup.firstname && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.firstname.message} type="error" />}

                <label for="lastname" style={{ marginTop: '15px' }} className="auth_form_label">Lastname</label>
                <input type="text" id="lastname" ref={registerSignup} className="lastname_input" name="lastname" />
                {errorsSignup.lastname && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.lastname.message} type="error" />}

                <label for="phone" style={{ marginTop: '15px' }} className="auth_form_label">Phone Number</label>
                <input type="number" id="phone" ref={registerSignup} className="lastname_input" name="phone" />
                {errorsSignup.phone && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.phone.message} type="error" />}

                <label for="address" style={{ marginTop: '15px' }} className="auth_form_label">Address</label>
                <input type="text" id="address" ref={registerSignup} className="lastname_input" name="address" />
                {errorsSignup.address && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.address.message} type="error" />}

                <label for="password" style={{ marginTop: '15px' }} className="auth_form_label">Password</label>
                <input type="password" id="password" ref={registerSignup} className="password_input" name="password" />
                {errorsSignup.password && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errorsSignup.password.message} type="error" />}

                <div className="auth_btn_container">
                 <input style={{ position: 'absolute', bottom: 0, zIndex: 2, width: '61%', opacity: 0, cursor: 'pointer' }} type="submit" />
                  <CustomButton loading={currentUser && currentUser.loading} style={{ width: '180px' }} type="primary">Signup</CustomButton>
                </div>

                <div className="mobile_auth_switch">
                  <p>Already have an account ?
                    <Link to="/?auth=login">
                      <CustomButton  type="secondary">
                        Login
                      </CustomButton>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : ''
      }
    </Modal >
  );
}


export default Auth;