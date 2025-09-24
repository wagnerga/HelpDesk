import { useDispatch, useSelector } from 'react-redux';
import allActions from '@/store/actions/Actions';
import Popup from '@/components/Popup';
import Button from '@/components/Button';
import { faBell, faClose, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { AppState } from '@/store/store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doesElementFitInPopup } from '@/util/Common';

const AlertPopup = () => {
    const dispatch = useDispatch();

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const paragraphRef = useRef<HTMLDivElement>(null);

    const { alerts } = useSelector((state: AppState) => state.alertPopupReducer);
    const [, ...rest] = alerts;

    const { after, confirm, message, title, closeOnOutOfBoundsClick } = alerts[0];

    const handleClose = () => {
        if (after)
            after();

        dispatch(allActions.insertAlertPopup({ alerts: rest }));
    };

    const buttons = [<Button key='close' onClick={handleClose} icon={faClose} title='Close' />];

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

    const titleElement = !title ?
        <FontAwesomeIcon icon={faBell} style={{ fontSize: '22px', cursor: 'pointer', alignSelf: 'center' }} /> :
        <div style={{ display: 'flex', fontSize: '22px', fontWeight: 'bolder', gap: '10px' }}>
            <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '22px', cursor: 'pointer', alignSelf: 'center' }} />
            <span>{title}</span>
        </div>;

    const childrenContainerElementRef = useRef<HTMLDivElement>(null);
    const verticalScrollbarVisibleRef = useRef<boolean>(false);

    const fit = doesElementFitInPopup({
        windowWidth: width,
        windowHeight: height,
        elementWidth: childrenContainerElementRef.current?.clientWidth,
        elementHeight: childrenContainerElementRef.current?.clientHeight,
        isVerticalScrollbarVisible: verticalScrollbarVisibleRef.current
    });

    return (
        <Popup titleElement={titleElement}
            handleClose={handleClose}
            justifyContent={fit ? 'center' : 'flex-start'}
            alignItems={fit ? 'center' : 'normal'}
            buttons={confirm ? [] : buttons}
            zIndex={7}
            closeOnOutOfBoundsClick={closeOnOutOfBoundsClick ?? false}
            verticalScrollbarVisibleRef={verticalScrollbarVisibleRef}
            childrenContainerElementRef={childrenContainerElementRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', alignSelf: 'center', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', height: '100%' }}>
                    <div ref={paragraphRef} style={{ display: 'flex', lineHeight: '30px', fontSize: '20px' }}>
                        {
                            message.includes('\\n') && message.split('\\n').map(x => (
                                <>
                                    {x}
                                    <br />
                                </>
                            ))
                        }
                        {
                            !message.includes('\\n') &&
                            message
                        }
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <Button value='Okay'
                        onClick={async () => {
                            dispatch(allActions.insertAlertPopup({ alerts: rest }));

                            if (confirm)
                                await confirm();

                            if (after)
                                await after();
                        }} />
                    {
                        confirm &&
                        <Button value='Cancel'
                            onClick={() => dispatch(allActions.insertAlertPopup({ alerts: rest }))} />
                    }
                </div>
            </div>
        </Popup>
    );
};

export default AlertPopup;