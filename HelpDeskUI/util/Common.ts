import { Column, ModelSortColumn } from '@/api-client';
import moment from 'moment-timezone';

export const Direction = {
    Column: 'Column',
    Row: 'Row'
};

export type Direction = typeof Direction[keyof typeof Direction];

export const getScrollbarWidth = () => {
    // Creating invisible container
    if (typeof document !== 'undefined') {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

        // Removing temporary elements from the DOM
        outer.parentNode?.removeChild(outer);

        return scrollbarWidth;
    }
    else
        return 0;
};

export const sort = ({ sortColumns, column, setSortColumns }:
    {
        sortColumns: ModelSortColumn[];
        column: {
            dataName: string;
            title: string;
            column?: Column;
        };
        setSortColumns: React.Dispatch<React.SetStateAction<ModelSortColumn[]>>;
    }) => {
    if (column.column) {
        const sortColumnIndex = sortColumns.findIndex(y => y.column === column.column);

        if (sortColumnIndex >= 0) {
            if (!sortColumns[sortColumnIndex].ascending) {
                const newSortColumns = sortColumns.map((y, i) => {
                    if (i === sortColumnIndex)
                        return { ...y, ascending: true };
                    else
                        return y;
                });

                setSortColumns(newSortColumns);

                return newSortColumns;
            }
            else {
                const newSortColumns = [...sortColumns.slice(0, sortColumnIndex), ...sortColumns.slice(sortColumnIndex + 1)];
                setSortColumns(newSortColumns);

                return newSortColumns;
            }
        }
        else {
            const newSortColumns = [...sortColumns, { ascending: false, column: column.column }];

            setSortColumns(newSortColumns);

            return newSortColumns;
        }
    }

    return undefined;
};

export const isMobile = ({ width, height }:
    {
        width: number;
        height: number;
    }) => {
    return !(width >= 420 && height >= 420);
};

export const doesElementFitInPopup = ({ windowWidth, windowHeight, elementWidth, elementHeight, isVerticalScrollbarVisible }:
    {
        windowWidth: number;
        windowHeight: number;
        elementWidth?: number;
        elementHeight?: number;
        isVerticalScrollbarVisible?: boolean;
    }) => {
    if (!elementWidth && !elementHeight)
        return true;

    if (elementWidth && elementHeight)
        return elementWidth + (isVerticalScrollbarVisible ? getScrollbarWidth() : 0) + 4 <= windowWidth && elementHeight + 36 <= windowHeight
};

export const dateFormat = 'YYYY-MM-DD';
export const timeFormat = 'hh:mm';
export const dateTimeFormat = ({ timeZone, date }: { timeZone: string; date: number; }) => moment(date).tz(timeZone).format(`${dateFormat} ${timeFormat} A`);
export const dateTimeWithSecondsFormat = ({ timeZone, date }: { timeZone: string; date: number; }) => moment(date).tz(timeZone).format(`${dateFormat} ${timeFormat}:ss A`);
export const intradayFormatTime = ({ timeZone, date }: { timeZone: string; date: Date; }) => moment(date).tz(timeZone).format(`${timeFormat}`);
export const intradayWeekFormatTime = ({ timeZone, date }: { timeZone: string; date: Date; }) => moment(date).tz(timeZone).format(`${dateFormat} ${timeFormat}`);
export const dayFormatTime = ({ timeZone, date }: { timeZone: string; date: Date; }) => moment(date).tz(timeZone).format(`${dateFormat} `);