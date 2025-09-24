import Popup from '@/components/Popup';
import { useCallback, useEffect, useRef, useState } from 'react';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/Button';
import { Direction, doesElementFitInPopup } from '@/util/Common';
import { TicketStatus } from '@/api-client';
import FieldWrapper from '@/components/FieldWrapper';
import { insertTicket } from '@/services/TicketService';
import { useAPI } from '@/hooks/API';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import allActions from '@/store/actions/Actions';
import { AppState } from '@/store/store';
import { getDisplayStatus } from '@/components/TicketsTable';

const AddTicketPopup = ({ handleClose }:
    {
        handleClose: () => void;
    }) => {
    const api = useAPI();
    const dispatch = useDispatch();

    const [assignedUserId, setAssignedUserId] = useState<undefined | string>(undefined);
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TicketStatus>(TicketStatus.Open);

    const users = useSelector((state: AppState) => state.dataReducer.users);

    const buttons = [<Button key='close' onClick={handleClose} icon={faClose} title='Close' />];

    const childrenContainerElementRef = useRef<HTMLDivElement>(null);
    const verticalScrollbarVisibleRef = useRef<boolean>(false);

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

    const handleAdd = useCallback(async () => {
        if (description.length > 3000)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Description exceeds 3000 characters maximum.' }] }));
        else {
            const insertTicketResponse = await insertTicket({
                api,
                insertTicketRequest: {
                    ticket: {
                        assignedUserId,
                        createdAt: new Date().getTime(),
                        description,
                        id: v4(),
                        status
                    }
                }
            });

            if (insertTicketResponse?.result)
                handleClose();
        }
    }, [handleClose, assignedUserId, description, status, api, dispatch]);

    const fit = doesElementFitInPopup({
        windowWidth: width,
        windowHeight: height,
        elementWidth: childrenContainerElementRef.current?.clientWidth,
        elementHeight: childrenContainerElementRef.current?.clientHeight,
        isVerticalScrollbarVisible: verticalScrollbarVisibleRef.current
    });

    return (
        <Popup title='Add Ticket'
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
                <FieldWrapper title='Status'
                    direction={Direction.Row}>
                    <select value={status}
                        onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                        {
                            Object.keys(TicketStatus).map(status => <option key={status} value={status}>{getDisplayStatus({ status: status as TicketStatus })}</option>)
                        }
                    </select>
                </FieldWrapper>
                <FieldWrapper title='Description'
                    direction={Direction.Column}>
                    <textarea value={description ?? ''}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        maxLength={3000}
                        style={{ width: '200px' }} />
                    <span style={{ alignSelf: 'flex-end', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {description?.length ?? 0}/3000 characters
                    </span>
                </FieldWrapper>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <Button value='Cancel'
                        onClick={handleClose} />
                    <Button value='Add'
                        onClick={handleAdd} />
                </div>
            </div>
        </Popup>
    );
};

export default AddTicketPopup;