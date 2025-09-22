import { IAlert } from '@/store/reducers/AlertPopupReducer';
import { ModelTicket, ModelUser } from '@/api-client';

const deleteTicket = ({ ticket }: { ticket: ModelTicket; }) => {
    return { type: 'DELETE_TICKET', payload: ticket };
};

const deleteUser = ({ user }: { user: ModelUser; }) => {
    return { type: 'DELETE_USER', payload: user };
};

const insertAlertPopup = ({ alerts }: { alerts: IAlert[]; }) => {
    return { type: 'INSERT_ALERT_POPUP', payload: alerts };
};

const updateAlertPopup = ({ alerts }: { alerts: IAlert[]; }) => {
    return { type: 'UPDATE_ALERT_POPUP', payload: alerts };
};

const upsertTicket = ({ ticket }: { ticket: ModelTicket; }) => {
    return { type: 'UPSERT_TICKET', payload: ticket };
};

const upsertUsers = ({ users }: { users: ModelUser[]; }) => {
    return { type: 'UPSERT_USERS', payload: users };
};

const allActions = {
    deleteTicket,
    deleteUser,
    insertAlertPopup,
    updateAlertPopup,
    upsertTicket,
    upsertUsers
};

export default allActions;