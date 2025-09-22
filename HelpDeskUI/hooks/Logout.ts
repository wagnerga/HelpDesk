import { useCallback } from 'react'
import { useRouter } from 'next/router';

export const useLogout = () => {
    const router = useRouter();

    return useCallback(() => {
        router.push('/');

        localStorage.removeItem('hdJWT');
    }, [router]);
};