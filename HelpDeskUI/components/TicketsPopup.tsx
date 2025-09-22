import Popup from '@/components/Popup';
import { useSelector } from 'react-redux';
import { useEffect, useCallback, useState, useRef } from 'react';
import { AppState } from '@/store/store';
import { faArrowLeft, faArrowRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { useAPI } from '@/hooks/API';
import Button from '@/components/Button';
import { Column, ModelSortColumn, ModelTicket, TicketStatus } from '@/api-client';
import { getTickets } from '@/services/TicketService';
import FieldWrapper from '@/components/FieldWrapper';
import { Direction } from '@/util/Common';
import TicketsTable from '@/components/TicketsTable';
import AddTicketButton from '@/components/AddTicketButton';

export const useRefreshTickets = () => {
    const api = useAPI();

    return useCallback(async ({ skip, take, sortColumns, status }:
        {
            skip: number;
            take: number;
            sortColumns: ModelSortColumn[];
            status?: TicketStatus;
        }) => {
        const getTicketsResponse = await getTickets({ api, getTicketsRequest: { skip, take, sortColumns, status } });

        const tickets = getTicketsResponse?.result;

        return { tickets };
    }, [api]);
};

const TicketsPopup = ({ handleClose, selectedTicketStatus }:
    {
        handleClose: () => void;
        selectedTicketStatus?: TicketStatus;
    }) => {
    const refreshTickets = useRefreshTickets();

    const [showLoader, setShowLoader] = useState(true);

    const [skip, setSkip] = useState(0);
    const [take,] = useState(50);
    const [sortColumns, setSortColumns] = useState<ModelSortColumn[]>([{ ascending: false, column: Column.CreatedAt }]);
    const [status, setStatus] = useState<TicketStatus | undefined>(selectedTicketStatus);

    const tickets_s = useSelector((state: AppState) => state.dataReducer.tickets);
    const users = useSelector((state: AppState) => state.dataReducer.users);

    const [tickets, setTickets] = useState<ModelTicket[]>([]);
    const [ticketsTotal, setTicketsTotal] = useState(0);

    const initialize = useCallback(async () => {
        const { tickets } = await refreshTickets({ skip, take, sortColumns, status });

        if (tickets) {
            setTickets(tickets.results);
            setTicketsTotal(tickets.total);
        }

        if (showLoader)
            setShowLoader(false);
    }, [refreshTickets, skip, take, sortColumns, status, showLoader]);

    const timeout = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        if (timeout.current)
            clearTimeout(timeout.current);

        timeout.current = setTimeout(async () => {
            await initialize();
        }, 250);

    }, [initialize, tickets_s]);

    const buttons = [
        <Button key='back'
            icon={faArrowLeft}
            title='Back'
            onClick={() => {
                if (skip - take >= 0)
                    setSkip(skip - take);
                else
                    setSkip(0);
            }}
            disabled={skip - take < 0} />,
        <Button key='forward'
            icon={faArrowRight}
            onClick={() => {
                if (skip + take <= ticketsTotal)
                    setSkip(skip + take);
            }}
            title='Forward'
            disabled={skip + take >= ticketsTotal} />,
        <Button key='close' onClick={handleClose} disabled={false} icon={faClose} title='Close' />
    ];

    const paging = <div style={{ display: 'flex' }}>{`${ticketsTotal > 0 ? skip + 1 : 0} - ${skip + take < ticketsTotal ? skip + take : ticketsTotal} / ${ticketsTotal}`}</div>;

    return (
        <Popup title='Tickets'
            handleClose={handleClose}
            justifyContent='flex-start'
            alignItems='normal'
            buttons={buttons}
            paging={paging}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: 'fit-content', width: 'fit-content' }}>
                <FieldWrapper title='Status'
                    direction={Direction.Row}>
                    <select style={{ alignSelf: 'center' }}
                        value={status}
                        onChange={(e) => {
                            if (e.target.value !== '')
                                setStatus(e.target.value as TicketStatus);
                            else
                                setStatus(undefined);
                        }}>
                        <option value=''></option>
                        <option value={TicketStatus.Closed}>Closed</option>
                        <option value={TicketStatus.InProgress}>In Progress</option>
                        <option value={TicketStatus.Open}>Open</option>
                    </select>
                </FieldWrapper>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <AddTicketButton />
                </div>
                <TicketsTable tickets={tickets}
                    sortColumns={sortColumns}
                    setSortColumns={setSortColumns}
                    showLoader={showLoader}
                    users={users} />
            </div>
        </Popup>
    );
};

export default TicketsPopup;