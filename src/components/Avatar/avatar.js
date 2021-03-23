import React from 'react';

const colors = ['rgb(247 127 0)', 'rgb(0 21 41)' ]
export function LetterAvatar(props) {
    const { letter, rounded } = props;

    function getFirstTwoLetters() {
        const strArr = letter.split(" ");
        let letterToReturn = [];
        if (strArr.length >= 2) {
            letterToReturn.push(strArr[0].charAt(0));
            letterToReturn.push(strArr[1].charAt(0));
        } else {
            letterToReturn.push(strArr[0].charAt(0));
            letterToReturn.push(strArr[0].charAt(1));
        }
        return letterToReturn.join("");
    }

    const returnRandomNum = (Limit) => {
        return Math.floor(Math.random() * Limit) + 1
    }

    return (
        <div {...props} style={{
            backgroundColor: colors[returnRandomNum(colors.length - 1)],
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            borderRadius: rounded  ? '50px' : '5px',

        }}>

            <h2 style={{ fontSize: '16px', margin: '0', color: 'white'}}>{getFirstTwoLetters()}</h2>
        </div >
    )
}