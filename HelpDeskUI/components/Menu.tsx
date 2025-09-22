import LogoutButton from '@/components/LogoutButton';
import { backgroundColor, fontColor } from '@/util/Constants';

const Menu = () => {
    return (
        <div style={{
            display: 'flex',
            gap: '10px',
            padding: '4px',
            justifyContent: 'flex-end',
            backgroundColor: backgroundColor,
            border: `2px solid ${fontColor}`
        }}>
            <LogoutButton />
        </div>
    );
};

export default Menu;