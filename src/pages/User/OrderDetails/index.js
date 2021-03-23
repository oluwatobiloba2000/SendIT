import React, { useEffect, useState } from 'react';
import SideBar from '../../../components/SideBar';
import { Badge, Breadcrumb, Button, Image, Typography, Layout, message, Popconfirm, Result, Spin, Timeline } from 'antd';
import HeaderBar from '../../../HeaderBar';
import './index.css';
import '../generalUserStyle.css';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from '../../../components/AuthModal';
import CheckUserAuth from '../../../components/checkUserAuth/checkAuth';
import axios from 'axios';
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CONNECTION_PORT } from '../../../App';
import io from "socket.io-client"
import { toast } from 'react-toastify';
const { Content, Header } = Layout;
const { Paragraph } = Typography;
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

let socket;

function OrderDetails() {
    const { track_number } = useParams();
    const currentUser = useSelector(state => state.currentuser);
    const [token] = useState(JSON.parse(window.localStorage.getItem('token')))
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState();
    const [editablePickupLocation, setEditablePickupLocation] = useState();
    const [editableDeliveryLocation, setEditableDeliveryLocation] = useState();
    const [pickupLocationUpdateLoading, setParcelPickupLocationLoading] = useState(false);
    const [pendingTimeLine, setPendingTimeline] = useState('');
    const [deliveryLocationUpdateLoading, setDeliveryLocationLoading] = useState(false);
    const [api_status, set_api_status] = useState();

    const fetchSingleOrder = () => {

        setLoading(true);
        axios.get(`/user/order/${track_number}`)
            .then(function (response) {
                setLoading(false)
                set_api_status('success');
                setOrderDetails(response.data.data.data);
                setEditablePickupLocation(response.data.data.data.parcel.parcel_pickup_location)
                setEditableDeliveryLocation(response.data.data.data.parcel.delivery_location)
            })
            .catch(function (error) {
                setLoading(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    return set_api_status('network error');
                } else if (error.message.indexOf('Request failed with status code 404') !== -1) {
                    return set_api_status('not found');
                } else {
                    set_api_status('something went wrong');
                }
            });
    }

    const cancelOrder = (track_number) => {
        setCancelOrderLoading(true)
        axios.post(`/user/order/cancel?track_id=${track_number}`)
            .then(function (response) {
                setCancelOrderLoading(false)
                message.success('order cancelled success !', 3);
                setOrderDetails((prevState) => ({
                    order: {
                        ...prevState.order,
                        order_status: 'Cancelled'
                    },
                    parcel: prevState.parcel,
                    parcel_activity: prevState.parcel_activity
                }));

                sendActivity(track_number, `❗ ❌ The user has cancelled the order`);
                socket.emit("send_updates_to_order_details", {
                    track_number: track_number,
                    updateType: 'order_status',
                    content: response.data.data.order_status
                })
            })
            .catch(function (error) {
                setCancelOrderLoading(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    return message.error('network error', 2);
                }else if(error.message.indexOf('Request failed with status code 401') !== -1){
                    localStorage.removeItem('token');
                    return message.error('Your session has expired', 2);
                }  else if (error.response.data && error.response.data.error) {
                    return message.error(error.response.data.error, 5)
                } else {
                    message.error('something went wrong', 5);
                }
            });
    }

    // 
    const changeLocation = ({ track_number, parcel_pickup_location, delivery_location }) => {
        parcel_pickup_location ? setParcelPickupLocationLoading(true) : setDeliveryLocationLoading(true);
        axios.post(`/user/order/location/change?track_id=${track_number}`, {
            parcel_pickup_location,
            parcel_delivery_location: delivery_location
        })
            .then(function (response) {
                parcel_pickup_location ? setParcelPickupLocationLoading(false) : setDeliveryLocationLoading(false);
                message.success('order location updated success !', 3);
                setOrderDetails((prevState) => ({
                    order: prevState.order,
                    parcel: {
                        ...prevState.parcel,
                        parcel_pickup_location: parcel_pickup_location ? response.data.data.parcel_pickup_location : prevState.parcel.parcel_pickup_location,
                        delivery_location: delivery_location ? response.data.data.delivery_location : prevState.parcel.delivery_location
                    },
                    parcel_activity: prevState.parcel_activity
                }));

                sendActivity(track_number, `🏞 The user has changed the ${parcel_pickup_location ? 'pickup location' : 'delivery location'}`);
                parcel_pickup_location ? socket.emit("send_location_updates_to_order_details", {
                    track_number: track_number,
                    updateType: 'order_pickup_location',
                    content: response.data.data.parcel_pickup_location
                  })
                : socket.emit("send_location_updates_to_order_details", {
                    track_number,
                    updateType: 'order_delivery_location',
                    content: response.data.data.delivery_location
                  })
            })
            .catch(function (error) {
                parcel_pickup_location ? setParcelPickupLocationLoading(false) : setDeliveryLocationLoading(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    return message.error('network error', 2);
                }else if(error.message.indexOf('Request failed with status code 401') !== -1){
                    localStorage.removeItem('token');
                    return message.error('Your session has expired', 2);
                } else if (error.response.data && error.response.data.error) {
                    return message.error(error.response.data.error, 5)
                } else {
                    message.error('something went wrong', 5);
                }
            });
    }

    const sendActivity = (track_number, activity_content) => {
        setPendingTimeline('Sending Latest Changes, please wait')
        axios.post(`/user/order/activity/send?track_id=${track_number}`, {
            activity_content: activity_content
        })
            .then(function (response) {
                setPendingTimeline('')
                setOrderDetails((prevState) => ({
                    order: prevState.order,
                    parcel: prevState.parcel,
                    parcel_activity: [
                        ...prevState.parcel_activity,
                        response.data.data
                    ]
                }));
                socket.emit("send_updates_to_order_details", {
                    track_number: track_number,
                    updateType: 'activity_update',
                    content: response.data.data
                })
            })
            .catch(function (error) {
                setPendingTimeline('')
            });
    }

    useEffect(() => {
        fetchSingleOrder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        socket = io(CONNECTION_PORT);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CONNECTION_PORT]);

    useEffect(() => {
            socket.emit("enter_activity_details_room", { track_number});
    }, [track_number])

    useEffect(() => {
        const recieveActivityUpdate = (data) => {
            setOrderDetails((prevState) => ({
                order: prevState.order,
                parcel: prevState.parcel,
                parcel_activity: [
                    ...prevState.parcel_activity,
                    data
                ]
            }));

            toast.info(`🎉 An activity has been added`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        socket.on("receive_activity_updates_to_order_details", recieveActivityUpdate);

        const recieveOrderStatusUpdate = (data) => {
            const status = data.status || data;
            const company_name = data.company || null;

            setOrderDetails((prevState) => ({
                order: {
                    ...prevState.order,
                    order_status: status,
                    company_name: company_name || prevState.order.company_name
                },
                parcel: prevState.parcel,
                parcel_activity: prevState.parcel_activity
            }));

            // message.info('order status changed !')
            toast.info(`🎉 order status just changed`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        socket.on("receive_order_status_updates_to_order_details", recieveOrderStatusUpdate);
        return () => {
            socket.off('receive_activity_updates_to_order_details', recieveActivityUpdate);
            socket.off("receive_order_status_updates_to_order_details", recieveOrderStatusUpdate);
        };

    }, [])

    return (
        <div className="dashboard_container" >
            { token && token.role === 'user' && <CheckUserAuth />}

            <SideBar active="none" />
            <div className="layout_container">
                <Auth setShowModal={showAuthModal} refreshAfterSuccess={true} disableClose={true} />
                {/* header component that contains the user profile picture */}
                {(token && token.role === 'user') ? <HeaderBar /> :
                    <Header className="headerbar">
                        <Button style={{ border: '1px solid' }} onClick={() => setShowAuthModal(true)}>Login</Button>
                    </Header>
                }

                {/* page content starts */}
                <Content className="user_content">
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item><Link to="/user/order">Orders</Link></Breadcrumb.Item>
                        <Breadcrumb.Item >{track_number}</Breadcrumb.Item>
                    </Breadcrumb>
                    <h2>Order Details</h2>

                    {loading ? <Spin spinning={loading} tip="Loading..." style={{ height: '100%', width: '100%' }}></Spin>
                        : api_status === 'network error' ?
                            <div className="order_details_network_error_container">
                                <div className="loader_network_error"></div>
                                <p>Looks Like you are not connected to the internet</p>
                                <Button onClick={() => fetchSingleOrder()} style={{ backgroundColor: '#f77f00' }} type="primary" shape="round" icon={<RedoOutlined />} size="large">Retry</Button>
                            </div>
                            : api_status === 'not found' ?
                                <Result
                                    status="404"
                                    title="404"
                                    subTitle="Sorry, the order you requested cannot be found"
                                    extra={<Link to="/user/order"><Button type="primary">Orders</Button></Link>}
                                /> : orderDetails &&
                                <div className="order_details_content">
                                    <div className="left_details_panel">
                                        <div className="order_info">
                                            <h5 style={{ fontSize: '16px' }}>Order Info</h5>
                                            <ul className="order_info_list">
                                                <li>
                                                    <div className="info_key">Package Content</div>
                                                    <div className="info_value">{orderDetails.order.order_package}</div>
                                                </li>
                                                <li>
                                                    <div className="info_key">Remarks</div>
                                                    <div className="info_value">{orderDetails.parcel.parcel_remarks}</div>
                                                </li>

                                                <li>
                                                    <div className="info_key">Pickup Date</div>
                                                    <div className="info_value">{dayjs(orderDetails.parcel_pickup_time).format('ddd [,] d MMMM YYYY')}</div>
                                                </li>


                                                <li>
                                                    <div className="info_key">Status</div>
                                                    <div className="info_value">
                                                        {orderDetails.order.order_status === 'Approved'
                                                            ? <Badge status="processing" text="Approved" />
                                                            : orderDetails.order.order_status === 'Cancelled' ?
                                                                <Badge status="error" text="Cancelled" />
                                                                : orderDetails.order.order_status === 'In Transit' || orderDetails.order.order_status === 'Delayed'
                                                                    ? <Badge status="warning" text={orderDetails.order.order_status} />
                                                                    : orderDetails.order.order_status === 'Delivered' ? <Badge status="success" className="badge_success" text={orderDetails.order.order_status} />
                                                                        : <Badge status="default" text={orderDetails.order.order_status} />
                                                        }</div>
                                                </li>

                                                <li>
                                                    <div className="info_key">Company</div>
                                                    <div className="info_value">{orderDetails.order.company_name || 'No Company Has Approved Your Order'}</div>
                                                </li>
                                            </ul>
                                            {(orderDetails.order.order_status === 'Cancelled' || orderDetails.order.order_status === 'Delivered' || (currentUser.data && currentUser.data.id !== orderDetails.order.user_id))
                                                ? '' : <Popconfirm
                                                    title="Are you sure to cancel this order?"
                                                    onConfirm={() => cancelOrder(orderDetails.order.parcel_track_id)}
                                                    // onCancel={cancel}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <Button loading={cancelOrderLoading} type="danger">Cancel Order</Button>
                                                </Popconfirm>}
                                        </div>

                                        <div style={{ marginTop: '5px' }} className="order_info">
                                            <h5 style={{ fontSize: '16px' }}>Pickup Info</h5>
                                            <ul className="order_info_list">
                                                <li>
                                                    <div className="info_key">Pickup Fullname</div>
                                                    <div className="info_value">{orderDetails.parcel.parcel_pickup_fullname}</div>
                                                </li>
                                                <li>
                                                    <div className="info_key">Pickup Location</div>
                                                    <div className="info_value">
                                                        {(orderDetails.order.order_status === 'Cancelled' || orderDetails.order.order_status === 'Delivered' || (currentUser.data && currentUser.data.id !== orderDetails.order.user_id))
                                                            ? orderDetails.parcel.parcel_pickup_location :
                                                            <Paragraph style={{ maxWidth: '230px' }} editable={{ onChange: setEditablePickupLocation }}>{editablePickupLocation}</Paragraph>
                                                        }
                                                    </div>
                                                </li>
                                            </ul>
                                            {(orderDetails.order.order_status === 'Cancelled' || orderDetails.order.order_status === 'Delivered')
                                                ? '' : orderDetails.parcel.parcel_pickup_location === editablePickupLocation ? ''
                                                    :
                                                    <Button type="primary" onClick={() => changeLocation({
                                                        track_number: orderDetails.order.parcel_track_id,
                                                        parcel_pickup_location: editablePickupLocation
                                                    })} loading={pickupLocationUpdateLoading}>Update Pickup Location</Button>}
                                        </div>

                                        <div style={{ marginTop: '5px' }} className="order_info">
                                            <h5 style={{ fontSize: '16px' }}>Delivery Info</h5>
                                            <ul className="order_info_list">
                                                <li>
                                                    <div className="info_key">Delivery Fullname</div>
                                                    <div className="info_value">{orderDetails.parcel.delivery_fullname}</div>
                                                </li>
                                                <li>
                                                    <div className="info_key">Delivery Location</div>
                                                    <div className="info_value">{
                                                        (orderDetails.order.order_status === 'Cancelled' || orderDetails.order.order_status === 'Delivered' || (currentUser.data && currentUser.data.id !== orderDetails.order.user_id))
                                                            ? orderDetails.parcel.delivery_location :
                                                            <Paragraph style={{ maxWidth: '230px' }} editable={{ onChange: setEditableDeliveryLocation }}>{editableDeliveryLocation}</Paragraph>
                                                    }</div>
                                                </li>
                                            </ul>
                                            {(orderDetails.order.order_status === 'Cancelled' || orderDetails.order.order_status === 'Delivered')
                                                ? '' : orderDetails.parcel.delivery_location === editableDeliveryLocation ? '' : <Button type="primary" onClick={() => changeLocation({
                                                    track_number: orderDetails.order.parcel_track_id,
                                                    delivery_location: editableDeliveryLocation
                                                })} loading={deliveryLocationUpdateLoading} >Update Delivery Location</Button>}
                                        </div>

                                        {orderDetails.parcel.parcel_photo !== 'null' && <div className="package_picture">
                                            <Image width="100%" height="180px" src={orderDetails.parcel.parcel_photo} />
                                        </div>}
                                    </div>

                                    <div className="activity_container">
                                        <h3>Activity</h3>
                                        <Timeline pending={pendingTimeLine} reverse mode={'left'}>
                                            {orderDetails.parcel_activity && orderDetails.parcel_activity.length > 0 ? orderDetails.parcel_activity.map((activity, index) => {
                                                return <Timeline.Item  key={index} label={dayjs(activity.createdat).format('ddd [,] d MMMM YYYY')}>
                                                    {activity.activity_content}
                                                    <p className="activity_order_time">{dayjs(activity.createdat).fromNow()}</p>
                                                </Timeline.Item>
                                            }) : <img style={{ width: '100%', marginTop: '10px' }} src="https://cdn.dribbble.com/users/1588659/screenshots/5385747/dribbble.png" alt="no activity" />}
                                        </Timeline>
                                    </div>
                                </div>}
                </Content>
            </div>
        </div>

    )
}

export default OrderDetails;
