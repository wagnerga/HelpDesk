import { useState, useCallback, useRef, useEffect } from 'react';
import ChangePassword, {
    has10Characters, hasLowerCaseCharacter, hasNumberCharacter,
    hasSpecialCharacter, hasUpperCaseCharacter, passwordEmpty, passwordsMatch
} from '@/components/ChangePassword';
import 'moment-timezone';
import { useRouter } from 'next/router';
import PageContainer from '@/components/PageContainer';
import FieldWrapper from '@/components/FieldWrapper';
import Button from '@/components/Button';
import { Direction } from '@/util/Common';
import { register } from '@/services/RegisterService';
import { useAPI } from '@/hooks/API';
import { useDispatch } from 'react-redux';
import allActions from '@/store/actions/Actions';

const Register = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const api = useAPI();

    const [username, setUsername] = useState('');
    const [confirmUsername, setConfirmUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [, setWidth] = useState<number>();
    const [, setHeight] = useState<number>();

    const timeout = useRef<NodeJS.Timeout>(undefined);

    const resize = useCallback(() => {
        if (timeout.current)
            clearTimeout(timeout.current);

        timeout.current = setTimeout(() => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }, 250);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resize);

        resize();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    const handleSubmit = useCallback(async () => {
        if (!username)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Username cannot be empty.' }] }));
        else if (username !== confirmUsername)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Username and Confirm Username do not match.' }] }));
        else if (username.length > 50)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Username exceeds 50 characters maximum.' }] }));
        else if (!password || passwordEmpty({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password cannot be empty.' }] }));
        else if (!confirmPassword || !passwordsMatch({ password, confirmPassword }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password and Confirm Password do not match.' }] }));
        else if (password.length > 50)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password exceeds 50 characters maximum.' }] }));
        else if (!has10Characters({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password must be at least 10 characters long.' }] }));
        else if (!hasUpperCaseCharacter({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password must have at least 1 uppercase character.' }] }));
        else if (!hasLowerCaseCharacter({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password must have at least 1 lowercase character.' }] }));
        else if (!hasNumberCharacter({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password must have at least 1 number.' }] }));
        else if (!hasSpecialCharacter({ password }))
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Password must have at least 1 special character.' }] }));
        else if (firstName.length > 50)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'First Name exceeds 50 characters maximum.' }] }));
        else if (lastName.length > 50)
            dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Last Name exceeds 50 characters maximum.' }] }));
        else {
            const registerResponse = await register({ api, registerRequest: { confirmPassword, confirmUsername, firstName, lastName, password, username } })

            if (registerResponse?.result) {
                dispatch(allActions.updateAlertPopup({ alerts: [{ message: 'Registered successfully!' }] }));
                router.push('/');
            }
        }
    }, [router, api, confirmPassword, password, username, confirmUsername, firstName, lastName, dispatch]);

    return (
        <PageContainer title='Register'
            maxWidth='500px'
            justifyContent='flex-start'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <FieldWrapper title='Username'
                            direction={Direction.Row}>
                            <input type='text'
                                autoFocus={true}
                                value={username ?? ''}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyUp={async (e) => { if (e.key === 'Enter') await handleSubmit(); }}
                                max={50} />
                        </FieldWrapper>
                        <FieldWrapper title='Confirm Username'
                            direction={Direction.Row}>
                            <input type='text'
                                value={confirmUsername ?? ''}
                                onChange={(e) => setConfirmUsername(e.target.value)}
                                onKeyUp={async (e) => { if (e.key === 'Enter') await handleSubmit(); }}
                                max={50} />
                        </FieldWrapper>
                    </div>
                    <ChangePassword
                        onKeyUp={async (e) => {
                            if (e.key === 'Enter')
                                await handleSubmit();
                        }}
                        newPassword={password ?? ''}
                        setNewPassword={(s) => setPassword(s as string)}
                        confirmNewPassword={confirmPassword ?? ''}
                        setConfirmNewPassword={(s) => setConfirmPassword(s as string)}
                        useLabel={true} />
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <FieldWrapper title='First Name'
                            direction={Direction.Row}>
                            <input type='text'
                                value={firstName ?? ''}
                                onChange={(e) => setFirstName(e.target.value)}
                                onKeyUp={async (e) => { if (e.key === 'Enter') await handleSubmit(); }}
                                max={50} />
                        </FieldWrapper>
                        <FieldWrapper title='Last Name'
                            direction={Direction.Row}>
                            <input type='text'
                                value={lastName ?? ''}
                                onChange={(e) => setLastName(e.target.value)}
                                onKeyUp={async (e) => { if (e.key === 'Enter') await handleSubmit(); }}
                                max={50} />
                        </FieldWrapper>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <Button value='Cancel'
                        onClick={() => router.push('/')} />
                    <Button value='Submit'
                        onClick={handleSubmit} />
                </div>
            </div>
        </PageContainer>
    );
};

export default Register;