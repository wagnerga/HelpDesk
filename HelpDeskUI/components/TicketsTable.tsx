import Table, { IColumn, IRow } from '@/components/Table';
import { Column, ModelSortColumn, ModelTicket, ModelUser, TicketStatus } from '@/api-client';
import { dateTimeWithSecondsFormat } from '@/util/Common';
import TicketAction from '@/components/TicketAction';
import { popupBackgroundColor, popupFontColor, timeZone } from '@/util/Constants';

export const getDisplayStatus = ({ status }:
    {
        status: TicketStatus;
    }) => {
    switch (status) {
        case TicketStatus.Closed:
            return 'Closed';
        case TicketStatus.InProgress:
            return 'In Progress';
        case TicketStatus.Open:
            return 'Open';
        default:
            return 'N/A';
    }
};

const TicketsTable = ({
    tickets,
    sortColumns,
    setSortColumns,
    showLoader,
    users
}: {
    tickets: ModelTicket[];
    sortColumns: ModelSortColumn[];
    setSortColumns: React.Dispatch<React.SetStateAction<ModelSortColumn[]>>;
    showLoader: boolean;
    users: ModelUser[];
}) => {
    const columns: IColumn[] = [
        { dataName: 'action', value: 'Action' },
        { dataName: 'id', value: 'Id' },
        { dataName: 'assignedUserId', value: 'Assigned User' },
        { dataName: 'createdAt', value: 'Created At', column: Column.CreatedAt },
        { dataName: 'description', value: 'Description' },
        { dataName: 'status', value: 'Status', column: Column.Status },
        { dataName: 'udpatedAt', value: 'Updated At', column: Column.UpdatedAt }
    ];

    const rows: IRow[] = tickets.map(ticket => {
        const user = ticket.assignedUserId ? users.find(user => user.id === ticket.assignedUserId) : undefined;

        return {
            id: ticket.id,
            cells: [
                {
                    dataName: 'action',
                    value: <TicketAction key={`action-${ticket.id}`} ticket={ticket} />,
                    backgroundColor: popupBackgroundColor,
                    fontColor: popupFontColor
                },
                { dataName: 'id', value: ticket.id, backgroundColor: popupBackgroundColor, fontColor: popupFontColor },
                { dataName: 'assignedUserId', value: user ? `${user.firstName} ${user.lastName}` : 'N/A', backgroundColor: popupBackgroundColor, fontColor: popupFontColor },
                { dataName: 'createdAt', value: dateTimeWithSecondsFormat({ timeZone, date: ticket.createdAt }), backgroundColor: popupBackgroundColor, fontColor: popupFontColor },
                { dataName: 'description', value: ticket.description, backgroundColor: popupBackgroundColor, fontColor: popupFontColor },
                { dataName: 'status', value: getDisplayStatus({ status: ticket.status }), backgroundColor: popupBackgroundColor, fontColor: popupFontColor },
                { dataName: 'updatedAt', value: ticket.updatedAt ? dateTimeWithSecondsFormat({ timeZone, date: ticket.updatedAt }) : 'N/A', backgroundColor: popupBackgroundColor, fontColor: popupFontColor }
            ]
        };
    });

    return (
        <Table columns={columns}
            rows={rows}
            sortColumns={sortColumns}
            setSortColumns={setSortColumns}
            showLoader={showLoader} />
    );
};

export default TicketsTable;