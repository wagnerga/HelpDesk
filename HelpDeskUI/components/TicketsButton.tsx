import { useState } from 'react';
import Button from '@/components/Button';
import TicketsPopup from '@/components/TicketsPopup';

const TicketsButon = () => {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <>
            {showPopup && <TicketsPopup handleClose={() => setShowPopup(false)} />}
            <Button value='Tickets'
                onClick={() => setShowPopup(true)}
                width='100px'
                height='48px'
                fontSize='19px'
                fontWeight='bolder' />
        </>
    );
};

export default TicketsButon;