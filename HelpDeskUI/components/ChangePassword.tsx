import { useEffect, useState } from 'react';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FieldWrapper from '@/components/FieldWrapper';
import { Direction } from '@/util/Common';

export const hasUpperCaseCharacter = ({ password }:
    {
        password: string;
    }) => {

    return /[A-Z]/.test(password)
};

export const hasLowerCaseCharacter = ({ password }:
    {
        password: string;
    }) => {

    return /[a-z]/.test(password);
};

export const hasNumberCharacter = ({ password }:
    {
        password: string;
    }) => {

    return /\d/.test(password);
};

export const hasSpecialCharacter = ({ password }:
    {
        password: string;
    }) => {

    return /\W/.test(password);
};

export const has10Characters = ({ password }:
    {
        password: string;
    }) => {

    return password.length >= 10;
};

export const passwordsMatch = ({ password, confirmPassword }:
    {
        password: string;
        confirmPassword: string;
    }) => {

    return password === confirmPassword;
};

export const passwordEmpty = ({ password }:
    {
        password: string;
    }) => {

    return !password;
};

const ChangePassword = ({ onKeyUp, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword, useLabel }:
    {
        onKeyUp: React.KeyboardEventHandler<HTMLInputElement> | undefined;
        newPassword: string;
        setNewPassword: React.Dispatch<React.SetStateAction<string>>;
        confirmNewPassword: string;
        setConfirmNewPassword: React.Dispatch<React.SetStateAction<string>>;
        useLabel: boolean;
    }) => {

    const [passwordEmptyColor, setPasswordEmptyColor] = useState('#FF0000');
    const [hasUppercaseCharacterColor, setHasUppercaseCharacterColor] = useState('#FF0000');
    const [hasLowercaseCharacterColor, setHasLowercaseCharacterColor] = useState('#FF0000');
    const [hasNumberCharacterColor, setHasNumberCharacterColor] = useState('#FF0000');
    const [hasSpecialCharacterColor, setHasSpecialCharacterColor] = useState('#FF0000');
    const [has10CharactersColor, setHas10CharactersColor] = useState('#FF0000');
    const [passwordsMatchColor, setPasswordsMatchColor] = useState('#00FF00');

    useEffect(() => {
        if (passwordEmpty({ password: newPassword }))
            setPasswordEmptyColor('#FF0000');
        else
            setPasswordEmptyColor('#00FF00');

        if (!hasUpperCaseCharacter({ password: newPassword }))
            setHasUppercaseCharacterColor('#FF0000');
        else
            setHasUppercaseCharacterColor('#00FF00');

        if (!hasLowerCaseCharacter({ password: newPassword }))
            setHasLowercaseCharacterColor('#FF0000');
        else
            setHasLowercaseCharacterColor('#00FF00');

        if (!hasNumberCharacter({ password: newPassword }))
            setHasNumberCharacterColor('#FF0000');
        else
            setHasNumberCharacterColor('#00FF00');

        if (!hasSpecialCharacter({ password: newPassword }))
            setHasSpecialCharacterColor('#FF0000');
        else
            setHasSpecialCharacterColor('#00FF00');

        if (!has10Characters({ password: newPassword }))
            setHas10CharactersColor('#FF0000');
        else
            setHas10CharactersColor('#00FF00');

        if (!passwordsMatch({ password: newPassword, confirmPassword: confirmNewPassword }))
            setPasswordsMatchColor('#FF0000');
        else
            setPasswordsMatchColor('#00FF00');
    }, [newPassword, confirmNewPassword]);

    return (
        <>
            {
                useLabel &&
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    <FieldWrapper title='Password'
                        direction={Direction.Row}>
                        <input type='password'
                            value={newPassword}
                            onChange={(e) => {
                                const value = e.target.value;

                                setNewPassword(value);
                            }}
                            onKeyUp={onKeyUp}
                            max={50} />
                    </FieldWrapper>
                    <FieldWrapper title='Confirm Password'
                        direction={Direction.Row}>
                        <input type='password'
                            value={confirmNewPassword}
                            onChange={(e) => {
                                const value = e.target.value;

                                setConfirmNewPassword(value);
                            }}
                            onKeyUp={onKeyUp}
                            max={50} />
                    </FieldWrapper>
                </div>
            }
            {
                !useLabel &&
                <>
                    <input type='password'
                        value={newPassword}
                        placeholder='Password'
                        onChange={(e) => {
                            const value = e.target.value;

                            setNewPassword(value);
                        }}
                        onKeyUp={onKeyUp}
                        max={50} />
                    <input type='password'
                        value={confirmNewPassword}
                        placeholder='Confirm Password'
                        onChange={(e) => {
                            const value = e.target.value;

                            setConfirmNewPassword(value);
                        }}
                        onKeyUp={onKeyUp}
                        max={50} />
                </>
            }

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>Not Empty</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: passwordEmptyColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>1 Uppercase</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: hasUppercaseCharacterColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>1 Lowercase</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: hasLowercaseCharacterColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>1 Number</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: hasNumberCharacterColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>1 Special</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: hasSpecialCharacterColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>10 Characters</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: has10CharactersColor }}></FontAwesomeIcon>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #A020F0', borderRadius: '10px' }}>
                    <span style={{ alignSelf: 'center' }}>Passwords Match</span>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px', cursor: 'pointer', color: passwordsMatchColor }}></FontAwesomeIcon>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;