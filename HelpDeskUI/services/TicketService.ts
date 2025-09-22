import {
    AssignTicketRequest, BooleanResponse, GetTicketsRequest,
    InsertTicketRequest,
    ModelTicketModelWrapperResponse,
    TicketApi,
    UpdateTicketRequest
} from '@/api-client';
import { apiConfig, APIHookMethod, callAPIWrapper } from '@/hooks/API';

export const ticketClient = new TicketApi(apiConfig);

export const assignTicket = async ({ api, assignTicketRequest }: {
    api: APIHookMethod;
    assignTicketRequest: AssignTicketRequest;
}): Promise<BooleanResponse | null> => {
    const { response } = await api<BooleanResponse>(
        callAPIWrapper(ticketClient.ticketAssignPost({ assignTicketRequest }))
    );

    return response;
};

export const getTickets = async ({ api, getTicketsRequest }: {
    api: APIHookMethod;
    getTicketsRequest: GetTicketsRequest;
}): Promise<ModelTicketModelWrapperResponse | null> => {
    const { response } = await api<ModelTicketModelWrapperResponse>(
        callAPIWrapper(ticketClient.ticketListPost({ getTicketsRequest }))
    );

    return response;
};

export const insertTicket = async ({ api, insertTicketRequest }: {
    api: APIHookMethod;
    insertTicketRequest: InsertTicketRequest;
}): Promise<BooleanResponse | null> => {
    const { response } = await api<BooleanResponse>(
        callAPIWrapper(ticketClient.ticketPost({ insertTicketRequest }))
    );

    return response;
};

export const unassignTicket = async ({ api, ticketId }: {
    api: APIHookMethod;
    ticketId: string;
}): Promise<BooleanResponse | null> => {
    const { response } = await api<BooleanResponse>(
        callAPIWrapper(ticketClient.ticketTicketIdDelete({ ticketId }))
    );

    return response;
};

export const udpateTicket = async ({ api, updateTicketRequest }: {
    api: APIHookMethod;
    updateTicketRequest: UpdateTicketRequest;
}): Promise<BooleanResponse | null> => {
    const { response } = await api<BooleanResponse>(
        callAPIWrapper(ticketClient.ticketPatch({ updateTicketRequest }))
    );

    return response;
};