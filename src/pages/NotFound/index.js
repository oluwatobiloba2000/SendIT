import React from 'react'
import './NotFound.css';
import NotFoundSvg from '../../img/notFound.svg';
import Logo from '../../components/Logo';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="not_found_container">
            <Logo className="not_found_logo" />

            <div className="not_found_svg_container">
                <img src={NotFoundSvg} alt="not found" />
            </div>

            <div className="not_found_content">
                <div className='not_found_title'>
                    <h1>Page Not Found</h1>
                    <svg width="422" height="43" viewBox="0 0 422 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.954417 41.4218C167.617 12.1857 350.836 9.75191 421.613 12.1895" stroke="#F77F00" stroke-width="3" />
                    </svg>
                </div>

                <div className="not_found_btn_container">
                    <Link to="/">Go Home</Link>
                </div>
            </div>
        </div>
    )
}

export default NotFound
