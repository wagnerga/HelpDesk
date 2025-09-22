import { ICell } from '@/components/Table';

const TableBodyRow = ({ id, cells, handleClick }: {
    id: string;
    cells: ICell[];
    handleClick?: () => void;
}) => {
    return (
        <tr onClick={handleClick}>
            {
                cells.map(cell => {
                    const columnStyle = {
                        padding: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderLeft: '1px solid #000000',
                        borderBottom: '1px solid #000000',
                        color: cell.fontColor
                    };

                    if (typeof cell.value === 'string')
                        return (
                            <td key={`${cell.dataName}-${id}`}
                                style={{
                                    ...columnStyle,
                                    backgroundColor: cell.backgroundColor,
                                    textAlign: 'center'
                                }}>
                                {cell.value}
                            </td>
                        );
                    else
                        return (
                            <td key={`${cell.dataName}-${id}`}
                                style={{
                                    ...columnStyle,
                                    backgroundColor: cell.backgroundColor,
                                    textAlign: 'center'
                                }}>
                                {cell.value}
                            </td>
                        );
                })
            }
        </tr>
    );
};

export default TableBodyRow;