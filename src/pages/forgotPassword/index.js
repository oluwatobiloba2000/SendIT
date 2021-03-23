import React, { useState } from 'react'
import Logo from '../../components/Logo';
import './forgotpassword.css';
import ForgotPasswordSvg from '../../img/forgotpassword_svg.svg';
import { Link, useHistory } from 'react-router-dom';
import { Alert, message, Spin } from 'antd';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const schema = yup.object().shape({
    email: yup.string().email().required(),
});


function ForgotPassword() {
    const { register,reset, handleSubmit, errors } = useForm({
        resolver: yupResolver(schema)
    });
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    const onSubmitEmail = data =>{
        setLoading(true)
        sendEmail(data);
    }

    
    const sendEmail = ({email}) => {
        axios.post(`/user/forgotpassword`, {
            email: email
        })
            .then(function (response) {
                setLoading(false)
                reset();
                history.push('/email/sent');
            })
            .catch(function (error) {
                setLoading(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    return message.error('network error', 2);
                } else if (error.response.data && error.response.data.error) {
                    return message.error(error.response.data.error, 5)
                } else {
                    message.error('something went wrong', 5);
                }
            });
    }

    return (
        <div className="forgot_password_container">
            <Link to="/">
                <Logo className="forgot_password_logo" />
            </Link>
            <div className="forgot_password_svg">
                <img src={ForgotPasswordSvg} alt="forgot password" />
            </div>
            <div className="forgot_password_content_container">
                <div className='forgot_password_title'>
                    <h1>Forgot Password ?</h1>
                    <svg width="445" height="28" viewBox="0 0 445 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.32482 26.0949C177.458 1.08404 369.916 6.87894 444.128 12.9028" stroke="#F77F00" stroke-width="3" />
                    </svg>
                </div>

                <h3 className="forgot_password_hint_text">Enter the email associated with your account</h3>
                <Spin tip="Sending, please wait ..." spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24, position: 'absolute', top: '20px'}} spin />} >
                <form onSubmit={handleSubmit(onSubmitEmail)} className="forgot_password_form">
                    <input ref={register} name="email" type="email" />
                    {errors.email && <Alert style={{fontSize: '11px', marginTop: '5px'}}  showIcon message={errors.email.message} type="error" />}

                    <div className="forgot_password_btn_container">
                        <input style={{cursor: 'pointer'}} type="submit" value="Next" />
                        <div></div>
                    </div>
                </form>
                </Spin>
            </div>
        </div>
    )
}

export default ForgotPassword
