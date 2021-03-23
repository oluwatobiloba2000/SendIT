import { Dropdown, Image, Layout, Menu, Spin } from 'antd';
import React from 'react'
import './HeaderBar.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LetterAvatar } from '../../../components/Avatar/avatar';
import { LoadingOutlined } from '@ant-design/icons';
import LogisticsCompanyHandleSocketConnection from '../Logistics_Company_HandleSocketConnection';
const { Header } = Layout;

const menu = (
    <Menu>
        <Menu.Item>
            <Link to="/company/profile">
                Profile
        </Link>
        </Menu.Item>
        <Menu.Item onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/company/login'
        }} danger>Logout</Menu.Item>
    </Menu>
);


function CompanyHeaderBar() {
    const currentCompany = useSelector(state => state.currentCompany);
    return (
        <>
        <LogisticsCompanyHandleSocketConnection />
        <Header className="headerbar">
            <div className='headerbar_widjet'>
                <div className="notification_bell">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.5146 16L6.6946 14.818C7.0726 14.44 7.2806 13.938 7.2806 13.404V8.72696C7.2806 7.36996 7.8706 6.07296 8.9006 5.17096C9.9386 4.26096 11.2606 3.86096 12.6376 4.04196C14.9646 4.35096 16.7196 6.45496 16.7196 8.93695V13.404C16.7196 13.938 16.9276 14.44 17.3046 14.817L18.4856 16H5.5146ZM13.9996 18.341C13.9996 19.24 13.0836 20 11.9996 20C10.9156 20 9.9996 19.24 9.9996 18.341V18H13.9996V18.341ZM20.5206 15.208L18.7196 13.404V8.93696C18.7196 5.45596 16.2176 2.49896 12.8996 2.05996C10.9776 1.80396 9.0376 2.39096 7.5826 3.66696C6.1186 4.94896 5.2806 6.79296 5.2806 8.72696L5.2796 13.404L3.4786 15.208C3.0096 15.678 2.8706 16.377 3.1246 16.99C3.3796 17.604 3.9726 18 4.6366 18H7.9996V18.341C7.9996 20.359 9.7936 22 11.9996 22C14.2056 22 15.9996 20.359 15.9996 18.341V18H19.3626C20.0266 18 20.6186 17.604 20.8726 16.991C21.1276 16.377 20.9896 15.677 20.5206 15.208Z" fill="#223345" />
                        <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="2" y="2" width="19" height="20">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.5146 16L6.6946 14.818C7.0726 14.44 7.2806 13.938 7.2806 13.404V8.72696C7.2806 7.36996 7.8706 6.07296 8.9006 5.17096C9.9386 4.26096 11.2606 3.86096 12.6376 4.04196C14.9646 4.35096 16.7196 6.45496 16.7196 8.93695V13.404C16.7196 13.938 16.9276 14.44 17.3046 14.817L18.4856 16H5.5146ZM13.9996 18.341C13.9996 19.24 13.0836 20 11.9996 20C10.9156 20 9.9996 19.24 9.9996 18.341V18H13.9996V18.341ZM20.5206 15.208L18.7196 13.404V8.93696C18.7196 5.45596 16.2176 2.49896 12.8996 2.05996C10.9776 1.80396 9.0376 2.39096 7.5826 3.66696C6.1186 4.94896 5.2806 6.79296 5.2806 8.72696L5.2796 13.404L3.4786 15.208C3.0096 15.678 2.8706 16.377 3.1246 16.99C3.3796 17.604 3.9726 18 4.6366 18H7.9996V18.341C7.9996 20.359 9.7936 22 11.9996 22C14.2056 22 15.9996 20.359 15.9996 18.341V18H19.3626C20.0266 18 20.6186 17.604 20.8726 16.991C21.1276 16.377 20.9896 15.677 20.5206 15.208Z" fill="white" />
                        </mask>
                        <g mask="url(#mask0)">
                        </g>
                        <circle cx="18" cy="6" r="4" fill="#F42B3D" />
                    </svg>
                </div>

                <div className='settings'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3745 20H12.6255V19.233C12.6255 18.298 13.2005 17.458 14.0895 17.091C15.0095 16.708 16.0145 16.896 16.6765 17.562L17.2155 18.103L18.1035 17.215L17.5585 16.671C16.8955 16.009 16.7085 15.005 17.0815 14.114C17.0815 14.114 17.0825 14.113 17.0825 14.112L17.0935 14.084C17.4575 13.201 18.2985 12.625 19.2335 12.625H19.9995V11.375H19.2335C18.2985 11.375 17.4575 10.8 17.0915 9.911C16.7065 8.991 16.8955 7.986 17.5615 7.323L18.1025 6.784L17.2155 5.897L16.6705 6.442C16.0085 7.104 15.0055 7.291 14.1145 6.919C13.2015 6.542 12.6255 5.702 12.6255 4.767V4H11.3745V4.767C11.3745 5.702 10.7995 6.542 9.91051 6.909C8.99151 7.294 7.98651 7.105 7.32351 6.438L6.78451 5.897L5.89651 6.785L6.44151 7.329C7.10351 7.991 7.29151 8.995 6.91851 9.886C6.54251 10.799 5.70151 11.375 4.76651 11.375H3.99951V12.625H4.76651C5.70151 12.625 6.54251 13.2 6.90851 14.089C7.29351 15.009 7.10451 16.014 6.43851 16.677L5.89751 17.216L6.78451 18.103L7.32951 17.558C7.99151 16.896 8.99451 16.709 9.88551 17.081C10.7985 17.458 11.3745 18.298 11.3745 19.233V20ZM12.9425 22H11.0505C10.1265 22 9.37451 21.248 9.37451 20.324V19.233C9.37451 19.086 9.25751 18.985 9.14751 18.94C9.00351 18.881 8.84951 18.869 8.74351 18.972L7.97351 19.743C7.31751 20.397 6.25151 20.399 5.59651 19.743L4.25651 18.403C3.93851 18.085 3.76451 17.663 3.76451 17.213C3.76551 16.764 3.94051 16.342 4.25951 16.024L5.02751 15.259C5.13251 15.154 5.12151 15 5.07451 14.889C5.01451 14.742 4.91451 14.625 4.76651 14.625H3.68251C2.75451 14.625 1.99951 13.871 1.99951 12.943V11.051C1.99951 10.126 2.75151 9.375 3.67651 9.375H4.76651C4.91351 9.375 5.01451 9.257 5.05951 9.147C5.11951 9.003 5.13151 8.848 5.02751 8.744L4.25651 7.974C3.60251 7.317 3.60251 6.251 4.25651 5.597L5.59651 4.257C5.91451 3.939 6.33551 3.765 6.78451 3.765H6.78651C7.23551 3.765 7.65851 3.94 7.97551 4.259L8.74051 5.028C8.84551 5.134 9.00051 5.122 9.11151 5.075C9.25751 5.014 9.37451 4.914 9.37451 4.767V3.683C9.37451 2.755 10.1295 2 11.0575 2H12.9495C13.8735 2 14.6255 2.752 14.6255 3.676V4.767C14.6255 4.914 14.7425 5.015 14.8525 5.06C14.9975 5.12 15.1515 5.133 15.2565 5.028L16.0265 4.257C16.6825 3.603 17.7485 3.601 18.4035 4.257L19.7445 5.598C20.0625 5.915 20.2365 6.337 20.2355 6.787C20.2355 7.235 20.0605 7.658 19.7415 7.975L18.9725 8.741C18.8675 8.846 18.8785 9 18.9255 9.111C18.9855 9.258 19.0855 9.375 19.2335 9.375H20.3175C21.2455 9.375 21.9995 10.129 21.9995 11.057V12.949C21.9995 13.874 21.2485 14.625 20.3235 14.625H19.2335C19.0865 14.625 18.9855 14.743 18.9405 14.853C18.9395 14.854 18.9275 14.884 18.9265 14.886C18.8805 14.997 18.8685 15.152 18.9725 15.256L19.7435 16.026C20.3975 16.683 20.3975 17.749 19.7435 18.403L18.4035 19.743C18.0855 20.061 17.6645 20.235 17.2155 20.235H17.2135C16.7645 20.235 16.3415 20.06 16.0245 19.741L15.2595 18.972C15.1545 18.867 14.9985 18.879 14.8885 18.925C14.7425 18.986 14.6255 19.086 14.6255 19.233V20.317C14.6255 21.245 13.8705 22 12.9425 22ZM12 10.5C11.173 10.5 10.5 11.173 10.5 12C10.5 12.827 11.173 13.5 12 13.5C12.827 13.5 13.5 12.827 13.5 12C13.5 11.173 12.827 10.5 12 10.5ZM12 15.5C10.07 15.5 8.50001 13.93 8.50001 12C8.50001 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" fill="#223345" />
                        <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="1" y="2" width="21" height="20">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3745 20H12.6255V19.233C12.6255 18.298 13.2005 17.458 14.0895 17.091C15.0095 16.708 16.0145 16.896 16.6765 17.562L17.2155 18.103L18.1035 17.215L17.5585 16.671C16.8955 16.009 16.7085 15.005 17.0815 14.114C17.0815 14.114 17.0825 14.113 17.0825 14.112L17.0935 14.084C17.4575 13.201 18.2985 12.625 19.2335 12.625H19.9995V11.375H19.2335C18.2985 11.375 17.4575 10.8 17.0915 9.911C16.7065 8.991 16.8955 7.986 17.5615 7.323L18.1025 6.784L17.2155 5.897L16.6705 6.442C16.0085 7.104 15.0055 7.291 14.1145 6.919C13.2015 6.542 12.6255 5.702 12.6255 4.767V4H11.3745V4.767C11.3745 5.702 10.7995 6.542 9.91051 6.909C8.99151 7.294 7.98651 7.105 7.32351 6.438L6.78451 5.897L5.89651 6.785L6.44151 7.329C7.10351 7.991 7.29151 8.995 6.91851 9.886C6.54251 10.799 5.70151 11.375 4.76651 11.375H3.99951V12.625H4.76651C5.70151 12.625 6.54251 13.2 6.90851 14.089C7.29351 15.009 7.10451 16.014 6.43851 16.677L5.89751 17.216L6.78451 18.103L7.32951 17.558C7.99151 16.896 8.99451 16.709 9.88551 17.081C10.7985 17.458 11.3745 18.298 11.3745 19.233V20ZM12.9425 22H11.0505C10.1265 22 9.37451 21.248 9.37451 20.324V19.233C9.37451 19.086 9.25751 18.985 9.14751 18.94C9.00351 18.881 8.84951 18.869 8.74351 18.972L7.97351 19.743C7.31751 20.397 6.25151 20.399 5.59651 19.743L4.25651 18.403C3.93851 18.085 3.76451 17.663 3.76451 17.213C3.76551 16.764 3.94051 16.342 4.25951 16.024L5.02751 15.259C5.13251 15.154 5.12151 15 5.07451 14.889C5.01451 14.742 4.91451 14.625 4.76651 14.625H3.68251C2.75451 14.625 1.99951 13.871 1.99951 12.943V11.051C1.99951 10.126 2.75151 9.375 3.67651 9.375H4.76651C4.91351 9.375 5.01451 9.257 5.05951 9.147C5.11951 9.003 5.13151 8.848 5.02751 8.744L4.25651 7.974C3.60251 7.317 3.60251 6.251 4.25651 5.597L5.59651 4.257C5.91451 3.939 6.33551 3.765 6.78451 3.765H6.78651C7.23551 3.765 7.65851 3.94 7.97551 4.259L8.74051 5.028C8.84551 5.134 9.00051 5.122 9.11151 5.075C9.25751 5.014 9.37451 4.914 9.37451 4.767V3.683C9.37451 2.755 10.1295 2 11.0575 2H12.9495C13.8735 2 14.6255 2.752 14.6255 3.676V4.767C14.6255 4.914 14.7425 5.015 14.8525 5.06C14.9975 5.12 15.1515 5.133 15.2565 5.028L16.0265 4.257C16.6825 3.603 17.7485 3.601 18.4035 4.257L19.7445 5.598C20.0625 5.915 20.2365 6.337 20.2355 6.787C20.2355 7.235 20.0605 7.658 19.7415 7.975L18.9725 8.741C18.8675 8.846 18.8785 9 18.9255 9.111C18.9855 9.258 19.0855 9.375 19.2335 9.375H20.3175C21.2455 9.375 21.9995 10.129 21.9995 11.057V12.949C21.9995 13.874 21.2485 14.625 20.3235 14.625H19.2335C19.0865 14.625 18.9855 14.743 18.9405 14.853C18.9395 14.854 18.9275 14.884 18.9265 14.886C18.8805 14.997 18.8685 15.152 18.9725 15.256L19.7435 16.026C20.3975 16.683 20.3975 17.749 19.7435 18.403L18.4035 19.743C18.0855 20.061 17.6645 20.235 17.2155 20.235H17.2135C16.7645 20.235 16.3415 20.06 16.0245 19.741L15.2595 18.972C15.1545 18.867 14.9985 18.879 14.8885 18.925C14.7425 18.986 14.6255 19.086 14.6255 19.233V20.317C14.6255 21.245 13.8705 22 12.9425 22ZM12 10.5C11.173 10.5 10.5 11.173 10.5 12C10.5 12.827 11.173 13.5 12 13.5C12.827 13.5 13.5 12.827 13.5 12C13.5 11.173 12.827 10.5 12 10.5ZM12 15.5C10.07 15.5 8.50001 13.93 8.50001 12C8.50001 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" fill="white" />
                        </mask>
                        <g mask="url(#mask0)">
                        </g>
                    </svg>
                </div>
                <div className="user_profile_details">
                    {currentCompany.loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : <>
                        <div className="headerbar_userpics">
                            {currentCompany.data.logo ? <Image style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50px',
                                border: '3px solid black'
                            }} src={currentCompany.data.logo} /> : <LetterAvatar letter={`${currentCompany.data.company_name}`} rounded={true} />}
                        </div>
                        <div className="username">
                            {currentCompany.data.company_name}
                        </div></>}
                </div>

                <div className="dropdown_menu">
                    <Dropdown overlay={menu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9998 15.5C11.7438 15.5 11.4878 15.402 11.2928 15.207L7.29276 11.207C6.90176 10.816 6.90176 10.184 7.29276 9.79301C7.68376 9.40201 8.31576 9.40201 8.70676 9.79301L12.0118 13.098L15.3048 9.91801C15.7038 9.53501 16.3348 9.54601 16.7188 9.94301C17.1028 10.34 17.0918 10.974 16.6948 11.357L12.6948 15.219C12.4998 15.407 12.2498 15.5 11.9998 15.5Z" fill="#223345" />
                            <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="6" y="9" width="11" height="7">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9998 15.5C11.7438 15.5 11.4878 15.402 11.2928 15.207L7.29276 11.207C6.90176 10.816 6.90176 10.184 7.29276 9.79301C7.68376 9.40201 8.31576 9.40201 8.70676 9.79301L12.0118 13.098L15.3048 9.91801C15.7038 9.53501 16.3348 9.54601 16.7188 9.94301C17.1028 10.34 17.0918 10.974 16.6948 11.357L12.6948 15.219C12.4998 15.407 12.2498 15.5 11.9998 15.5Z" fill="white" />
                            </mask>
                            <g mask="url(#mask0)">
                            </g>
                        </svg>
                    </Dropdown>
                </div>
            </div>
        </Header>
      </>
    )
}

export default CompanyHeaderBar;
