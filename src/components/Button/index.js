import React from 'react';
import { Button } from 'antd';
import './button.css';

function CustomButton(props) {
    const { type, width, style } = props;

    return (
        <>
            {
                type === 'primary' ?
                    <Button {...props} style={style} width={width} className="custom-btn-primary"  type="default">{props.children}</Button>
                    : type === 'secondary' ?
                        <Button {...props} style={style} type="default" width={width} className="custom-btn-secondary">{props.children}</Button>
                    : <Button type="primary">{props.children}</Button>
            }
        </>
    )
}

export default CustomButton;
