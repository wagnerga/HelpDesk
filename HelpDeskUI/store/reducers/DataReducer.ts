import { ModelTicket, ModelUser } from '@/api-client';

export interface IDataState {
    tickets: ModelTicket[];
    users: ModelUser[];
};

const initialState: IDataState = {
    tickets: [],
    users: []
};

interface ActionA {
    type: 'UPSERT_TICKET';
    payload: ModelTicket;
};

interface ActionB {
    type: 'UPSERT_USERS';
    payload: ModelUser[];
};

interface ActionC {
    type: 'DELETE_TICKET';
    payload: ModelTicket;
};

interface ActionD {
    type: 'DELETE_USER';
    payload: ModelUser;
};

type Action = ActionA | ActionB | ActionC | ActionD;

export const dataReducer = (state = initialState, action: Action): IDataState => {
    switch (action.type) {
        case 'UPSERT_TICKET': {
            const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);

            if (index !== -1)
                return {
                    ...state,
                    tickets: state.tickets.map(ticket =>
                        ticket.id === action.payload.id ? action.payload : ticket
                    )
                };

            return {
                ...state,
                tickets: [...state.tickets, action.payload]
            };
        }
        case 'UPSERT_USERS': {
            const usersMap = new Map(state.users.map(user => [user.id, user]));
            action.payload.forEach(user => {
                usersMap.set(user.id, user);
            });

            return {
                ...state,
                users: Array.from(usersMap.values())
            };
        }
        case 'DELETE_TICKET': {
            return {
                ...state,
                tickets: state.tickets.filter(ticket => ticket.id !== action.payload.id)
            };
        }
        case 'DELETE_USER': {
            return {
                ...state,
                users: state.users.filter(user => user.id !== action.payload.id)
            };
        }
        default:
            return state;
    }
};