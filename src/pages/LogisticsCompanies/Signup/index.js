import React, { useState } from 'react';
import Logo from '../../../components/Logo';
import './signup.css';
import vehicleSvg from '../../../img/delivery_truck.svg';
import { Link } from 'react-router-dom';
import { Alert, Button, message, Spin } from 'antd';
import PhotoUploader from '../../../components/PhotoUploader/'
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import {signupCompany } from '../../../features/company_slice/current_company_slice';
import { useForm } from 'react-hook-form';
import axios from 'axios';


const Signupschema = yup.object().shape({
    email: yup.string().email().required(),
    name: yup.string().min(2).required(),
    phonenumber: yup.string().min(10).required(),
    password: yup.string().min(4).required(),
});

function LogisticsCompanySignup() {
    const { register, handleSubmit, errors } = useForm({
        resolver: yupResolver(Signupschema)
    });
    const [uploadImgFile, setUploadImg] = useState();
    const [uploadLoading, setUplaodLoding] = useState(false);

    const dispatch = useDispatch();
    const currentCompany = useSelector(state => state.currentCompany);

    const uploadPhoto = (data) => {
        message.loading('uploading your logo', 1);
        setUplaodLoding(true)
        const formData = new FormData();
        formData.append('image', uploadImgFile);

        axios.post('/company/photo/upload', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                setUplaodLoding(false)
                // handle success
                if (response.status === 200) {
                    dispatch(signupCompany({ logo: response.data.data.secure_url, ...data }));
                }
            })
            .catch(function (error) {
                setUplaodLoding(false)
                return message.error('Looks Like you are not connected to the internet');
            });
        }

        const onSubmitSignupForm = data => {
        if (!uploadImgFile) {
            return message.error('Company Logo is required !', 5)
        }
        uploadPhoto(data);
    };

    return (
        <div className="logis_auth_container">
            <div className="logis_side_panel">
                <svg style={{ position: 'absolute', right: '-109px' }} width="285" height="251" viewBox="0 0 285 251" fill="none" xmlns="http://www.w3.org/2000/svg"><g style={{ mixBlendMode: 'overlay' }}><path d="M285 106.5C285 186.305 221.201 251 142.5 251C63.7994 251 0 186.305 0 106.5C0 26.6949 63.7994 -38 142.5 -38C221.201 -38 285 26.6949 285 106.5Z" fill="#003049" /><path d="M285 106.5C285 186.305 221.201 251 142.5 251C63.7994 251 0 186.305 0 106.5C0 26.6949 63.7994 -38 142.5 -38C221.201 -38 285 26.6949 285 106.5Z" fill="url(#paint0_linear)" /></g><defs><linearGradient id="paint0_linear" x1="142.5" y1="-38" x2="142.5" y2="251" gradientUnits="userSpaceOnUse"><stop stop-color="white" /><stop offset="1" stop-color="white" stop-opacity="0" /></linearGradient></defs></svg>
                <Link to="/"><Logo className="logis_logo" /></Link>

                <div className="logis_panel_content">
                    <h1>For Logistics company</h1>
                    <p className="logis_panel_text">Register Your Logistics Company With us and deliver parcels for over 1000+ clients Daily</p>
                    <img className="logis_panel_img" src={vehicleSvg} alt="logistic vehicle" />

                    <div className="auth_switch">
                        <p>Already have an account ?</p>
                        <Link to="/company/login"><button className="auth_switch_btn">Login</button></Link>
                    </div>
                </div>
            </div>

            <div style={{ overflow: 'auto', margin: '0 0px 24px 0px', position: 'relative' }} className="logis_form_content">
                <div style={{ width: '78%', position: 'relative' }} className="logis_signup_form_body">
                    {uploadLoading && <Spin style={{
                        zIndex: '100',
                        position: 'absolute',
                        height: '139%',
                        width: '100%',
                        backgroundColor: '#ffffffbf',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }} spinning={true} tip="Uploading Your Logo Please wait ....." />}
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

                    <div className="logis_auth_form_text">
                        <h3>Create An Account</h3>
                        <svg style={{ position: 'absolute', top: '33px' }} width="306" height="19" viewBox="0 0 306 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.15231 16.9113C122.29 -1.42944 254.507 5.23731 305.474 10.8633" stroke="#F77F00" stroke-width="3" />
                        </svg>
                    </div>
                    <form onSubmit={handleSubmit(onSubmitSignupForm)} className="logis_auth_form">
                        <label for="email" className="logis_auth_form_label">Company's Email</label>
                        <input id="email" ref={register} type="email" className="email_input" name="email" />
                        {errors.email && <Alert style={{ fontSize: '11px', marginTop: '5px' }} showIcon message={errors.email.message} type="error" />}

                        <label for="name" className="logis_auth_form_label">Company's Name</label>
                        <input id="name" ref={register} type="text" className="name_input" name="name" />
                        {errors.name && <Alert style={{ fontSize: '11px', marginTop: '5px' }} showIcon message={errors.name.message} type="error" />}

                        <label for="phonenumber" className="logis_auth_form_label">Company’s PhoneNumber</label>
                        <input id="phonenumber" ref={register} type="text" className="phone_input" name="phonenumber" />
                        {errors.phonenumber && <Alert style={{ fontSize: '11px', marginTop: '5px' }} showIcon message={errors.phonenumber.message} type="error" />}

                        <label for="password" style={{ marginTop: '15px' }} className="logis_auth_form_label">Password</label>
                        <input type="password" ref={register} id="password" className="password_input" name="password" />
                        {errors.password && <Alert style={{ fontSize: '11px', marginTop: '5px' }} showIcon message={errors.password.message} type="error" />}

                        <label for="logo" style={{ marginTop: '10px' }} className="logis_auth_form_label">Uplaod A logo</label>
                        <PhotoUploader onChange={(file) => setUploadImg(file)} />

                        <div className="auth_btn_container">
                            {currentCompany && currentCompany.loading ? '' : <input style={{ position: 'absolute', bottom: 0, zIndex: 2, width: '61%', opacity: 0, cursor: 'pointer' }} type="submit" />}
                            <Button loading={currentCompany && currentCompany.loading} style={{ width: '180px' }} type="primary">Signup</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LogisticsCompanySignup;
