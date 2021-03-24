import React, { useState } from 'react';
import SideBar from '../../../components/SideBar';
import { Button, DatePicker, Layout, message, Progress } from 'antd';
import HeaderBar from '../../../HeaderBar';
import './index.css';
import OrderTable from '../../../components/OrderTable/OrderTable';
import '../generalUserStyle.css';
import _ from 'lodash/core';
import CheckUserAuth from '../../../components/checkUserAuth/checkAuth';
import Auth from '../../../components/AuthModal';
import { useDispatch, useSelector } from 'react-redux';
import { addOrder, fetch_orders, fetch_orders_analytics, updateOrderStatus } from '../../../features/order_user_slice/order_user_slice';
import { useEffect } from 'react';
import CustomLoader from '../../../components/Loader';
import PhotoUploader from '../../../components/PhotoUploader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axios from 'axios';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import io from "socket.io-client";
import { CONNECTION_PORT } from '../../../App';
import dayjs from 'dayjs';

const { Content } = Layout;



const schema = yup.object().shape({
    package_content: yup.string().min(2).required(),
    remarks: yup.string().min(2).required(),
    pickup_fullname: yup.string().min(2).required(),
    pickup_location: yup.string().min(2).required(),
    pickup_phone: yup.string().min(2).required(),
    delivery_fullname: yup.string().min(2).required(),
    delivery_location: yup.string().min(2).required(),
    delivery_phone: yup.string().min(2).required()
});

let socket;


