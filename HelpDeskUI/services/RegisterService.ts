import { GuidResponse, RegisterApi, RegisterRequest } from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const registerClient = new RegisterApi(apiConfig);

export const register = async ({ api, registerRequest }: {
    api: APIHookMethod;
    registerRequest: RegisterRequest;
}): Promise<GuidResponse | null> => {
    const { response } = await api<GuidResponse>(
        callAPIWrapper(registerClient.registerPost({ registerRequest }))
    );

    return response;
};