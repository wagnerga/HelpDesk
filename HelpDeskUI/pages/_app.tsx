import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '@/store/store';
import '@/styles/Global.css';
import Head from 'next/head';

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <Provider store={store}>
            <Head>
                <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
                <title>HelpDesk</title>
                <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
            </Head>
            <Component {...pageProps} />
        </Provider>
    );
};

export default App;