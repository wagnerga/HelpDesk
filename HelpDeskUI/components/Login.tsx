import { useEffect, useState } from 'react';
import { login } from '@/services/LoginService';
import { useAPI } from '@/hooks/API';
import { useRouter } from 'next/router';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/Button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const api = useAPI();

    useEffect(() => {
        const initialize = () => {
            const jwt = localStorage.getItem('hdJWT');

            if (jwt)
                router.push('/dashboard');
        };

        initialize();
    }, [router]);

    const handleLogin = async () => {
        const loginResponse = await login({ api, loginRequest: { username, password } });

        if (loginResponse?.result?.jwt) {
            localStorage.setItem('hdJWT', loginResponse.result.jwt);
            router.push('/dashboard');
        }
    };

    return (
        <PageContainer title='Help Desk'>
            <input type='text'
                autoFocus={true}
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={async (e) => { if (e.key === 'Enter') await handleLogin(); }} />
            <input type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={async (e) => { if (e.key === 'Enter') await handleLogin(); }} />
            <Button value='Login'
                onClick={handleLogin}
                width='100%' />
            <Button value='Register'
                onClick={() => router.push('/register')}
                width='100%' />
        </PageContainer >
    );
};

export default Login;