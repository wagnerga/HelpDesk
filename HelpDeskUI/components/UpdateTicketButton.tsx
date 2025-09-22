import { useState } from 'react';
import Button from '@/components/Button';
import { ModelTicket } from '@/api-client';
import UpdateTicketPopup from '@/components/UpdateTicketPopup';

const UpdateTicketButton = ({ ticket }: {
    ticket: ModelTicket;
}) => {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <>
            {showPopup && <UpdateTicketPopup
                ticket={ticket}
                handleClose={() => setShowPopup(false)} />}
            <Button value='Update'
                onClick={() => setShowPopup(true)} />
        </>
    );
};

export default UpdateTicketButton;