
import '@/styles/Loader.css';

const Loader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', width: '100%' }}>
            <div className='lds-grid'>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
                <div style={{ backgroundColor: '#FFFFFF' }}></div>
            </div>
        </div>
    );
};

export default Loader;