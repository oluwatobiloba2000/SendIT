/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Badge, Breadcrumb, Button, Dropdown, Image, Layout, Menu, message, Popconfirm, Result, Spin, Timeline, Tooltip } from 'antd';
import './index.css';
import '../../User/generalUserStyle.css';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import CompanySideBar from '../CompanySideBar';
import CompanyHeaderBar from '../CompanyHeaderBar';
import dayjs from 'dayjs';
import { RedoOutlined } from '@ant-design/icons';
import CheckCompanyAuth from '../../../components/checkCompanyAuth/checkAuth';
import TextArea from 'antd/lib/input/TextArea';
import { toast } from 'react-toastify';
import io from "socket.io-client";
import { CONNECTION_PORT } from '../../../App';

const { Content } = Layout;
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

let socket;

function OrderDetailsCompany() {
    const { track_number } = useParams();
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const [token] = useState(JSON.parse(localStorage.getItem('token')));
    const [orderDetails, setOrderDetails] = useState();
    const [api_status, set_api_status] = useState();
    const [pendingTimeLine, setPendingTimeline] = useState('');
    const [loadingUpdateOrderStatus, setLoadingOrderStatus] = useState(false);
    const [textAreaActivity, setTextAreaActivity] = useState('');

    const fetchSingleOrder = () => {
        setLoading(true);
        axios.get(`/company/order/${track_number}`)
            .then(function (response) {
                setLoading(false)
                set_api_status('success');
                setOrderDetails(response.data.data.data);
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

    const changeOrderStatus = ({ track_number, order_status }) => {
        setLoadingOrderStatus(true);
        axios.post(`/company/order/status/change?track_id=${track_number}`, {
            status: order_status
        })
            .then(function (response) {
                setLoadingOrderStatus(false);
                message.success('order status updated success !', 3);
                setOrderDetails((prevState) => ({
                    order: {
                        ...prevState.order,
                        order_status: response.data.data.order_status
                    },
                    parcel: prevState.parcel,
                    parcel_activity: prevState.parcel_activity
                }));

                sendActivity(track_number, `order status is now ${order_status}`, order_status);
                socket.emit("send_updates_to_order_details", {
                    track_number: track_number,
                    updateType: 'order_status',
                    content: response.data.data.order_status
                })
            })
            .catch(function (error) {
                setLoadingOrderStatus(false);
                if (error.message.indexOf('Network Error') !== -1) {
                    return message.error('network error', 2);
                } else if (error.response.data && error.response.data.error) {
                    return message.error(error.response.data.error, 5)
                } else {
                    message.error('something went wrong', 5);
                }
            });
    }

    useEffect(() => {
        socket = io(CONNECTION_PORT);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CONNECTION_PORT]);

    useEffect(() => {
        //   console.log(currentUser.data.id);
        socket.emit("enter_activity_details_room", { track_number });
    }, [])


    const sendActivity = (track_number, activity_content, order_status) => {
        setPendingTimeline('Sending Latest Changes, please wait')
        axios.post(`/company/order/activity/send?track_id=${track_number}`, {
            activity_content: activity_content
        })
            .then(function (response) {
                setPendingTimeline('')
                setTextAreaActivity('')
                setOrderDetails((prevState) => ({
                    order: prevState.order,
                    parcel: prevState.parcel,
                    parcel_activity: [
                        ...prevState.parcel_activity,
                        response.data.data
                    ]
                }));

                socket.emit("send_notification_to_user_using_userid", {
                   id:  orderDetails.order.user_id,
                    content: {
                        track_number: track_number,
                        title: 'Order Activity Update',
                        body: 'Activity for one of your order has been updated',
                        order_status: order_status,
                        link: `/user/track/order/${orderDetails.parcel.track_number}`
                    }
                });
                socket.emit("send_updates_to_order_details", {
                    track_number,
                    updateType: 'activity_update',
                    content: response.data.data
                })
                // TODO:  do socket.io here
            })
            .catch(function (error) {
                setPendingTimeline('')
                console.log({ error })
            });
    }

    useEffect(() => {
        if (!token || (token && token.role !== 'company')) {
            return history.push('/company/login');
        }
        fetchSingleOrder();
    }, [])

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
            setOrderDetails((prevState) => ({
                order: {
                    ...prevState.order,
                    order_status: data
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

        const recieveDeliveryUpdate = (data) => {
            setOrderDetails((prevState) => ({
                order: prevState.order,
                parcel: {
                    ...prevState.parcel,
                    delivery_location: data
                },
                parcel_activity: prevState.parcel_activity
            }));

            toast.info(`Delivery location updated`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        socket.on("receive_order_delivery_location_updates_to_order_details", recieveDeliveryUpdate);

        const recievePickupUpdate = (data) => {
            setOrderDetails((prevState) => ({
                order: prevState.order,
                parcel: {
                    ...prevState.parcel,
                    parcel_pickup_location: data
                },
                parcel_activity: prevState.parcel_activity
            }));

            toast.info(`Pickup location updated`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        socket.on("receive_order_pickup_location_updates_to_order_details", recievePickupUpdate);
        return () => {
            socket.off('receive_activity_updates_to_order_details', recieveActivityUpdate);
            socket.off("receive_order_status_updates_to_order_details", recieveOrderStatusUpdate);
            socket.off("receive_order_delivery_location_updates_to_order_details", recieveDeliveryUpdate);
            socket.off("receive_order_pickup_location_updates_to_order_details", recievePickupUpdate);
        };

    }, [])


    return (
        <div className="dashboard_container" >
            <CheckCompanyAuth />
            <CompanySideBar active="none" />
            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <CompanyHeaderBar />

                {/* page content starts */}
                <Content className="user_content">
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item><Link to="/company/order">Orders</Link></Breadcrumb.Item>
                        <Breadcrumb.Item >{track_number}</Breadcrumb.Item>
                    </Breadcrumb>
                    <h2>Order Details</h2>

                    {
                        loading ? <Spin spinning={loading} tip="Loading..." style={{ height: '100%', width: '100%' }}></Spin>
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
                                        extra={<Link to="/company/order"><Button type="primary">Orders</Button></Link>}
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
                                                                        : orderDetails.order.order_status === 'Delivered' ? <Badge status="success" text={orderDetails.order.order_status} />
                                                                            : <Badge status="default" text={orderDetails.order.order_status} />
                                                            }</div>
                                                    </li>
                                                </ul>
                                                {(orderDetails.order.order_status !== 'Delivered' && orderDetails.order.order_status !== 'Cancelled') && <Dropdown.Button
                                                    overlay={<Menu onClick={(value) => changeOrderStatus({ track_number, order_status: value.key })}>
                                                        <Menu.Item key="Delayed" icon={<Badge status="warning" />}>
                                                            Delayed
                                                        </Menu.Item>
                                                        <Menu.Item key="In Transit" icon={<Badge status="warning" />}>
                                                            In Transit
                                                        </Menu.Item>
                                                        <Menu.Item key="Delivered" icon={<Badge status="success" />}>
                                                            Delivered
                                                        </Menu.Item>
                                                    </Menu>}
                                                    buttonsRender={([leftButton, rightButton]) => [
                                                        <Tooltip title="Update Order Status" key="leftButton">
                                                            {leftButton}
                                                        </Tooltip>,
                                                        React.cloneElement(rightButton, { loading: loadingUpdateOrderStatus }),
                                                    ]}
                                                >
                                                    Update Status
                                                </Dropdown.Button>}
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
                                                        <div className="info_value">{orderDetails.parcel.parcel_pickup_location}</div>
                                                    </li>
                                                    <li>
                                                        <div className="info_key">Pickup Phonenumber</div>
                                                        <div className="info_value">{orderDetails.parcel.parcel_pickup_phonenumber}</div>
                                                    </li>
                                                </ul>
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
                                                        <div className="info_value">{orderDetails.parcel.delivery_location}</div>
                                                    </li>
                                                    <li>
                                                        <div className="info_key">Delivery Phonenumber</div>
                                                        <div className="info_value">{orderDetails.parcel.delivery_phonenumber}</div>
                                                    </li>
                                                </ul>
                                            </div>

                                            {orderDetails.parcel.parcel_photo !== 'null' && <div className="package_picture">
                                                <Image width="100%" height="180px" src={orderDetails.parcel.parcel_photo} />
                                            </div>}
                                        </div>

                                        <div className="activity_container">
                                            <h3>Activity</h3>
                                            <Timeline reverse={true} pending={pendingTimeLine} mode={'left'}>
                                                {orderDetails.parcel_activity && orderDetails.parcel_activity.length > 0 ? orderDetails.parcel_activity.map((activity) => {
                                                    return <Timeline.Item label={dayjs(activity.createdat).format('ddd [,] d MMMM YYYY')}>
                                                        {activity.activity_content}
                                                        <p className="activity_order_time">{dayjs(activity.createdat).fromNow()}</p>
                                                    </Timeline.Item>
                                                }) : <img style={{ width: '100%', marginTop: '10px' }} src="https://cdn.dribbble.com/users/1588659/screenshots/5385747/dribbble.png" alt="no activity" />}
                                            </Timeline>

                                            <div style={{ marginTop: '15px', textAlign: 'end' }}>
                                                <TextArea
                                                    value={textAreaActivity}
                                                    placeholder="Send Latest Activities"
                                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                                    onChange={({ target }) => setTextAreaActivity(target.value)}
                                                />
                                                <Popconfirm
                                                    placement="topRight"
                                                    title={'Are You Sure you want to send the activity?'}
                                                    onConfirm={() => textAreaActivity.length < 1 ? message.error('activity should be more than 1 character') : sendActivity(track_number, textAreaActivity)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <Button loading={pendingTimeLine ? true : false} style={{ marginTop: '5px' }} type="primary">
                                                        Send Activity
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    </div>
                    }
                </Content>
            </div>
        </div>

    )
}

export default OrderDetailsCompany;
