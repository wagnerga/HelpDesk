import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IColumn } from '@/components/Table';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ModelSortColumn } from '@/api-client';
import { sort } from '@/util/Common';

const TableHeaderRow = ({ columns, sortColumns, setSortColumns }: {
    columns: IColumn[];
    sortColumns?: ModelSortColumn[];
    setSortColumns?: React.Dispatch<React.SetStateAction<ModelSortColumn[]>>;
}) => {
    return (
        <tr>
            {
                columns.map(column => {
                    const sortColumn = sortColumns ? sortColumns.find(y => y.column === column.column) : undefined;

                    return (
                        <th key={`${column.dataName}`}
                            style={{
                                padding: '10px',
                                fontSize: '14px',
                                fontWeight: 'bolder',
                                cursor: 'pointer',
                                color: '#000000',
                                backgroundColor: '#FFFFFF',
                                borderLeft: column.dataName !== 'action' ? '1px solid #000000' : undefined,
                                borderBottom: '1px solid #000000'
                            }}
                            onClick={() => {
                                if (sortColumns && setSortColumns)
                                    sort({ sortColumns, column: { ...column, title: '' }, setSortColumns });
                            }}>
                            {column.value}
                            {
                                sortColumn &&
                                <span style={{ marginLeft: '10px' }}>
                                    {
                                        sortColumn.ascending ?
                                            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '14px', cursor: 'pointer' }} /> :
                                            <FontAwesomeIcon icon={faArrowDown} style={{ fontSize: '14px', cursor: 'pointer' }} />
                                    }
                                </span>
                            }
                        </th>
                    );
                })
            }
        </tr>
    );
};

export default TableHeaderRow;