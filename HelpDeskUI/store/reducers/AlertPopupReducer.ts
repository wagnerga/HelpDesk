export interface IAlert {
    message: string;
    confirm?: () => Promise<any>;
    after?: () => Promise<any>;
    title?: string;
    closeOnOutOfBoundsClick?: boolean;
};

interface IAlertPopupState {
    alerts: IAlert[]
};

const initialState: IAlertPopupState = {
    alerts: []
};

interface ActionA {
    type: 'UPDATE_ALERT_POPUP';
    payload: IAlert[];
};

interface ActionB {
    type: 'INSERT_ALERT_POPUP';
    payload: IAlert[];
};

type Action = ActionA | ActionB;

export const alertPopupReducer = (state = initialState, action: Action): IAlertPopupState => {
    switch (action.type) {
        case 'UPDATE_ALERT_POPUP': {
            return { alerts: [...state.alerts, ...action.payload] };
        }
        case 'INSERT_ALERT_POPUP': {
            return { alerts: action.payload };
        }
        default:
            return state;
    }
};