function Dashboard() {

    const dispatch = useDispatch();
    const [dateString, setDateString] = useState();
    const [uploadImgFile, setUploadImg] = useState(null);
    const history = useHistory();
    const [token] = useState(JSON.parse(window.localStorage.getItem('token')))
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const userOrder = useSelector(state => state.userOrder);
    const currentUser = useSelector(state => state.currentuser);

    const { register, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema)
    });

    const uploadPhoto = (data) => {
       message.loading('uploading.....', 1);
        setLoading(true)
        const formData = new FormData();
        formData.append('image', uploadImgFile);

        axios.post('/user/photo/upload', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                // handle success
                if (response.status === 200) {
                    createOrder({photoUrl: response.data.data.secure_url, data})
                }
            })
            .catch(function (error) {
                setLoading(false)
                if (error.message.indexOf('Network Error') !== -1) {
                    message.error('Looks Like you are not connected to the internet');
                } else if (error.message.indexOf('Request failed with status code 401') !== -1) {
                    localStorage.removeItem('token');
                    message.error('Not Authorized');
                    setShowAuthModal(true);
                } else {
                    message.error('Cannot upload at the moment');
                }
            });
    }

    const createOrder = ({photoUrl, data}) => {
        message.loading('sending your order.....', 1);
        setLoading(true);
        axios.post(`/user/order/create`, {
            order_package: data.package_content,
            delivery_fullname: data.delivery_fullname,
            delivery_location: data.delivery_location,
            parcel_pickup_time: `${dateString}`,
            delivery_phonenumber: data.delivery_phone,
            parcel_pickup_phonenumber: data.pickup_phone,
            parcel_remarks: data.remarks,
            delivery_location_lat: "null",
            delivery_location_lng: "null",
            parcel_pickup_fullname: data.pickup_fullname,
            parcel_pickup_location: data.pickup_location,
            parcel_pickup_location_lat: "null",
            parcel_pickup_location_lng: "null",
            parcel_photo: photoUrl || 'null'
        })
            .then(function (response) {
                message.success('order sent !');
                setLoading(false)
                reset();
                dispatch(addOrder(response.data.data.data))
                dispatch(fetch_orders_analytics())
                socket.emit("send_orders_to_approve_to_logistics_companies", {room : 'all_company_room', content:{ 
                    ...response.data.data.data,
                    poster_firstname: currentUser.data.firstname,
                    poster_lastname: currentUser.data.lastname
                }});
            })
            .catch(function (error) {
                setLoading(false)
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
    };

    const onSubmit = data => {
        if (uploadImgFile) {
            uploadPhoto(data)
        }else{
            createOrder({data})
        }
    };

    function calculatePercentage(initialValue, total) {
        return (parseInt(initialValue) * 100) / parseInt(total);
    }


  useEffect(() => {
    socket = io(CONNECTION_PORT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CONNECTION_PORT]);

  useEffect(() => {
    const adminEventHandler = (data) => {
        console.log('Recieved data from admin', data)
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
    //   console.log(currentUser.data.id);
      if(currentUser.data.id){
          socket.emit("enter_user_room_through_id", {id : currentUser.data.id});
      }
  }, [currentUser.data.id])


  useEffect(() => {
    if(!token || (token && token.role !== 'user')){
       return history.push('/?auth=login')
    }
    else if (_.isEmpty(userOrder.order_analytics)) {
        dispatch(fetch_orders_analytics())
        dispatch(fetch_orders())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])


    return (
        <div className="dashboard_container">
            <CheckUserAuth />
            <Auth setShowModal={showAuthModal} refreshAfterSuccess={true} disableClose={true} />
            {(userOrder.orders_errorMessage || userOrder.order_analytics_errorMessage) === 'Not Authorized' && setShowAuthModal(true)}

            <SideBar active={'dashboard'} />

            <div className="layout_container">
                {/* header component that contains the user profile picture */}
                <HeaderBar />

                {/* page content starts */}
                <Content className="user_content">
                    <div className="dashboard_content_container">
                        <div className="analytic_card_container">
                            {(userOrder.loading_order_analytics || userOrder.order_analytics_status === 'failed') ? <>
                                <CustomLoader position="absolute" errorMessage={userOrder.order_analytics_errorMessage} retryFn={fetch_orders_analytics} status={userOrder.order_analytics_status} style={{
                                    width: "100%",
                                    minHeight: '110px',
                                    marginBottom: '25px'
                                }} />
                            </> :
                                <>
                                    <div className="analytic_card">
                                        <div className="dash_icon_container">
                                            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.89688 16.9088C7.44791 16.9088 7.8963 16.3556 7.8963 15.6758C7.8963 14.9956 7.44791 14.4424 6.89688 14.4424C6.34561 14.4424 5.89722 14.9956 5.89722 15.6758C5.89747 16.3556 6.34586 16.9088 6.89688 16.9088Z" fill="#EA5B01" />
                                                <path d="M6.89688 5.92677C7.44791 5.92677 7.8963 5.37355 7.8963 4.6934C7.8963 4.01355 7.44791 3.46033 6.89688 3.46033C6.34561 3.46033 5.89722 4.01355 5.89722 4.6934C5.89747 5.37355 6.34586 5.92677 6.89688 5.92677Z" fill="#EA5B01" />
                                                <path d="M6.89688 11.4177C7.44791 11.4177 7.8963 10.8645 7.8963 10.1844C7.8963 9.50451 7.44791 8.95129 6.89688 8.95129C6.34561 8.95129 5.89722 9.50451 5.89722 10.1844C5.89747 10.8648 6.34586 11.4177 6.89688 11.4177Z" fill="#EA5B01" />
                                                <path d="M3.57214 20.3689H9.98293V20.5994C9.98293 23.3917 11.7812 25.6632 13.9913 25.6632C16.2017 25.6632 18 23.3917 18 20.5994V0H3.57214V20.3689ZM10.2183 4.46294H15.5331V4.92396H10.2183V4.46294ZM10.2183 9.95426H15.5331V10.4153H10.2183V9.95426ZM10.2183 15.4453H15.5331V15.9063H10.2183V15.4453ZM6.89674 2.99968C7.65378 2.99968 8.26982 3.75974 8.26982 4.69376C8.26982 5.62809 7.65378 6.38815 6.89674 6.38815C6.13945 6.38815 5.52341 5.62809 5.52341 4.69376C5.52365 3.75943 6.13945 2.99968 6.89674 2.99968ZM6.89674 8.49069C7.65378 8.49069 8.26982 9.25075 8.26982 10.1848C8.26982 11.1191 7.65378 11.8792 6.89674 11.8792C6.13945 11.8792 5.52341 11.1191 5.52341 10.1848C5.52365 9.25075 6.13945 8.49069 6.89674 8.49069ZM6.89674 13.9814C7.65378 13.9814 8.26982 14.7415 8.26982 15.6758C8.26982 16.6098 7.65378 17.3699 6.89674 17.3699C6.13945 17.3699 5.52341 16.6098 5.52341 15.6758C5.52365 14.7415 6.13945 13.9814 6.89674 13.9814Z" fill="#EA5B01" />
                                                <path d="M12.2391 25.6632C10.7455 24.8383 9.68379 22.9927 9.61305 20.83H0C0.0956572 23.5155 1.8551 25.6632 4.0044 25.6632H12.2391Z" fill="#EA5B01" />
                                            </svg>
                                        </div>
                                        <div className="progress_circle_container">
                                            <div>
                                                <h3 className="dash_num">{userOrder.order_analytics.count}</h3>
                                                <div className="dash_description"> Total Order</div>
                                            </div>
                                            <Progress strokeColor="#003049" className="dash_progress_circle" type="circle" percent={calculatePercentage(userOrder.order_analytics.count, userOrder.order_analytics.count)} />
                                        </div>
                                    </div>

                                    <div className="analytic_card">
                                        <div className="dash_icon_container">
                                            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.89688 16.9088C7.44791 16.9088 7.8963 16.3556 7.8963 15.6758C7.8963 14.9956 7.44791 14.4424 6.89688 14.4424C6.34561 14.4424 5.89722 14.9956 5.89722 15.6758C5.89747 16.3556 6.34586 16.9088 6.89688 16.9088Z" fill="#EA5B01" />
                                                <path d="M6.89688 5.92677C7.44791 5.92677 7.8963 5.37355 7.8963 4.6934C7.8963 4.01355 7.44791 3.46033 6.89688 3.46033C6.34561 3.46033 5.89722 4.01355 5.89722 4.6934C5.89747 5.37355 6.34586 5.92677 6.89688 5.92677Z" fill="#EA5B01" />
                                                <path d="M6.89688 11.4177C7.44791 11.4177 7.8963 10.8645 7.8963 10.1844C7.8963 9.50451 7.44791 8.95129 6.89688 8.95129C6.34561 8.95129 5.89722 9.50451 5.89722 10.1844C5.89747 10.8648 6.34586 11.4177 6.89688 11.4177Z" fill="#EA5B01" />
                                                <path d="M3.57214 20.3689H9.98293V20.5994C9.98293 23.3917 11.7812 25.6632 13.9913 25.6632C16.2017 25.6632 18 23.3917 18 20.5994V0H3.57214V20.3689ZM10.2183 4.46294H15.5331V4.92396H10.2183V4.46294ZM10.2183 9.95426H15.5331V10.4153H10.2183V9.95426ZM10.2183 15.4453H15.5331V15.9063H10.2183V15.4453ZM6.89674 2.99968C7.65378 2.99968 8.26982 3.75974 8.26982 4.69376C8.26982 5.62809 7.65378 6.38815 6.89674 6.38815C6.13945 6.38815 5.52341 5.62809 5.52341 4.69376C5.52365 3.75943 6.13945 2.99968 6.89674 2.99968ZM6.89674 8.49069C7.65378 8.49069 8.26982 9.25075 8.26982 10.1848C8.26982 11.1191 7.65378 11.8792 6.89674 11.8792C6.13945 11.8792 5.52341 11.1191 5.52341 10.1848C5.52365 9.25075 6.13945 8.49069 6.89674 8.49069ZM6.89674 13.9814C7.65378 13.9814 8.26982 14.7415 8.26982 15.6758C8.26982 16.6098 7.65378 17.3699 6.89674 17.3699C6.13945 17.3699 5.52341 16.6098 5.52341 15.6758C5.52365 14.7415 6.13945 13.9814 6.89674 13.9814Z" fill="#EA5B01" />
                                                <path d="M12.2391 25.6632C10.7455 24.8383 9.68379 22.9927 9.61305 20.83H0C0.0956572 23.5155 1.8551 25.6632 4.0044 25.6632H12.2391Z" fill="#EA5B01" />
                                            </svg>
                                        </div>
                                        <div className="progress_circle_container">
                                            <div>
                                                <h3 className="dash_num">{userOrder.order_analytics.pending_orders}</h3>
                                                <div className="dash_description">Total Pending Order</div>
                                            </div>
                                            <Progress strokeColor="#003049" className="dash_progress_circle" type="circle" percent={Math.round(calculatePercentage(userOrder.order_analytics.pending_orders, userOrder.order_analytics.count))} />
                                        </div>
                                    </div>

                                    <div className="analytic_card">
                                        <div className="dash_icon_container">
                                            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.89688 16.9088C7.44791 16.9088 7.8963 16.3556 7.8963 15.6758C7.8963 14.9956 7.44791 14.4424 6.89688 14.4424C6.34561 14.4424 5.89722 14.9956 5.89722 15.6758C5.89747 16.3556 6.34586 16.9088 6.89688 16.9088Z" fill="#EA5B01" />
                                                <path d="M6.89688 5.92677C7.44791 5.92677 7.8963 5.37355 7.8963 4.6934C7.8963 4.01355 7.44791 3.46033 6.89688 3.46033C6.34561 3.46033 5.89722 4.01355 5.89722 4.6934C5.89747 5.37355 6.34586 5.92677 6.89688 5.92677Z" fill="#EA5B01" />
                                                <path d="M6.89688 11.4177C7.44791 11.4177 7.8963 10.8645 7.8963 10.1844C7.8963 9.50451 7.44791 8.95129 6.89688 8.95129C6.34561 8.95129 5.89722 9.50451 5.89722 10.1844C5.89747 10.8648 6.34586 11.4177 6.89688 11.4177Z" fill="#EA5B01" />
                                                <path d="M3.57214 20.3689H9.98293V20.5994C9.98293 23.3917 11.7812 25.6632 13.9913 25.6632C16.2017 25.6632 18 23.3917 18 20.5994V0H3.57214V20.3689ZM10.2183 4.46294H15.5331V4.92396H10.2183V4.46294ZM10.2183 9.95426H15.5331V10.4153H10.2183V9.95426ZM10.2183 15.4453H15.5331V15.9063H10.2183V15.4453ZM6.89674 2.99968C7.65378 2.99968 8.26982 3.75974 8.26982 4.69376C8.26982 5.62809 7.65378 6.38815 6.89674 6.38815C6.13945 6.38815 5.52341 5.62809 5.52341 4.69376C5.52365 3.75943 6.13945 2.99968 6.89674 2.99968ZM6.89674 8.49069C7.65378 8.49069 8.26982 9.25075 8.26982 10.1848C8.26982 11.1191 7.65378 11.8792 6.89674 11.8792C6.13945 11.8792 5.52341 11.1191 5.52341 10.1848C5.52365 9.25075 6.13945 8.49069 6.89674 8.49069ZM6.89674 13.9814C7.65378 13.9814 8.26982 14.7415 8.26982 15.6758C8.26982 16.6098 7.65378 17.3699 6.89674 17.3699C6.13945 17.3699 5.52341 16.6098 5.52341 15.6758C5.52365 14.7415 6.13945 13.9814 6.89674 13.9814Z" fill="#EA5B01" />
                                                <path d="M12.2391 25.6632C10.7455 24.8383 9.68379 22.9927 9.61305 20.83H0C0.0956572 23.5155 1.8551 25.6632 4.0044 25.6632H12.2391Z" fill="#EA5B01" />
                                            </svg>
                                        </div>
                                        <div className="progress_circle_container">
                                            <div>
                                                <h3 className="dash_num">{userOrder.order_analytics.delivered_orders}</h3>
                                                <div className="dash_description">
                                                    Total Dispatched Order
                                    </div>
                                            </div>
                                            <Progress strokeColor="#003049" className="dash_progress_circle" type="circle" percent={Math.round(calculatePercentage(userOrder.order_analytics.delivered_orders, userOrder.order_analytics.count))} />
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>

                    <div className="create_order_container">
                        <h3>Create An Order</h3>

                        <form onSubmit={handleSubmit(onSubmit)} className="place_order_form flex">
                            <div className="order_form_first_section">
                                <div className="flex-column">
                                    <label for="package_content" className="form_label">Package Content</label>
                                    <input id="package_content" ref={register} className="form_input" placeholder="eg. Electronics, Beauty Product" name="package_content" />
                                </div>
                                <div className="flex-column">
                                    <label for="lastname" className="form_label">Remarks (optional)</label>
                                    <input type="text" ref={register} id="remarks" className="form_input" placeholder="eg. Fragile, Handle with care" name="remarks" />
                                </div>
                                <div className="flex-column">
                                    <label for="time" className="form_label">When do you want it picked up?</label>
                                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <DatePicker disabledDate={(value) =>{
                                                // Can not select days before today and today
                                                return  value < dayjs();
                                            }} name="pickup_date" ref={register} onChange={(date, dateString) => {
                                            setDateString(dateString)
                                        }} />
                                        {/* <TimePicker onChange={(time, timeString) => setStringTime(timeString)} /> */}
                                    </div>
                                </div>

                                <PhotoUploader onChange={(file) => setUploadImg(file)} />
                            </div>



                            <div className="order_form_second_section">
                                <div>
                                    <h3 style={{ color: 'white', marginLeft: '3px' }}>Pickup Details</h3>
                                    <div className="flex">
                                        <div>
                                            <label className="form_label" for="fullname">Fullname</label>
                                            <input type="text" id="fullname" ref={register} className="form_input" name="pickup_fullname" />
                                        </div>

                                        <div style={{ marginLeft: '3px' }}>
                                            <label className="form_label" for="fullname">Phone number</label>
                                            <input  type="tel" id="fullname" className="form_input" ref={register} name="pickup_phone" />
                                        </div>
                                    </div>

                                    <div className="flex-column">
                                        <label className="form_label" for="fullname">Location</label>
                                        <input type="text" id="location" className="form_input" ref={register} name="pickup_location" />
                                    </div>

                                </div>

                                <div>
                                    <h3 style={{ color: 'white', marginLeft: '3px' }}>Delivery Details</h3>
                                    <div className="flex">
                                        <div>
                                            <label className="form_label" for="fullname">Fullname</label>
                                            <input type="text" id="fullname" className="form_input" ref={register} name="delivery_fullname" />
                                        </div>

                                        <div style={{ marginLeft: '3px' }}>
                                            <label className="form_label" for="fullname">Phone number</label>
                                            <input type="tel" id="fullname" className="form_input" ref={register} name="delivery_phone" />
                                        </div>
                                    </div>

                                    <div className="flex-column">
                                        <label className="form_label" for="fullname">Location</label>
                                        <input type="text" id="location" className="form_input" ref={register} name="delivery_location" />
                                    </div>

                                </div>

                                <div className="place_order_btn">
                                   {loading ? '':  <input type="submit"/>}
                                    <Button type="primary" className="place_order_submit_btn" loading={loading}>
                                        Place Order
                                    </Button>
                                </div>
                            </div>



                        </form>


                    </div>


                    <div className="order_table_container">
                        <h3 >Latest Orders</h3>
                        <OrderTable belongsTo={'user'} loading={userOrder.loading_orders} data={userOrder.orders} />
                    </div>
                </Content>
            </div>
        </div>

    )
}

export default Dashboard;
