import React from 'react'
import logoPics from '../../img/logo.svg';
import './logo.css';

function Logo(props) {
    return (
        <div {...props}>
            <img src={logoPics} alt="logo"/>
            <span className="logo_text">SendIt</span>
        </div>
    )
}

export default Logo
