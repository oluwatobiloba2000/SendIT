import React, { useEffect, useState } from 'react';
import SideBar from '../../../components/SideBar';
import { Image, Layout } from 'antd';
import HeaderBar from '../../../HeaderBar';
import './index.css';
import '../generalUserStyle.css';
import { useHistory } from 'react-router';
import CheckUserAuth from '../../../components/checkUserAuth/checkAuth';
import { useSelector } from 'react-redux';
import { LetterAvatar } from '../../../components/Avatar/avatar';
import dayjs from 'dayjs';
const { Content } = Layout;
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

function Profile() {
    const history = useHistory();
    const [token] = useState(JSON.parse(window.localStorage.getItem('token')))
    const currentuser = useSelector(state => state.currentuser.data);
    useEffect(() => {
        if (!token || (token && token.role !== 'user')) {
            history.push('/?auth=login')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className="dashboard_container">
            <CheckUserAuth />
            <SideBar active="profile" />
            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <HeaderBar />

                {/* page content starts */}
                <Content className="user_content">
                    <h1>Profile</h1>
                    {currentuser && <div className="profile_container">
                        <div className="profile_picture">
                            {currentuser.profile_pics ? <Image style={{
                                width: '201px',
                                height: '190px',
                                borderRadius: '5px'
                            }} src={currentuser.profile_pics} /> : <LetterAvatar className="letter_avatar_div" letter={`${currentuser.firstname} ${currentuser.lastname}`} />}
                        </div>
                        <div className="profile_details">
                            <h3 style={{ marginBottom: '35px' }}>Profile Details</h3>

                            <div className="profile_details_list">
                                <h4>Email</h4>
                                <p>{currentuser.email}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Firstname</h4>
                                <p>{currentuser.firstname}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Latsname</h4>
                                <p>{currentuser.lastname}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Phonenumber</h4>
                                <p>{currentuser.phone}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Address</h4>
                                <p>{currentuser.address}</p>
                            </div>

                            <div className="profile_details_list">
                                <h4>Joined</h4>
                                <p>{dayjs(currentuser.createdat).format('ddd [,] d MMMM YYYY')}</p>
                            </div>
                        </div>
                    </div>}
                </Content>
            </div>
        </div>

    )
}

export default Profile;
