import { isMobile } from '@/util/Common';
import { useCallback, useEffect, useRef, useState } from 'react';

const PageContainer = ({ title, maxWidth, justifyContent, children }: {
    title: string;
    maxWidth?: string;
    justifyContent?: string;
    children: React.ReactNode;
}) => {
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const timeout = useRef<NodeJS.Timeout>(undefined);

    const resize = useCallback(() => {
        if (timeout.current)
            clearTimeout(timeout.current);

        timeout.current = setTimeout(() => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }, 250);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resize);

        resize();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    return (
        <div style={{
            display: 'flex',
            height: height ? height : '100%',
            alignItems: 'center',
            justifyContent: justifyContent ? justifyContent : isMobile({ width, height }) ? 'flex-start' : 'center',
            overflow: 'auto',
            flexDirection: 'column',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            gap: '20px',
            padding: '50px 20px 20px 20px',
            boxSizing: 'border-box'
        }}>
            <span style={{
                fontSize: '60px',
                fontWeight: 'bolder',
                textAlign: 'center'
            }}>{title}</span>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #FFFFFF',
                padding: '20px',
                borderRadius: '10px',
                gap: '10px',
                maxWidth
            }}>
                {children}
            </div>
        </div>
    );
};

export default PageContainer;