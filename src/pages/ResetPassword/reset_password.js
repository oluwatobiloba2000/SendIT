import React, { useEffect, useState } from 'react'
import Logo from '../../components/Logo';
import '../forgotPassword/forgotpassword.css';
import { Link } from 'react-router-dom';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import useQuery from '../../customhook/useQuery';
import { Alert, Button, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import './reset.css'
const schema = yup.object().shape({
    password: yup.string().min(5).required(),
});

function ResetPassword() {
    const query = useQuery();
    const email = query.get('email');
    const token = query.get('token');

    const { register, reset, handleSubmit, errors } = useForm({
        resolver: yupResolver(schema)
    });
    const [error, setError] = useState();
    const [success, setSuccess] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token && !email) {
            return setError('Invalid Access')
        } else {
            return setError('');
        }
    }, [token, email])

    const onSubmitPassword = data => {
        setLoading(true)
        resetPassword(data);
    }

    const resetPassword = ({ password }) => {
        axios.post(`/user/reset/password?token=${token}&email=${email}`, {
            password
        })
            .then(function (response) {
                setLoading(false)
                reset();
                setSuccess('Your password has been changed successfully !');
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


    // expect email and token from queries /?email=d@d.com&token=kdkkd
    return (
        <div className="forgot_password_container">
            <Link to="/">
                <Logo className="forgot_password_logo" />
            </Link>

            <div className="forgot_password_content_container">
                <div className='forgot_password_title'>
                    <h1>Reset Password</h1>
                    <svg width="445" height="28" viewBox="0 0 445 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.32482 26.0949C177.458 1.08404 369.916 6.87894 444.128 12.9028" stroke="#F77F00" stroke-width="3" />
                    </svg>
                </div>

                {error ? <div>
                        <Alert showIcon message={error} type={'error'} />
                        <Link to="/"><Button style={{marginTop: '10px'}} type="primary">Go Home</Button></Link>
                    </div>
                    :
                    success ?
                        <div>
                          <Alert showIcon message={success} type={'success'} />
                          <Link to="/?auth=login"><Button style={{marginTop: '10px'}} type="primary">Login</Button></Link>
                        </div>
                        :
                        <>
                            <h3 className="forgot_password_hint_text">Enter your new password</h3>
                            <Spin tip="Sending, please wait ..." spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24, position: 'absolute', top: '20px' }} spin />} >
                                <form onSubmit={handleSubmit(onSubmitPassword)} className="forgot_password_form">
                                    <input type="password" ref={register} name="password" className="reset_password_input" placeholder="new password" />
                                    {errors.password && <Alert style={{ fontSize: '11px', marginTop: '5px' }} showIcon message={errors.password.message} type="error" />}

                                    <div className="forgot_password_btn_container">
                                        <input style={{cursor: 'pointer'}} type="submit" value="Next" />
                                        <div></div>
                                    </div>
                                </form>
                            </Spin>
                        </>
                }
            </div>
        </div>
    )
}

export default ResetPassword
