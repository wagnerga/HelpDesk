import { JSX, useEffect } from 'react';
import '@/styles/Popup.css';

const Popup = ({ title, titleElement, items, children, handleClose, justifyContent, alignItems, buttons, paging, padding, closeOnOutOfBoundsClick, zIndex, backgroundColor, verticalScrollbarVisibleRef, childrenContainerElementRef }:
    {
        title?: string;
        titleElement?: JSX.Element,
        items?: JSX.Element[],
        children: JSX.Element;
        handleClose?: () => void;
        justifyContent: string;
        alignItems: string;
        buttons: JSX.Element[];
        paging?: JSX.Element;
        padding?: string;
        closeOnOutOfBoundsClick?: boolean;
        zIndex?: number;
        backgroundColor?: string;
        verticalScrollbarVisibleRef?: React.RefObject<boolean>;
        childrenContainerElementRef?: React.RefObject<HTMLDivElement | null>;
    }) => {

    useEffect(() => {
        if (childrenContainerElementRef && childrenContainerElementRef.current && verticalScrollbarVisibleRef)
            verticalScrollbarVisibleRef.current = childrenContainerElementRef.current.scrollHeight > childrenContainerElementRef.current.clientHeight;
    }, [verticalScrollbarVisibleRef, childrenContainerElementRef]);

    return (
        <div className='popupOverlay'
            style={{
                display: 'flex',
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: window.innerWidth,
                height: document.body.scrollHeight, // scrollHeight needed here so entire page is covered
                zIndex: zIndex ? zIndex : 6
            }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{
                display: 'flex',
                justifyContent,
                alignItems,
                width: window.innerWidth,
                height: document.body.scrollHeight, // scrollHeight needed here so entire page is covered
                flexDirection: 'column',
                position: 'absolute',
                left: '0px',
                top: '0px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: zIndex ? zIndex : 6
            }}
                onClick={closeOnOutOfBoundsClick ? handleClose : undefined}>
            </div>
            <div className='popupContent'
                style={{
                    display: 'flex',
                    justifyContent,
                    alignItems,
                    width: window.innerWidth,
                    height: justifyContent === 'center' ? document.body.clientHeight : undefined,
                    flexDirection: 'column',
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    backgroundColor: 'rgba(0,0,0,0)',
                    zIndex: zIndex ? zIndex + 1 : 7,
                    color: '#FFFFFF'
                }}
                onClick={closeOnOutOfBoundsClick ? handleClose : undefined}>
                <div style={{
                    display: 'flex',
                    backgroundColor: '#000000',
                    flexDirection: 'column',
                    height: justifyContent === 'center' ? undefined : window.innerHeight
                }}
                    onClick={(e) => e.stopPropagation()}>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        backgroundColor: '#A020F0',
                        color: '#FFFFFF',
                        borderLeft: '2px solid #A020F0',
                        borderRight: '2px solid #A020F0',
                        borderTop: '2px solid #A020F0',
                        borderTopRightRadius: justifyContent === 'center' ? '10px' : undefined,
                        borderTopLeftRadius: justifyContent === 'center' ? '10px' : undefined
                    }}>
                        <div style={{ display: 'flex', flexGrow: 1 }}>
                            {
                                title &&
                                <div style={{ display: 'flex', fontSize: '22px', fontWeight: 'bolder', paddingRight: '16px' }}>{title}</div>
                            }
                            {
                                titleElement &&
                                titleElement
                            }
                            {items}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                            {paging}
                            {buttons}
                        </div>
                    </div>
                    <div ref={childrenContainerElementRef}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent,
                            padding: padding ? padding : '20px',
                            backgroundColor: backgroundColor ? backgroundColor : '#000000',
                            overflow: 'auto',
                            height: '100%',
                            borderLeft: '2px solid #A020F0',
                            borderRight: '2px solid #A020F0',
                            borderBottom: '2px solid #A020F0',
                            borderBottomRightRadius: justifyContent === 'center' ? '10px' : undefined,
                            borderBottomLeftRadius: justifyContent === 'center' ? '10px' : undefined
                        }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;