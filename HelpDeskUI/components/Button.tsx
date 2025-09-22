import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/styles/Button.css';

const Button = ({
    id,
    onClick,
    icon,
    value,
    title,
    disabled,
    color,
    animationName,
    animationDuration,
    animationIterationCount,
    animationTimingFunction,
    marginLeft,
    marginRight,
    width,
    fontSize,
    fontWeight,
    display,
    height,
    position,
    bottom
}: {
    id?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
    icon?: IconDefinition;
    value?: string;
    title?: string;
    disabled?: boolean;
    color?: string;
    animationName?: string;
    animationDuration?: string;
    animationIterationCount?: string;
    animationTimingFunction?: string;
    marginLeft?: string;
    marginRight?: string;
    width?: string;
    fontSize?: string;
    fontWeight?: string;
    display?: string;
    height?: string;
    position?: string;
    bottom?: string;
}) => {
    return (
        <button id={id}
            className='button'
            style={{
                alignSelf: 'center',
                width: icon ? '35px' : width ? width : undefined,
                height: icon ? '26px' : height ? height : undefined,
                display: display ? display : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color ? color : '#000000',
                animationName,
                animationDuration,
                animationIterationCount,
                animationTimingFunction,
                marginLeft,
                marginRight,
                fontSize,
                fontWeight,
                position: position ? 'absolute' : undefined,
                bottom
            }}
            title={title}
            onClick={(e) => {
                e.stopPropagation();

                if (onClick)
                    onClick(e);
            }}
            disabled={disabled}>
            {
                icon &&
                <FontAwesomeIcon icon={icon} style={{ fontSize: '16px', alignSelf: 'center' }} />
            }
            {
                value &&
                <span style={{ alignSelf: 'center' }}>{value}</span>
            }
        </button>
    );
};

export default Button;