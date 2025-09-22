import { ModelTicket } from '@/api-client';
import Button from '@/components/Button';
import { useAPI } from '@/hooks/API';
import { unassignTicket } from '@/services/TicketService';
import allActions from '@/store/actions/Actions';
import { useDispatch } from 'react-redux';
import AssignTicketButton from '@/components/AssignTicketButton';
import UpdateTicketButton from '@/components/UpdateTicketButton';

const TicketAction = ({ ticket }:
    {
        ticket: ModelTicket;
    }) => {
    const dispatch = useDispatch();
    const api = useAPI();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px'
        }}>
            {
                ticket.assignedUserId &&
                <Button value='Unassign'
                    onClick={() => dispatch(allActions.updateAlertPopup({
                        alerts: [{
                            message: 'Are you sure you want to unassign this ticket?',
                            confirm: async () => await unassignTicket({ api, ticketId: ticket.id })
                        }]
                    }))} />
            }
            {
                !ticket.assignedUserId &&
                <AssignTicketButton ticket={ticket} />
            }
            <UpdateTicketButton ticket={ticket} />
        </div>
    );
};

export default TicketAction;