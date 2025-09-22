import Dashboard from '@/components/Dashboard';
import AlertPopup from '@/components/AlertPopup';
import { AppState } from '@/store/store';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
    const alerts = useSelector((state: AppState) => state.alertPopupReducer.alerts);

    return (
        <>
            <Dashboard />
            {
                alerts.length > 0 &&
                <AlertPopup />
            }
        </>
    );
};

export default DashboardPage;