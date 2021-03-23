import React, { useEffect, useState } from 'react';
import SideBar from '../../../components/SideBar';
import { Layout, message } from 'antd';
import HeaderBar from '../../../HeaderBar';
import './index.css';
import '../generalUserStyle.css';
import OrderTable from '../../../components/OrderTable/OrderTable';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Auth from '../../../components/AuthModal';
import CheckUserAuth from '../../../components/checkUserAuth/checkAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from "socket.io-client";
import { CONNECTION_PORT } from '../../../App';
import { fetch_orders, updateOrderStatus } from '../../../features/order_user_slice/order_user_slice';
const { Content } = Layout;

let socket;

function Order() {
    const userOrder = useSelector(state => state.userOrder);
    const history = useHistory();
    const dispatch = useDispatch();
    const [orderPackageValue, setOrderPackageValue] = useState('');
    const [token] = useState( JSON.parse(window.localStorage.getItem('token')))
    const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchedOrders, setSearchedOrders] = useState();
    const currentUser = useSelector(state => state.currentuser);

    const searchOrders = (e) =>{
        e.preventDefault();
        if(!(orderPackageValue.trim() || orderTrackingNumber.trim()))
            return message.error('Order name or Tracking Number is required', 5);
        setLoading(true);
        axios.get(`/user/orders/search?track_id=${orderTrackingNumber}&order_name=${orderPackageValue}`)
        .then(function (response) {
            setSearchedOrders(response.data.data.data);
            setLoading(false)
        })
        .catch(function (error) {
            setLoading(false);
            if (error.message.indexOf('Network Error') !== -1) {
                message.error('Looks Like you are not connected to the internet');
            } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                localStorage.removeItem('token');
                message.error('Not Authorized');
                setShowAuthModal(true);
            } else {
                message.error('something went wrong');
            }
        });
    }

    useEffect(()=>{
        if(!token || (token && token.role !== 'user')){
            return history.push('/?auth=login')
         }else if(!userOrder.orders.length > 0){
            dispatch(fetch_orders())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        socket = io(CONNECTION_PORT);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [CONNECTION_PORT]);
    
      useEffect(() => {
        const adminEventHandler = (data) => {
            toast.info(`🎉 ${data.body}`, {
                position: "top-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClick: ()=>{
                    history.push(data.link);
                },
             });

             data.order_status && dispatch(updateOrderStatus({
                order_status: data.order_status,
                track_number: data.track_number
            }))

         }
        socket.on("receive_notification_from_admin", adminEventHandler);
    
        return () => {
            socket.off('receive_notification_from_admin', adminEventHandler);
         };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      useEffect(()=>{
          if(currentUser.data.id){
              socket.emit("enter_user_room_through_id", {id : currentUser.data.id});
          }
            console.count('useffect with userid dependency is counting')
      }, [currentUser.data.id])


    return (
        <div className="dashboard_container" >
                 <CheckUserAuth />
            <Auth setShowModal={showAuthModal} refreshAfterSuccess={true} disableClose={true} />
            {(userOrder.orders_errorMessage || userOrder.order_analytics_errorMessage) === 'Not Authorized' && setShowAuthModal(true)}

            <SideBar active="order" />
            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <HeaderBar />

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
                        }} to="/user/dashboard">Create Order</Link>
                    </div>

                    <div className="search_order">
                        <form onSubmit={searchOrders}>
                            <div>
                                <label for="order_name">What are you loooking for?</label>
                                <div className="search_order_input_container">
                                    <input value={orderPackageValue} onChange={(e)=> setOrderPackageValue(e.target.value)} placeholder="search by order name" name="order_name" id="order_name" />
                                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.23961 9.66797C7.53584 9.66797 9.41354 7.60962 9.41354 5.06476C9.41354 2.53237 7.54715 0.461548 5.23961 0.461548C2.93207 0.461548 1.06567 2.53237 1.06567 5.06476C1.06567 7.59715 2.93207 9.66797 5.23961 9.66797ZM5.23961 1.45953C7.03813 1.45953 8.50862 3.08126 8.50862 5.06476C8.50862 7.04825 7.03813 8.66998 5.23961 8.66998C3.44108 8.66998 1.97059 7.04825 1.97059 5.06476C1.97059 3.08126 3.44108 1.45953 5.23961 1.45953Z" fill="#928888" /><path d="M7.42172 5.06473H7.98729C7.98729 3.38063 6.74303 2.02087 5.22729 2.02087V2.64461C6.43762 2.64461 7.42172 3.72992 7.42172 5.06473Z" fill="#928888" /><path d="M8.3833 8.47037C8.15707 8.71987 8.15707 9.10658 8.3833 9.35608L10.7361 11.9508C10.8492 12.0756 10.9962 12.138 11.132 12.138C11.2677 12.138 11.4261 12.0756 11.5279 11.9508C11.7541 11.7013 11.7541 11.3146 11.5279 11.0651L9.1751 8.47037C8.96018 8.23335 8.59821 8.23335 8.3833 8.47037Z" fill="#928888" /></g><defs><clipPath id="clip0"><rect width="11.3115" height="15.5935" fill="white" transform="translate(0.668945)" /></clipPath></defs></svg>
                                </div>
                            </div>

                            <div>
                                <label for="track_number">Tracking Number</label>
                                <div className="search_order_input_container">
                                    <input value={orderTrackingNumber} onChange={(e)=> setOrderTrackingNumber(e.target.value)}  placeholder="search by tracking number" name="track_number" id="track_number" />
                                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M5.23961 9.66797C7.53584 9.66797 9.41354 7.60962 9.41354 5.06476C9.41354 2.53237 7.54715 0.461548 5.23961 0.461548C2.93207 0.461548 1.06567 2.53237 1.06567 5.06476C1.06567 7.59715 2.93207 9.66797 5.23961 9.66797ZM5.23961 1.45953C7.03813 1.45953 8.50862 3.08126 8.50862 5.06476C8.50862 7.04825 7.03813 8.66998 5.23961 8.66998C3.44108 8.66998 1.97059 7.04825 1.97059 5.06476C1.97059 3.08126 3.44108 1.45953 5.23961 1.45953Z" fill="#928888" /><path d="M7.42172 5.06473H7.98729C7.98729 3.38063 6.74303 2.02087 5.22729 2.02087V2.64461C6.43762 2.64461 7.42172 3.72992 7.42172 5.06473Z" fill="#928888" /><path d="M8.3833 8.47037C8.15707 8.71987 8.15707 9.10658 8.3833 9.35608L10.7361 11.9508C10.8492 12.0756 10.9962 12.138 11.132 12.138C11.2677 12.138 11.4261 12.0756 11.5279 11.9508C11.7541 11.7013 11.7541 11.3146 11.5279 11.0651L9.1751 8.47037C8.96018 8.23335 8.59821 8.23335 8.3833 8.47037Z" fill="#928888" /></g><defs><clipPath id="clip0"><rect width="11.3115" height="15.5935" fill="white" transform="translate(0.668945)" /></clipPath></defs></svg>
                                </div>
                            </div>

                            <input type="submit" className="search_order_btn" value="Search"/>
                        </form>
                    </div>


                    <div className="order_table_container">
                        <h3>Orders Summary</h3>
                        <OrderTable belongsTo={'user'} loading={loading || userOrder.loading_orders} data={searchedOrders ? searchedOrders : userOrder.orders} />
                    </div>
                </Content>
            </div>
        </div>

    )
}

export default Order;
