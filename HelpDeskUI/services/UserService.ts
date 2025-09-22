import { ModelUserListResponse, UserApi } from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const userClient = new UserApi(apiConfig);

export const getUsers = async ({ api }: {
    api: APIHookMethod;
}): Promise<ModelUserListResponse | null> => {
    const { response } = await api<ModelUserListResponse>(
        callAPIWrapper(userClient.userGet())
    );

    return response;
};