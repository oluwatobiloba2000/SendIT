import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import io from "socket.io-client";
import { CONNECTION_PORT } from '../../../App';

let socket;
function LogisticsCompanyHandleSocketConnection() {
    const { track_number } = useParams();

    const [state, setState] = useState('');

    useEffect(() => {
        socket = io(CONNECTION_PORT);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CONNECTION_PORT]);

    useEffect(() => {
        socket.on('connect', () => {
            socket.reconnects = true;
            socket.open();
            socket.emit("enter_company_room", {id : 'all_company_room'});
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

export default LogisticsCompanyHandleSocketConnection;
