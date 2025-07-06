import {onlineManager} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

    useEffect(() => {
        return onlineManager.subscribe((online) => {
            setIsOnline(online);
        });
    }, []);

    return { isOnline };
};

export const OfflineBanner = () => {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;
    return (
        <div style={{background: '#f59e0b', padding: '8px', textAlign: 'center'}}>
            📡 You're offline - showing cached data
        </div>
    );
};
