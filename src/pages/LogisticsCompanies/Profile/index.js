import React, { useEffect, useState } from 'react';
import { Image, Layout } from 'antd';
import './index.css';
import '../../../pages/User/generalUserStyle.css';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { LetterAvatar } from '../../../components/Avatar/avatar';
import dayjs from 'dayjs';
import CheckCompanyAuth from '../../../components/checkCompanyAuth/checkAuth';
import CompanySideBar from '../CompanySideBar';
import CompanyHeaderBar from '../CompanyHeaderBar';

const { Content } = Layout;
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

function Profile() {
    const history = useHistory();
    const [token] = useState(JSON.parse(window.localStorage.getItem('token')))
    const currentCompany = useSelector(state => state.currentCompany.data);
    useEffect(() => {
        if (!token || (token && token.role !== 'company')) {
            history.push('/?auth=login')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className="dashboard_container">
            <CheckCompanyAuth />
            <CompanySideBar active="profile" />
            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <CompanyHeaderBar />

                {/* page content starts */}
                <Content className="user_content">
                    <h1>Profile</h1>
                    {currentCompany && <div className="profile_container">
                        <div className="profile_picture">
                            {currentCompany.logo ? <Image style={{
                                width: '201px',
                                height: '190px',
                                borderRadius: '5px'
                            }} src={currentCompany.logo} /> : <LetterAvatar className="letter_avatar_div" letter={`${currentCompany.company_name}`} />}
                        </div>
                        <div className="profile_details">
                            <h3 style={{ marginBottom: '35px' }}>Profile Details</h3>

                            <div className="profile_details_list">
                                <h4>Email</h4>
                                <p>{currentCompany.email}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Company Name</h4>
                                <p>{currentCompany.company_name}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Phonenumber</h4>
                                <p>{currentCompany.phone}</p>
                            </div>
                        </div>
                    </div>}
                </Content>
            </div>
        </div>

    )
}

export default Profile;
