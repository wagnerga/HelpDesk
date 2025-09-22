import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { alertPopupReducer } from '@/store/reducers/AlertPopupReducer';
import { dataReducer } from '@/store/reducers/DataReducer';

const rootReducer = combineReducers({
    alertPopupReducer,
    dataReducer
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
        actionCreatorCheck: false
    })
});

export type AppState = ReturnType<typeof rootReducer>;
export default store;