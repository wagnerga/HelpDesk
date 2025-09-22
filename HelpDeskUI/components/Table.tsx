import { JSX } from 'react';
import NoData from '@/components/NoData';
import TableBodyRow from '@/components/TableBodyRow';
import Loader from '@/components/Loader';
import TableHeaderRow from '@/components/TableHeaderRow';
import { Column, ModelSortColumn } from '@/api-client';

export interface IRow {
    id: string;
    cells: ICell[];
    handleRowClick?: () => void;
};

export interface IColumn {
    dataName: string;
    column?: Column;
    value: string | JSX.Element;
    sortColumn?: ModelSortColumn;
};

export interface ICell {
    dataName: string;
    value: (string | JSX.Element);
    backgroundColor: string;
    fontColor: string;
};

const Table = ({ columns, rows, sortColumns, setSortColumns, showLoader }:
    {
        columns: IColumn[];
        rows: IRow[];
        sortColumns?: ModelSortColumn[];
        setSortColumns?: React.Dispatch<React.SetStateAction<ModelSortColumn[]>>;
        showLoader: boolean;
    }) => {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #FFFFFF', width: 'fit-content' }}>
            <table style={{ borderCollapse: 'collapse', borderTop: '1px solid #000000', borderRight: '1px solid #000000' }}>
                <thead>
                    <TableHeaderRow columns={columns} sortColumns={sortColumns} setSortColumns={setSortColumns} />
                </thead>
                <tbody>
                    {
                        rows.map(row => <TableBodyRow key={`row-${row.id}`} id={row.id} cells={row.cells} handleClick={row.handleRowClick} />)
                    }
                </tbody>
            </table>
            {
                !showLoader &&
                !rows?.length &&
                <div style={{ display: 'flex', padding: '20px' }}>
                    <NoData />
                </div>
            }
            {
                showLoader &&
                <div style={{
                    padding: '20px'
                }}>
                    <Loader />
                </div>
            }
        </div>
    );
};

export default Table;