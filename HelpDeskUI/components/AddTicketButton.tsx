import { useState } from 'react';
import Button from '@/components/Button';
import AddTicketPopup from '@/components/AddTicketPopup';

const AddTicketButton = () => {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <>
            {showPopup && <AddTicketPopup handleClose={() => setShowPopup(false)} />}
            <Button value='Add Ticket'
                onClick={() => setShowPopup(true)} />
        </>
    );
};

export default AddTicketButton;