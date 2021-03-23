import React from 'react';
import Logo from '../../../components/Logo';
import './login.css';
import vehicleSvg from '../../../img/delivery_truck_login.svg';
import { Link } from 'react-router-dom';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from '../../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Alert, Button } from 'antd';
import { company_api_auth_idle, loginCompany } from '../../../features/company_slice/current_company_slice';

const Loginschema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(4).required(),
  });

function LogisticsCompanyLogin() {
    const { register, handleSubmit, errors } = useForm({
        resolver: yupResolver(Loginschema)
      });
    
       const dispatch = useDispatch();
      const currentCompany = useSelector(state => state.currentCompany);
    //   const query = useQuery();
    //   const location = useLocation();
    //   const history = useHistory();

      const onSubmitLoginForm = data => {
        dispatch(loginCompany(data));
        dispatch(company_api_auth_idle());
      };


    return (
        <div className="logis_auth_container">
            <div className="logis_side_panel">
                <svg style={{ position: 'absolute', right: '-109px' }} width="285" height="251" viewBox="0 0 285 251" fill="none" xmlns="http://www.w3.org/2000/svg"><g style={{ mixBlendMode: 'overlay' }}><path d="M285 106.5C285 186.305 221.201 251 142.5 251C63.7994 251 0 186.305 0 106.5C0 26.6949 63.7994 -38 142.5 -38C221.201 -38 285 26.6949 285 106.5Z" fill="#003049" /><path d="M285 106.5C285 186.305 221.201 251 142.5 251C63.7994 251 0 186.305 0 106.5C0 26.6949 63.7994 -38 142.5 -38C221.201 -38 285 26.6949 285 106.5Z" fill="url(#paint0_linear)" /></g><defs><linearGradient id="paint0_linear" x1="142.5" y1="-38" x2="142.5" y2="251" gradientUnits="userSpaceOnUse"><stop stop-color="white" /><stop offset="1" stop-color="white" stop-opacity="0" /></linearGradient></defs></svg>
                <Link to="/"><Logo className="logis_logo" /></Link>

                <div className="logis_panel_content">
                    <h1>For Logistics company</h1>
                    <p className="logis_panel_text login_panel_text">Welcome Back ! <br />
                        We Are Happy to See You. 👋
                    </p>
                    <img className="logis_panel_img login_panel_img" src={vehicleSvg} alt="logistic vehicle" />

                    <div className="auth_switch login_auth_switch">
                        <p>Don't have an account ?</p>
                        <Link to="/company/signup"><button className="auth_switch_btn">Signup</button></Link>
                    </div>
                </div>
            </div>

            <div className="logis_form_content">

                <div className="logis_login_form_body">
                        {currentCompany.status === 'failed' ? <Alert
                            message={currentCompany.errorMessage}
                            showIcon
                            style={{margin: '5px 0'}}
                            type="error"
                            closable
                            /> : currentCompany.status === 'success' ?
                            <Alert
                            message={currentCompany.successMessage}
                            showIcon
                            style={{margin: '5px 0'}}
                            type="success"
                            closable
                        />: ''}
                    <div className="login_logis_auth_form logis_auth_form_text">
                        <h3>Login</h3>
                        <svg id="logis_auth_login_svg" style={{ position: 'absolute', left: '-3px', top: '31px' }} width="90" height="17" viewBox="0 0 90 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.47994 15.4037C35.387 3.07519 73.6995 4.62618 88.6173 6.94274" stroke="#F77F00" stroke-width="3" />
                        </svg>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitLoginForm)} className="logis_auth_form">
                        <label for="email" className="logis_auth_form_label">Email</label>
                        <input id="email" ref={register} type="email" className="email_input" name="email" />
                        {errors.email && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errors.email.message} type="error" />}

                        <label for="password" style={{ marginTop: '15px' }} className="logis_auth_form_label">Password</label>
                        <input type="password" ref={register} id="password" className="password_input" name="password" />
                        {errors.password && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errors.password.message} type="error" />}

                        <div className="auth_btn_container">
                       {currentCompany && currentCompany.loading ? '' : <input style={{ position: 'absolute', bottom: 0, zIndex: 2, width: '61%', opacity: 0, cursor: 'pointer' }} type="submit" />}
                            <CustomButton loading={currentCompany && currentCompany.loading} style={{ width: '180px' }} type="primary">Login</CustomButton>
                        </div>
                            {
                            JSON.parse(localStorage.getItem('token')) && JSON.parse(localStorage.getItem('token')).role === 'company' && <Button style={{width: '56%', marginTop: '28px', margin: '15px auto'}} onClick={()=>{
                                window.location.href = '/company/dashboard'
                            }} type="primary">Go To Dashboard</Button>
                            }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LogisticsCompanyLogin;
