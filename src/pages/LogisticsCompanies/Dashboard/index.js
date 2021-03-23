import React, { useState } from 'react';
import { Button, Image, Layout, message, Popconfirm } from 'antd';
import './index.css';
import '../../User/generalUserStyle.css';
import _ from 'lodash/core';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import emptySvg from '../../../img/empty.svg';
import CheckCompanyAuth from '../../../components/checkCompanyAuth/checkAuth';
import CompanyHeaderBar from '../CompanyHeaderBar';
import AnalogClock from '../../../components/LiveAnalogClock/clock';
import { LetterAvatar } from '../../../components/Avatar/avatar';
import CompanySideBar from '../CompanySideBar';
import { api_approve_order_success, addOrderToApprove ,company_fetch_orders_analytics, fetch_orders_ToApprove } from '../../../features/order_company_slice/order_company_slice';
import CustomLoader from '../../../components/Loader';
import dayjs from 'dayjs';
import io from "socket.io-client";
import axios from 'axios';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { CONNECTION_PORT } from '../../../App';
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const { Content } = Layout;
let socket;

function CompanyDashboard() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [token] = useState(JSON.parse(localStorage.getItem('token')));
    const currentCompany = useSelector(state => state.currentCompany);
    const companyOrder = useSelector(state => state.companyOrder);

    const handleApproveOrder = (track_number) => {
         message.loading('Approving.....', 1);
        axios.put(`/company/order/approve?track_id=${track_number}`)
            .then(function (response) {
            console.log("🚀 ~ file: order_company_slice.js ~ line 199 ~ response", {response})
               dispatch(api_approve_order_success({track_number: track_number}));

                message.success('order approved', 2);
                dispatch(company_fetch_orders_analytics())
                sendActivity(track_number, response.data.data.id, response.data.data.user_id);
                socket.emit("approve_order", {
                    room: 'all_company_room',
                    content: track_number
                })
                socket.emit("send_updates_to_order_details", {
                    track_number: track_number,
                    updateType: 'order_status',
                    content: {
                        status: response.data.data.order_status,
                        company: currentCompany.data.company_name
                 }
                })
                setTimeout(()=>{
                    history.push(`/company/track/order/${track_number}`)
                }, 1500)
            })
            .catch(function (error) {
                if (error.message.indexOf('Network Error') !== -1) {
                    message.error('Looks Like you are not connected to the internet', 1);
                } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                    message.error('Session expired', 1);
                    setTimeout(()=>{
                        window.location.href ='/company/login'
                    }, 2000);
                } else if (error.response.data && error.response.data.error) {
                    return message.error(error.response.data.error, 5)
                } else {
                    message.error('something went wrong', 1);
                }
            });
    }
 
 const sendActivity = (track_number, user_id) => {
    axios.post(`/company/order/activity/send?track_id=${track_number}`,{
        activity_content: `✅ Your order has been approved by ${currentCompany.data.company_name}`
    })
        .then(function (response) {
        //  TODO: do socket.io here
            socket.emit("send_notification_to_user_using_userid", {
                id : user_id,
                content: {
                    track_number: track_number,
                    title: 'Order Activity Update',
                    order_status: 'Approved',
                    body: 'Activity for one of your order has been updated',
                    link: `/user/track/order/${track_number}`
                }});

            socket.emit("send_updates_to_order_details", {
                track_number: track_number,
                updateType: 'activity_update',
                content: response.data.data
            })
        })
        .catch(function (error) {
        });
 }

    useEffect(() => {
        if(!token || (token && token.role !== 'company')){
            return history.push('/company/login');
        }else if (_.isEmpty(companyOrder.order_analytics)) {
            dispatch(company_fetch_orders_analytics())
            dispatch(fetch_orders_ToApprove())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        socket = io(CONNECTION_PORT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CONNECTION_PORT]);

    useEffect(()=>{
              socket.emit("enter_company_room", {id : 'all_company_room'});
      }, [])


    useEffect(() => {
        const recieveNewOrderToApprove = (data) => {
            dispatch(addOrderToApprove(data))

            toast.info(`New Order Recieved`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        const recieveApprovedOrderTrackNumber = (data) =>{
            dispatch(api_approve_order_success(data))
        }

        socket.on("recieve_orders_to_approve_to_logistics_companies", recieveNewOrderToApprove);
        socket.on("recieve_approved_order", recieveApprovedOrderTrackNumber);
    return () => {
            socket.off('recieve_orders_to_approve_to_logistics_companies', recieveNewOrderToApprove);
            socket.off("recieve_approved_order", recieveApprovedOrderTrackNumber);
        };

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

    return (
        <div className="dashboard_container">
            <CheckCompanyAuth />

            <CompanySideBar active={'dashboard'} />

            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <CompanyHeaderBar />

                {/* page content starts */}
                <Content className="user_content">
                    <div className="dashboard_content_container">
                        <div className="company_analytic_card_container">
                            {
                                (companyOrder.loading_order_analytics || companyOrder.order_analytics_status === 'failed') ? <>
                                    <CustomLoader position="absolute" errorMessage={currentCompany.order_analytics_errorMessage} retryFn={company_fetch_orders_analytics} status={currentCompany.order_analytics_status} style={{
                                        width: "100%",
                                        minHeight: '110px',
                                        marginBottom: '25px'
                                    }} />
                                </> :
                                    <>
                                        <div className="dashboard_greetings">
                                            <div className="dashboard_greetings_text_div" style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h3>Welcome</h3>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {currentCompany.data && <Image style={{ width: '35px',height: '35px', borderRadius: '40px', border: '4px solid black' }} src={currentCompany.data.logo} />}
                                                    <h5 style={{ marginLeft: '10px' }}><b>{currentCompany.data.company_name}</b></h5>
                                                </div>
                                            </div>

                                            <AnalogClock />

                                            <div className="company_order_stats_container">
                                                <div style={{ backgroundColor: '#f77f0038' }} className="company_analytic_card">

                                                    <svg width="45" style={{ backgroundColor: 'rgb(253 229 204)' }} height="52" viewBox="0 0 63 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M62.3045 15.693C61.6862 15.0916 60.7932 14.7088 59.7628 14.7088H53.1683C53.9926 16.6226 53.5805 18.7551 51.9318 20.3955L44.0322 28.5974C42.5896 30.1284 40.3227 31.0032 37.9185 31.0032C35.5142 31.0032 33.3161 30.1284 31.8048 28.5974L23.9051 20.3955C22.3252 18.7551 21.8443 16.6226 22.6687 14.7088H16.8298L15.3185 9.78768C14.9751 8.63941 13.6699 7.8739 12.1586 7.8739H3.22857C1.51124 7.8739 0 9.02217 0 10.4438C0 11.8655 1.44255 13.0138 3.22857 13.0138H9.61701L11.1283 17.8802C11.1283 17.9349 11.1969 17.9896 11.1969 18.0442L17.5854 38.2756C17.9289 39.4239 19.234 40.1894 20.7453 40.1894H53.5805C55.0917 40.1894 56.3282 39.3692 56.7404 38.2756L62.9227 17.9349C63.1288 17.1147 62.9227 16.2945 62.3045 15.693Z" fill="black" />
                                                        <path d="M25.2103 52C28.3592 52 30.9118 49.9681 30.9118 47.4616C30.9118 44.9551 28.3592 42.9232 25.2103 42.9232C22.0614 42.9232 19.5088 44.9551 19.5088 47.4616C19.5088 49.9681 22.0614 52 25.2103 52Z" fill="black" />
                                                        <path d="M47.6039 52C50.7527 52 53.3054 49.9681 53.3054 47.4616C53.3054 44.9551 50.7527 42.9232 47.6039 42.9232C44.455 42.9232 41.9023 44.9551 41.9023 47.4616C41.9023 49.9681 44.455 52 47.6039 52Z" fill="black" />
                                                        <path d="M36.0634 25.9727C37.0251 26.9569 38.8112 26.9569 39.7729 25.9727L47.7412 17.7708C48.909 16.5678 47.8099 14.7634 45.8865 14.7634H41.8336V1.09359C41.8336 0.492114 41.2154 0 40.4598 0H35.3078C34.5522 0 33.934 0.492114 33.934 1.09359V14.7634H29.8811C27.9577 14.7634 26.8586 16.5678 28.0264 17.7708L36.0634 25.9727Z" fill="black" />
                                                    </svg>
                                                    <div>
                                                        <div className="dash_description">Approved Orders</div>
                                                        {companyOrder.order_analytics && <h3 className="dash_num">{companyOrder.order_analytics.approved_orders}</h3>}
                                                    </div>
                                                </div>

                                                <div style={{ backgroundColor: '#00f71973' }} className="company_analytic_card">
                                                    <svg style={{ backgroundColor: '#8cfb97' }} width="45" height="63" viewBox="0 0 72 63" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M35.9476 0.0027094C28.8296 -0.0858262 22.3353 1.99645 17.7033 6.10406C13.0493 10.2312 10.359 16.3119 10.4056 23.7959C10.4028 23.8542 10.4028 23.9126 10.4056 23.9709C11.2248 32.4948 15.2945 45.4607 34.2981 62.3505C34.521 62.5462 34.7859 62.7016 35.0775 62.8075C35.3692 62.9134 35.6818 62.968 35.9976 62.968C36.3134 62.968 36.626 62.9134 36.9177 62.8075C37.2093 62.7016 37.4742 62.5462 37.6971 62.3505C56.7008 45.4646 60.7704 32.4948 61.5896 23.9709C61.5924 23.9126 61.5924 23.8542 61.5896 23.7959C61.6362 16.3119 58.9458 10.2316 54.2919 6.10406C49.6601 1.99603 43.1654 -0.0836703 36.0476 0.0027094C36.0137 0.0031224 35.9815 0.0021914 35.9476 0.0027094ZM35.9476 4.2015C35.9809 4.2021 36.0143 4.2021 36.0476 4.2015C42.1056 4.11043 47.2075 5.80985 50.868 9.05636C54.4983 12.2761 56.7937 17.0989 56.7911 23.621C56.7911 23.6365 56.7911 23.6492 56.7911 23.6647C56.0627 31.1705 52.753 42.3301 35.9976 57.7802C19.2421 42.3264 15.9325 31.1706 15.2041 23.6647C15.2029 23.6521 15.2053 23.6337 15.2041 23.621C15.2013 17.0985 17.497 12.2757 21.1272 9.05636C24.7876 5.81042 29.8898 4.10858 35.9476 4.2015ZM35.9976 9.79989C28.5173 9.79989 22.4018 15.151 22.4018 21.6965C22.4018 28.242 28.5173 33.593 35.9976 33.593C43.4779 33.593 49.5934 28.242 49.5934 21.6965C49.5934 15.151 43.4779 9.79989 35.9976 9.79989ZM35.9976 13.9987C40.8846 13.9987 44.7949 17.4202 44.7949 21.6965C44.7949 25.9727 40.8846 29.3943 35.9976 29.3943C31.1106 29.3943 27.2003 25.9727 27.2003 21.6965C27.2003 17.4202 31.1106 13.9987 35.9976 13.9987ZM10.0557 46.8674C9.62122 46.9185 9.21105 47.0728 8.86972 47.3135C8.52838 47.5542 8.26894 47.8721 8.11954 48.2327C7.97015 48.5934 7.93652 48.9829 8.02231 49.3591C8.10809 49.7353 8.31002 50.0837 8.60615 50.3666L20.6024 62.263C20.8091 62.475 21.0619 62.6489 21.3461 62.7745C21.6303 62.9001 21.9403 62.975 22.2579 62.9947C22.5755 63.0145 22.8945 62.9787 23.1961 62.8895C23.4978 62.8003 23.7761 62.6595 24.015 62.4752C24.2538 62.2909 24.4483 62.0669 24.5872 61.8161C24.7261 61.5654 24.8065 61.293 24.8239 61.0148C24.8412 60.7366 24.7951 60.4581 24.6882 60.1957C24.5813 59.9332 24.4158 59.6919 24.2013 59.486L12.205 47.589C11.9446 47.3207 11.6113 47.114 11.2357 46.9879C10.8601 46.8618 10.4544 46.8203 10.0557 46.8674ZM61.3897 46.8674C60.7697 46.9172 60.1962 47.176 59.7902 47.589L47.7939 59.486C47.5794 59.6919 47.4139 59.9332 47.307 60.1957C47.2001 60.4581 47.154 60.7366 47.1713 61.0148C47.1887 61.293 47.2691 61.5654 47.408 61.8161C47.5469 62.0669 47.7414 62.2909 47.9802 62.4752C48.2191 62.6595 48.4974 62.8003 48.7991 62.8895C49.1007 62.9787 49.4197 63.0145 49.7373 62.9947C50.0549 62.975 50.3649 62.9001 50.6491 62.7745C50.9333 62.6489 51.1861 62.475 51.3928 62.263L63.3891 50.3666C63.7131 50.0531 63.9215 49.6613 63.9869 49.2425C64.0523 48.8237 63.9717 48.3973 63.7557 48.0192C63.5397 47.6411 63.1982 47.329 62.7761 47.1234C62.3539 46.9179 61.8707 46.8286 61.3897 46.8674ZM2.13317 48.2672C1.70213 48.3093 1.29219 48.4529 0.946958 48.6826C0.60173 48.9124 0.334122 49.2197 0.172598 49.5719C0.0110751 49.9241 -0.0383232 50.3081 0.0296572 50.6829C0.0976377 51.0577 0.280455 51.4094 0.558664 51.7006L7.75642 59.3986C7.94273 59.6412 8.18488 59.8471 8.46736 60.0032C8.74985 60.1592 9.06646 60.2618 9.39691 60.3046C9.72736 60.3474 10.0644 60.3293 10.3864 60.2516C10.7084 60.1738 11.0083 60.038 11.2669 59.853C11.5255 59.668 11.7371 59.4377 11.8882 59.177C12.0392 58.9163 12.1264 58.6309 12.1442 58.339C12.1619 58.0471 12.1098 57.7552 11.9911 57.482C11.8725 57.2087 11.69 56.9601 11.4553 56.7522L4.25751 49.0542C4.00751 48.7774 3.68182 48.5603 3.31053 48.4227C2.93924 48.2851 2.53432 48.2316 2.13317 48.2672ZM69.2872 48.2672C68.6739 48.3446 68.1187 48.6267 67.7377 49.0542L60.5399 56.7522C60.3052 56.9601 60.1227 57.2087 60.0041 57.482C59.8854 57.7552 59.8333 58.0471 59.851 58.339C59.8688 58.6309 59.956 58.9163 60.107 59.177C60.2581 59.4377 60.4697 59.668 60.7283 59.853C60.9869 60.038 61.2868 60.1738 61.6088 60.2516C61.9308 60.3293 62.2678 60.3474 62.5983 60.3046C62.9288 60.2618 63.2454 60.1592 63.5278 60.0032C63.8103 59.8471 64.0525 59.6412 64.2388 59.3986L71.4365 51.7006C71.748 51.3767 71.9403 50.9779 71.9882 50.5567C72.0361 50.1355 71.9374 49.7114 71.705 49.3402C71.4725 48.9689 71.1173 48.6677 70.6858 48.4763C70.2544 48.2848 69.7669 48.2119 69.2872 48.2672Z" fill="black" />
                                                    </svg>
                                                    <div>
                                                        <div className="dash_description">
                                                            Total Delivered
                                                </div>
                                                        {companyOrder.order_analytics && <h3 className="dash_num">{companyOrder.order_analytics.delivered_orders}</h3>}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </>
                            }
                        </div>
                        {/* {console.log({companyOrder})} */}
                        <div className="company_pending_orders_container">
                            <h3>
                                Pending Orders
                            </h3>
                            <div className="company_pending_order">


                                {
                                    (companyOrder.loading_ordersToApprove || companyOrder.ordersToApprove_status === 'failed') ? <>
                                        <CustomLoader position="absolute" errorMessage={currentCompany.ordersToApprove_errorMessage} retryFn={fetch_orders_ToApprove} status={currentCompany.ordersToApprove_status} style={{
                                            width: "100%",
                                            minHeight: '110px',
                                            marginBottom: '25px'
                                        }} />
                                    </> : companyOrder.ordersToApprove.length > 0 ?
                                        companyOrder.ordersToApprove.map((order) => {
                                            return <div className="pending_order_div">
                                                <div className="pending_order_profile flex">
                                                    <p className="flex">
                                                        <LetterAvatar letter={`${order.poster_firstname} ${order.poster_lastname}`} rounded={true} />
                                                        <p style={{ marginLeft: '5px' }}>{order.poster_firstname} {order.poster_lastname}</p>
                                                    </p>
                                                    <p style={{ marginLeft: '5px' }}>{dayjs(order.createdat).fromNow()}</p>
                                                </div>

                                                <div style={{ marginTop: '5px' }} className="flex justify-content-between">
                                                    <div>
                                                        <p><b>Package Description</b></p>
                                                        <p>{order.order_package}</p>
                                                    </div>
                                                    <div>
                                                        <p><b>Tracking Number</b></p>
                                                        <p>{order.track_number}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-content-between">
                                                    <div>
                                                        <p><b>Remarks</b></p>
                                                        <p>{order.parcel_remarks}</p>
                                                    </div>
                                                    <div>
                                                        <p><b>Pickup Date</b></p>
                                                        <p>
                                                            {dayjs(order.parcel_pickup_time).format('ddd [,] d MMMM YYYY')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="company_pending_order_delivery_details">
                                                        <h2>Delivery Details</h2>
                                                        <div>
                                                            <p>
                                                                <span>
                                                                    <svg width="26" style={{ marginRight: '10px' }} height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M15 0C6.73333 0 0 7.14614 0 15.9196C0 24.7285 6.7 31.8392 15 31.8392C19.2 31.8392 30 31.8392 30 31.8392C30 31.8392 30 20.2356 30 15.9196C30 7.14614 23.3 0 15 0ZM15 25.6483C9.93333 25.6483 5.83333 21.2969 5.83333 15.9196C5.83333 10.5423 9.96667 6.19096 15 6.19096C20.0333 6.19096 24.1667 10.5423 24.1667 15.9196C24.1667 21.2969 20.0667 25.6483 15 25.6483Z" fill="#003049" />
                                                                    </svg>
                                                                    <b>From : &nbsp;</b>
                                                                </span>
                                                                <span>{order.parcel_pickup_location}</span>
                                                            </p>
                                                            <p>
                                                                <span>
                                                                    <svg width="26" style={{ marginRight: '10px' }} height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M15.0013 9.57715C11.8013 9.57715 9.16797 12.329 9.16797 15.6731C9.16797 19.0171 11.8013 21.769 15.0013 21.769C18.2013 21.769 20.8346 19.052 20.8346 15.6731C20.8346 12.2942 18.2346 9.57715 15.0013 9.57715Z" fill="#F77F00" />
                                                                        <path d="M15 0C6.73333 0 0 7.03644 0 15.6752C0 24.3489 6.7 31.3505 15 31.3505C19.2 31.3505 30 31.3505 30 31.3505C30 31.3505 30 19.925 30 15.6752C30 7.03644 23.3 0 15 0ZM15 25.2546C9.93333 25.2546 5.83333 20.97 5.83333 15.6752C5.83333 10.3805 9.96667 6.09593 15 6.09593C20.0333 6.09593 24.1667 10.3805 24.1667 15.6752C24.1667 20.97 20.0667 25.2546 15 25.2546Z" fill="#F77F00" />
                                                                    </svg>

                                                                    <b>to : &nbsp;</b>
                                                                </span>
                                                                <span>{order.delivery_location}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {(order.parcel_photo !== 'null') && <Image style={{ width: '100px', height: '100px', borderRadius: '15px' }} src={order.parcel_photo} />}
                                                    </div>
                                                    <Popconfirm
                                                        title="Are you sure to approve this order?"
                                                        onConfirm={() => handleApproveOrder(order.track_number)}
                                                        onCancel={() => message.info('click yes to approve order', 1)}
                                                        okText="Yes"
                                                        cancelText="No"
        
                                                    >
                                                        <Button style={{
                                                            width: '97%',
                                                            position: 'absolute',
                                                            left: '6px',
                                                            bottom: '7px', backgroundColor: ' #001529', color: 'white', borderRadius: '12px'
                                                        }}>Approve Order</Button>
                                                    </Popconfirm>
                                                </div>
                                            </div>
                                        })
                                        : <img style={{width: '300px'}} src={emptySvg} alt="empty" />
                                }

                            </div>
                        </div>
                    </div>

                </Content>
            </div>
        </div>

    )
}

export default CompanyDashboard;
