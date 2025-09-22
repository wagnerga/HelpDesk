import AlertPopup from '@/components/AlertPopup';
import Register from '@/components/Register';
import { AppState } from '@/store/store';
import { useSelector } from 'react-redux';

const RegisterPage = () => {
    const alerts = useSelector((state: AppState) => state.alertPopupReducer.alerts);

    return (
        <>
            <Register />
            {
                alerts.length > 0 &&
                <AlertPopup />
            }
        </>
    );
};

export default RegisterPage;