import Menu from '@/components/Menu';
import TicketsButon from '@/components/TicketsButton';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/Socket';
import { backgroundColor, fontColor } from '@/util/Constants';
import { getDashboard } from '@/services/DashboardService';
import { useAPI } from '@/hooks/API';
import { useDispatch } from 'react-redux';
import allActions from '@/store/actions/Actions';
import Loader from '@/components/Loader';

const Dashboard = () => {
    const api = useAPI();
    const dispatch = useDispatch();
    useSocket();

    const [, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const timeout = useRef<NodeJS.Timeout>(undefined);
    const resize = useCallback(() => {
        if (timeout.current)
            clearTimeout(timeout.current);

        timeout.current = setTimeout(() => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight - 34 - 2 - 2 - 2);
        }, 250);
    }, []);

    useEffect(() => {
        const initialize = async () => {
            const dashboardResponse = await getDashboard({ api });

            if (dashboardResponse?.result) {
                dispatch(allActions.upsertUsers({ users: dashboardResponse.result.users }));
            }
        };

        initialize();
    }, [api, dispatch]);

    useEffect(() => {
        window.addEventListener('resize', resize);

        resize();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    if (height)
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none'
            }}>
                <Menu />
                <div style={{
                    display: 'flex',
                    height: height,
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: backgroundColor,
                    borderLeft: `2px solid ${fontColor}`,
                    borderRight: `2px solid ${fontColor}`,
                    borderBottom: `2px solid ${fontColor}`
                }}>
                    <TicketsButon />
                </div>
            </div>
        );

    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            zIndex: 4,
            top: '0px',
            left: '0px'
        }}>
            <Loader />
        </div>
    );
};

export default Dashboard;