import { LoadingOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import Logo from '../Logo';
import './loader.css';

const styles = {
    loaderText: {
        marginTop: '20px',
        padding: '3px 40px',
        border: '2px solid #f7901d',
        borderRadius: '20px',
        position: 'relative',
        color: 'rgb(0 0 0 / 79%)'
    }
}

function CustomLoader({ position, text, Icon, reloadPage, style, status, retryFn, errorMessage }) {
    const dispatch = useDispatch();
    return (
        <>
            {position === 'fixed' ?
                <div className="loader_container">
                    {reloadPage ? '' : <Spin size="large" className="spin_loader" />}
                    <Logo className="loader_logo" style={{ marginTop: '20px' }} />
                    <h3 style={styles.loaderText}>
                        <span className="loader_logo_icon">
                            {reloadPage ? <div className="network_error" /> : Icon}
                        </span>
                        {text}</h3>
                    {reloadPage && <Button onClick={() => window.location.reload()} style={{ backgroundColor: '#f77f00' }} type="primary" shape="round" icon={<RedoOutlined />} size="large">
                        Retry
                    </Button>}
                </div>
                : position === 'absolute' ? <div style={{ ...style, zIndex: 1 }} className="loader_container relative_loader">
                    {status !== 'failed' && <Spin style={{ width: '100%' }} indicator={<LoadingOutlined style={{ fontSize: 24 }} />} spin={true} />}
                    {errorMessage && <h3>{errorMessage}</h3>}
                    {status === 'failed' && retryFn && <Button onClick={() => dispatch(retryFn())} style={{ backgroundColor: '#f77f00' }} type="primary" shape="round" icon={<RedoOutlined />} size="large">Retry</Button>}
                </div>
                    : ''
            }
        </>
    )
}

export default CustomLoader;