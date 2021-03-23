import { useEffect, useState } from 'react'

function useCurrentWindowWidth() {
    const [currentWindowWidth, setCurrentWindowWidth] = useState(window.innerWidth);
    const handleSetWidth = () =>{
        setCurrentWindowWidth(window.innerWidth)
    }

    useEffect(()=>{
        window.addEventListener('resize', handleSetWidth);
        return ()=>{
            window.removeEventListener('resize', handleSetWidth);
        }
    }, [])

    return currentWindowWidth;
}

export default useCurrentWindowWidth;
