import { faSignOut } from '@fortawesome/free-solid-svg-icons'
import { useLogout } from '@/hooks/Logout'
import Button from '@/components/Button';

const LogoutButton = () => {
    const logout = useLogout();

    return (
        <Button onClick={logout}
            disabled={false}
            icon={faSignOut}
            title='Logout' />
    );
};

export default LogoutButton;