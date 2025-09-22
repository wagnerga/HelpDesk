import { Direction } from '@/util/Common';

const FieldWrapper = ({ title, direction, children, backgroundColor }: {
    title?: string;
    direction: Direction;
    children: React.ReactNode;
    backgroundColor?: string;
}) => {

    return (
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column', alignItems: 'flex-start' }}>
            {
                title &&
                <span style={{ fontWeight: 'bolder' }}>{title}</span>
            }
            <div style={{
                display: 'flex',
                flexDirection: direction === Direction.Row ? 'row' : 'column',
                padding: '10px',
                gap: '10px',
                border: '1px solid #A020F0',
                flexWrap: 'wrap',
                width: 'fit-content',
                borderRadius: '10px',
                backgroundColor
            }}>
                {children}
            </div>
        </div>
    );
};

export default FieldWrapper;