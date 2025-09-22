import { LoginApi, LoginRequest, LoginResponseResponse } from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const loginClient = new LoginApi(apiConfig);

export const login = async ({ api, loginRequest }: {
    api: APIHookMethod;
    loginRequest: LoginRequest;
}): Promise<LoginResponseResponse | null> => {
    const { response } = await api<LoginResponseResponse>(
        callAPIWrapper(loginClient.loginPost({ loginRequest }))
    );

    return response;
};