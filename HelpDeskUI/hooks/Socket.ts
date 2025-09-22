import { useEffect } from 'react'
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import allActions from '@/store/actions/Actions';
import { ModelTicket, ModelUser } from '@/api-client';
import { nodeJSPort } from '@/util/Constants';

const convertKeysToCamelCase = ({ obj }: { obj: any; }): any => {
    let newO: any, newKey: any, value: any;

    if (obj instanceof Array) {
        return obj.map(function (value) {
            if (typeof value === 'object')
                value = convertKeysToCamelCase({ obj: value });

            return value;
        });
    }
    else {
        newO = {}

        for (const origKey in obj) {
            if (obj.hasOwnProperty(origKey)) {
                newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString();
                value = obj[origKey];

                if (value instanceof Array || (value !== null && value.constructor === Object))
                    value = convertKeysToCamelCase({ obj: value });

                newO[newKey] = value;
            }
        }
    }
    return newO;
};

export const useSocket = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const jwt = localStorage.getItem('hdJWT');
        const url = `${window.location.protocol}//${window.location.hostname}:${nodeJSPort}`
        const socket = io(url, { query: { token: jwt } });

        socket.on('connected', () => {
            socket.emit('ready_for_data', {});
        });

        socket.on('update_ticket', async (notification) => {
            const ticket: ModelTicket = convertKeysToCamelCase({ obj: JSON.parse(notification.msg.payload) });

            if (ticket)
                dispatch(allActions.upsertTicket({ ticket }));
        });

        socket.on('delete_ticket', (notification) => {
            const ticket: ModelTicket = convertKeysToCamelCase({ obj: JSON.parse(notification.msg.payload) });

            if (ticket)
                dispatch(allActions.deleteTicket({ ticket }));
        });

        socket.on('update_user', async (notification) => {
            const user: ModelUser = convertKeysToCamelCase({ obj: JSON.parse(notification.msg.payload) });

            if (user)
                dispatch(allActions.upsertUsers({ users: [user] }));
        });

        socket.on('delete_user', (notification) => {
            const user: ModelUser = convertKeysToCamelCase({ obj: JSON.parse(notification.msg.payload) });

            if (user)
                dispatch(allActions.deleteUser({ user }));
        });

        return () => {
            socket.disconnect();
        };

    }, [dispatch]);
};