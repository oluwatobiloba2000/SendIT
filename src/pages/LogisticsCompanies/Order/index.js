import React, { useEffect, useState } from 'react';
import { Button, Layout, message, Select, Tooltip } from 'antd';
import './index.css';
import '../../User/generalUserStyle.css';
import OrderTable from '../../../components/OrderTable/OrderTable';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import CheckCompanyAuth from '../../../components/checkCompanyAuth/checkAuth';
import CompanySideBar from '../CompanySideBar';
import CompanyHeaderBar from '../CompanyHeaderBar';
import { fetch_all_orders_company } from '../../../features/order_company_slice/order_company_slice';
import { RedoOutlined } from '@ant-design/icons';
const { Option } = Select;
const { Content } = Layout;


function CompanyOrder() {
    const companyOrder = useSelector(state => state.companyOrder);
    const history = useHistory();
    const dispatch = useDispatch();
    const [token] = useState(JSON.parse(localStorage.getItem('token')));
    const [orderPackageValue, setOrderPackageValue] = useState('');
    const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchedOrders, setSearchedOrders] = useState();

    const searchOrders = (e, order_status, from_search) => {
        e && e.preventDefault();
        if (!from_search && !(orderPackageValue.trim() || orderTrackingNumber.trim()))
            return message.error('Order name or Tracking Number is required', 5);
        setLoading(true);
        axios.get(`/company/orders/search?order_status=${order_status}${orderTrackingNumber && `&track_id=${orderTrackingNumber}`}${orderPackageValue && `&order_name=${orderPackageValue}`}`)
            .then(function (response) {
                setSearchedOrders(response.data.data.data);
                setLoading(false)
            })
            .catch(function (error) {
                setLoading(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    message.error('Looks Like you are not connected to the internet');
                } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                    history.push('/company/login');
                    message.error('Not Authorized');
                } else {
                    message.error('something went wrong');
                }
            });
    }

    useEffect(() => {
        if(!token || (token && token.role !== 'company')){
            return history.push('/company/login');
        }else if(!companyOrder.orders.length > 0){
            dispatch(fetch_all_orders_company())
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="dashboard_container" >
            <CheckCompanyAuth />
            <CompanySideBar active="order" />
            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <CompanyHeaderBar />

                {/* page content starts */}
                <Content className="user_content">

                    <div className="page_title">
                        <h2>All Orders</h2>
                        <Link style={{
                            backgroundColor: '#f77f00',
                            width: '130px',
                            textAlign: 'center',
                            height: '28px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: ' 20px 20px 0',
                            color: 'white'
                        }} to="/company/dashboard">Create Order</Link>
                    </div>

                    <div className="search_order">
                        <form onSubmit={(e) => searchOrders(e)}>
                            <div>
                                <label for="order_name">What are you loooking for?</label>
                                <div className="search_order_input_container">
                                    <input value={orderPackageValue} onChange={(e) => setOrderPackageValue(e.target.value)} placeholder="search by order name" name="order_name" id="order_name" />
                                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.23961 9.66797C7.53584 9.66797 9.41354 7.60962 9.41354 5.06476C9.41354 2.53237 7.54715 0.461548 5.23961 0.461548C2.93207 0.461548 1.06567 2.53237 1.06567 5.06476C1.06567 7.59715 2.93207 9.66797 5.23961 9.66797ZM5.23961 1.45953C7.03813 1.45953 8.50862 3.08126 8.50862 5.06476C8.50862 7.04825 7.03813 8.66998 5.23961 8.66998C3.44108 8.66998 1.97059 7.04825 1.97059 5.06476C1.97059 3.08126 3.44108 1.45953 5.23961 1.45953Z" fill="#928888" /><path d="M7.42172 5.06473H7.98729C7.98729 3.38063 6.74303 2.02087 5.22729 2.02087V2.64461C6.43762 2.64461 7.42172 3.72992 7.42172 5.06473Z" fill="#928888" /><path d="M8.3833 8.47037C8.15707 8.71987 8.15707 9.10658 8.3833 9.35608L10.7361 11.9508C10.8492 12.0756 10.9962 12.138 11.132 12.138C11.2677 12.138 11.4261 12.0756 11.5279 11.9508C11.7541 11.7013 11.7541 11.3146 11.5279 11.0651L9.1751 8.47037C8.96018 8.23335 8.59821 8.23335 8.3833 8.47037Z" fill="#928888" /></g><defs><clipPath id="clip0"><rect width="11.3115" height="15.5935" fill="white" transform="translate(0.668945)" /></clipPath></defs></svg>
                                </div>
                            </div>

                            <div>
                                <label for="track_number">Tracking Number</label>
                                <div className="search_order_input_container">
                                    <input value={orderTrackingNumber} onChange={(e) => setOrderTrackingNumber(e.target.value)} placeholder="search by tracking number" name="track_number" id="track_number" />
                                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.23961 9.66797C7.53584 9.66797 9.41354 7.60962 9.41354 5.06476C9.41354 2.53237 7.54715 0.461548 5.23961 0.461548C2.93207 0.461548 1.06567 2.53237 1.06567 5.06476C1.06567 7.59715 2.93207 9.66797 5.23961 9.66797ZM5.23961 1.45953C7.03813 1.45953 8.50862 3.08126 8.50862 5.06476C8.50862 7.04825 7.03813 8.66998 5.23961 8.66998C3.44108 8.66998 1.97059 7.04825 1.97059 5.06476C1.97059 3.08126 3.44108 1.45953 5.23961 1.45953Z" fill="#928888" /><path d="M7.42172 5.06473H7.98729C7.98729 3.38063 6.74303 2.02087 5.22729 2.02087V2.64461C6.43762 2.64461 7.42172 3.72992 7.42172 5.06473Z" fill="#928888" /><path d="M8.3833 8.47037C8.15707 8.71987 8.15707 9.10658 8.3833 9.35608L10.7361 11.9508C10.8492 12.0756 10.9962 12.138 11.132 12.138C11.2677 12.138 11.4261 12.0756 11.5279 11.9508C11.7541 11.7013 11.7541 11.3146 11.5279 11.0651L9.1751 8.47037C8.96018 8.23335 8.59821 8.23335 8.3833 8.47037Z" fill="#928888" /></g><defs><clipPath id="clip0"><rect width="11.3115" height="15.5935" fill="white" transform="translate(0.668945)" /></clipPath></defs></svg>
                                </div>
                            </div>

                            <input type="submit" className="search_order_btn" value="Search" />
                        </form>
                    </div>


                    <div className="order_table_container">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>Orders Summary</h3>
                            <div className="order_filter_container">
                                <Select onChange={(order_status) => {
                                    searchOrders(null, order_status, 'from_search')
                                }
                                } style={{ width: '115px' }} defaultValue="All">
                                    <Option value="In Transit">In Transit</Option>
                                    <Option value="Approved">Approved</Option>
                                    <Option value="Cancelled">Cancelled</Option>
                                </Select>
                                <Tooltip  placement="topRight" title={"Refresh"}>
                                    <Button style={{marginLeft: '20px', marginRight: '10px'}} onClick={()=>{
                                        setSearchedOrders(null)
                                         dispatch(fetch_all_orders_company())
                                    }} type="primary" shape="circle" icon={<RedoOutlined />} size={'lg'} />
                                </Tooltip>
                            </div>
                        </div>
                        <OrderTable loading={loading || companyOrder.loading_orders} data={searchedOrders ? searchedOrders : companyOrder.orders} />
                    </div>
                </Content>
            </div>
        </div>

    )
}

export default CompanyOrder;
