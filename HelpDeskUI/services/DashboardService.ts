import { DashboardApi, DashboardResponseResponse } from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const dashboardClient = new DashboardApi(apiConfig);

export const getDashboard = async ({ api }: {
    api: APIHookMethod;
}): Promise<DashboardResponseResponse | null> => {
    const { response } = await api<DashboardResponseResponse>(
        callAPIWrapper(dashboardClient.dashboardGet())
    );

    return response;
};