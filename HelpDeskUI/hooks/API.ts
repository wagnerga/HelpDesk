import { useCallback } from 'react'
import { useDispatch } from 'react-redux';
import allActions from '@/store/actions/Actions';
import { useLogout } from '@/hooks/Logout';
import { Configuration, FetchAPI, ResponseError } from '@/api-client';
import { defaultErrorMessage } from '@/util/Constants';

interface IAPIResponse<T = any> {
    errorCode?: number;
    errorMessage?: string;
    result?: T;
};

export const parseErrorResponse = async <T>(e: ResponseError):
    Promise<{ response: T | null; errorMessage?: string }> => {
    try {
        const json = await e.response.json();

        return {
            response: json as T
        };
    }
    catch {
        return {
            response: {
                errorCode: e.response.status,
                errorMessage: e.response.status === 401 ?
                    'unauthorized' :
                    'Unexpected error occurred.'
            } as T
        };
    }
};

const customFetch: FetchAPI = (input, init) => {
    const token = localStorage.getItem('hdJWT');

    const modifiedInit: RequestInit = {
        ...init,
        headers: {
            ...(init?.headers || {}),
            Authorization: token ? `Bearer ${token}` : ''
        }
    };

    return fetch(input, modifiedInit);
};

export const apiConfig = new Configuration({
    basePath: 'https://localhost:7001',
    fetchApi: customFetch
});

export type APIHookMethod = <T>(
    apiCall: Promise<{ response: T | null; }>
) => Promise<{ response: T | null }>;

export const callAPIWrapper = async <T>(
    apiCall: Promise<T>
): Promise<{ response: T | null; }> => {
    try {
        const result = await apiCall;
        return { response: result };
    }
    catch (e) {
        if (e instanceof ResponseError && e.response) {
            const { response } = await parseErrorResponse<T>(e);
            return { response };
        }

        return { response: null };
    }
};

export const useAPI = () => {
    const logout = useLogout();
    const dispatch = useDispatch();

    return useCallback(async <T>(method: Promise<{ response: T | null }>) => {
        try {
            const { response } = await method;

            const { errorMessage } = response as IAPIResponse;

            if (errorMessage) {
                if (errorMessage === 'unauthorized') {
                    logout();
                    return { response: null };
                }

                dispatch(allActions.updateAlertPopup({ alerts: [{ message: errorMessage || defaultErrorMessage }] }));
                return { response: null };
            }

            return { response };
        }
        catch (e) {
            if (e instanceof ResponseError && e.response) {
                try {
                    const { response, errorMessage } = await parseErrorResponse<T>(e);

                    if (errorMessage === 'unauthorized') {
                        logout();
                        return { response: null };
                    }

                    dispatch(allActions.updateAlertPopup({ alerts: [{ message: errorMessage || defaultErrorMessage }] }));
                    return { response };
                } catch {
                    dispatch(allActions.updateAlertPopup({ alerts: [{ message: defaultErrorMessage }] }));
                    return { response: null };
                }
            }

            dispatch(allActions.updateAlertPopup({ alerts: [{ message: defaultErrorMessage }] }));
            return { response: null };
        }
    }, [logout, dispatch]);
};