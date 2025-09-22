import { useState } from 'react';
import Button from '@/components/Button';
import AssignTicketPopup from '@/components/AssignTicketPopup';
import { ModelTicket } from '@/api-client';

const AssignTicketButton = ({ ticket }: {
    ticket: ModelTicket;
}) => {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <>
            {showPopup && <AssignTicketPopup
                ticket={ticket}
                handleClose={() => setShowPopup(false)} />}
            <Button value='Assign'
                onClick={() => setShowPopup(true)} />
        </>
    );
};

export default AssignTicketButton;