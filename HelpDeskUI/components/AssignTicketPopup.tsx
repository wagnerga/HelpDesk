import Popup from '@/components/Popup';
import { useCallback, useEffect, useRef, useState } from 'react';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/Button';
import { Direction, doesElementFitInPopup } from '@/util/Common';
import { ModelTicket } from '@/api-client';
import FieldWrapper from '@/components/FieldWrapper';
import { assignTicket } from '@/services/TicketService';
import { useAPI } from '@/hooks/API';
import { useDispatch, useSelector } from 'react-redux';
import allActions from '@/store/actions/Actions';
import { AppState } from '@/store/store';

const AssignTicketPopup = ({ ticket, handleClose }:
    {
        ticket: ModelTicket;
        handleClose: () => void;
    }) => {
    const api = useAPI();
    const dispatch = useDispatch();

    const [assignedUserId, setAssignedUserId] = useState<undefined | string>(undefined);

    const users = useSelector((state: AppState) => state.dataReducer.users);

    const buttons = [<Button key='close' onClick={handleClose} icon={faClose} title='Close' />];

    const childrenContainerElementRef = useRef<HTMLDivElement>(null);
    const verticalScrollbarVisibleRef = useRef<boolean>(false);

    const [, setWidth] = useState<number>(0);
    const [, setHeight] = useState<number>(0);

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

    const handleAssign = useCallback(async () => {
        if (!assignedUserId)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'No Assigned User selected.' }] }));
        else {
            const assignTicketResponse = await assignTicket({
                api,
                assignTicketRequest: {
                    ticketId: ticket.id,
                    userId: assignedUserId
                }
            });

            if (assignTicketResponse?.result)
                handleClose();
        }
    }, [handleClose, ticket, assignedUserId, api, dispatch]);

    const fit = doesElementFitInPopup({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        elementWidth: childrenContainerElementRef.current?.clientWidth,
        elementHeight: childrenContainerElementRef.current?.clientHeight,
        isVerticalScrollbarVisible: verticalScrollbarVisibleRef.current
    });

    return (
        <Popup title='Assign Ticket'
            handleClose={handleClose}
            justifyContent={fit ? 'center' : 'flex-start'}
            alignItems={fit ? 'center' : 'normal'}
            buttons={buttons}
            verticalScrollbarVisibleRef={verticalScrollbarVisibleRef}
            childrenContainerElementRef={childrenContainerElementRef}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FieldWrapper title='Assigned User'
                    direction={Direction.Row}>
                    <select autoFocus={true}
                        value={assignedUserId}
                        onChange={(e) => {
                            if (e.target.value)
                                setAssignedUserId(e.target.value);
                            else
                                setAssignedUserId(undefined);
                        }}>
                        <option value=''></option>
                        {
                            users.map(user => <option key={user.id} value={user.id}>{`${user.firstName} ${user.lastName}`}</option>)
                        }
                    </select>
                </FieldWrapper>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <Button value='Cancel'
                        onClick={handleClose} />
                    <Button value='Assign'
                        onClick={handleAssign} />
                </div>
            </div>
        </Popup>
    );
};

export default AssignTicketPopup;