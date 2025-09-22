import { BooleanResponse, RegisterApi, RegisterPostRequest, RegisterRequest } from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const registerClient = new RegisterApi(apiConfig);

export const register = async ({ api, registerRequest }: {
    api: APIHookMethod;
    registerRequest: RegisterRequest;
}): Promise<BooleanResponse | null> => {
    const { response } = await api<BooleanResponse>(
        callAPIWrapper(registerClient.registerPost({ registerRequest }))
    );

    return response;
};
