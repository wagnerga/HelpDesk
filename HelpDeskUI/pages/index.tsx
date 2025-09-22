import Login from '@/components/Login';
import AlertPopup from '@/components/AlertPopup';
import { AppState } from '@/store/store';
import { useSelector } from 'react-redux';

const LoginPage = () => {
    const alerts = useSelector((state: AppState) => state.alertPopupReducer.alerts);

    return (
        <>
            <Login />
            {
                alerts.length > 0 &&
                <AlertPopup />
            }
        </>
    );
};

export default LoginPage;