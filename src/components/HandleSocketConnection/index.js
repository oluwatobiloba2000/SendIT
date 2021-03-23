import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import io from "socket.io-client";
import { CONNECTION_PORT } from '../../App';

let socket;
function HandleSocketConnection(props) {
    const { track_number } = useParams();

    const [state, setState] = useState('');
    const currentUser = useSelector(state => state.currentuser);

    useEffect(() => {
        socket = io(CONNECTION_PORT);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CONNECTION_PORT]);

    useEffect(() => {
        socket.on('connect', () => {
            socket.reconnects = true;
            socket.open();
            currentUser && currentUser.data.id && socket.emit("enter_user_room_through_id", {id : currentUser.data.id});
            track_number && socket.emit("enter_activity_details_room", {track_number });
            setState('')
        })

        socket.on('disconnect', (state) => {
            setState('disconnected')
            setTimeout(()=>{
                setState('connecting');
            }, 8000);
        })

        return ()=> {
            socket.off('connect');
            socket.off('disconnect');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            {state === 'disconnected' ? <Alert type="error" message="Your connection has been disconnected" banner />
                : state === 'connecting' ? <Alert type="warning" icon={<LoadingOutlined />} message="Reconnecting ....."  banner /> : '' }
        </div>
    )
}

export default HandleSocketConnection;
