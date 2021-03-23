import React, { useEffect, useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

function AnalogClock() {
    const [value, setValue] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(
            () => setValue(new Date()),
            1000
        );

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <div style={{marginRight: '5px'}}>
            <Clock size={80} value={value} />
            <h5>{value.toDateString()}</h5>
        </div>
    )
}

export default AnalogClock;