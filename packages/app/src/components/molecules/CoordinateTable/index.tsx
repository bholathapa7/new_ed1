import { autobind } from 'core-decorators';
import * as _ from 'lodash-es';
import React, { ReactNode, MouseEventHandler, Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import styled, { CSSObject } from 'styled-components';

import RawDeleteRowSvg from '^/assets/icons/upload-popup/minus.svg';
import RawAddRowSvg from '^/assets/icons/upload-popup/plus.svg';
import { CancelButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import CoordinateTitleDropdown from '^/components/molecules/CoordinateTitleDropdown';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import Text from './text';


interface ErrorProps {
  hasError?: boolean;
}

const border: CSSObject = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.UploadPopup.tableBorderGray.toString(),
};

const Root = styled.div({
  position: 'relative',
});

const ReactDataSheetWrapper = styled.div<ErrorProps>(({ hasError }) => ({
  width: '100%',
  marginRight: '30px',

  border: hasError ? `1px solid ${palette.UploadPopup.error.toString()}` : undefined,
}));

const Table = styled.table({
  borderCollapse: 'collapse',

  width: 'calc(100% + 24px)',
  height: '100%',

  tableLayout: 'fixed',
});
const TableHead = styled.thead({
  '> tr > th:nth-child(1)': {
    width: '72px',
  },
  '> tr > th:nth-child(4)': {
    width: '60px',
  },
});
const TableHeadCell = styled.th({
  ...border,
  backgroundColor: palette.UploadPopup.itemBackgroundGray.toString(),

  fontWeight: 'normal',
  fontSize: '13px',
  color: dsPalette.title.toString(),

  verticalAlign: 'middle',
});
const TableHeadCellText = styled.span({
  marginLeft: '5px',
});
const TableHiddenHeadCell = styled.th({
  border: 'none',
  backgroundColor: 'transparent',
  width: '24px',
});

const TableBody = styled.tbody({});
const TableRow = styled.tr({
  ':hover': {
    '> td > svg': {
      visibility: 'visible',
    },
  },

  '> td:nth-child(1) > span, > td:nth-child(1) > input': {
    textAlign: 'left',
    paddingLeft: '6px',
  },
});

const TableCell = styled.td<ErrorProps>(({ hasError }) => ({
  ...border,
  padding: 0,

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: `${hasError ? palette.UploadPopup.error.alpha(0.15).toString() : palette.white.toString()} !important`,

  verticalAlign: 'top',

  '> span, > input': {
    border: 'none !important',
    padding: '0px',

    width: 'calc(100% - 9.5px) !important',
    height: '30.3px !important',

    lineHeight: '1.8 !important',
    color: hasError ? palette.UploadPopup.error.toString() : dsPalette.title.toString(),
    fontSize: '13px',

    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}));

const TableHiddenCell = styled.td({
  border: 'none',
  backgroundColor: 'transparent',
  verticalAlign: 'bottom',
});

const TableBottomWrapper = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',

  marginTop: '7.5px',
});

const ResetButtonAndLastTitle = styled.div({
  position: 'relative',

  width: '100%',

  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

const ResetButton = styled(CancelButton)({
  width: '66px',
  height: '34px',
  marginTop: '5px',

  fontWeight: 500,
  fontSize: '11px',
  color: dsPalette.title.toString(),

  ':disabled': {
    cursor: 'default',
  },
});

const AddRowIcon = styled(RawAddRowSvg)({
  cursor: 'pointer',

  position: 'absolute',
  left: 'calc(100% + 8px)',
});

const DeleteRowIcon = styled(RawDeleteRowSvg)({
  marginLeft: '7.5px',

  cursor: 'pointer',
  visibility: 'hidden',
});

export type RowValue = Array<string>;

const defaultRowNumber: number = 5;

export const getTableFilledRows: (rows: Array<Array<string>>) => Array<Array<string>> = (
  rows,
) => rows.filter((row) => _.reduce(row, (sum, col) => (sum + col.length), 0) !== 0);

const paddingRow: (rows: Array<RowValue>) => Array<RowValue> = (
  rows,
) => {
  const filledRows: Array<Array<string>> = getTableFilledRows(rows);
  const rowLength: number = rows.length;
  const filledRowLength: number = filledRows.length;

  let blankRowNeedToAdd: number = 0;
  if (rowLength < defaultRowNumber) {
    blankRowNeedToAdd = defaultRowNumber - rowLength;
  } else if (rowLength === filledRowLength) {
    blankRowNeedToAdd = 0;
  }
  const newRows: Array<RowValue> = [...rows];
  _.times(blankRowNeedToAdd, () => newRows.push(['', '', '', '']));

  return newRows;
};

export interface GridElement extends ReactDataSheet.Cell<GridElement, string> {
  value: string | null;
}

export interface Props {
  readonly coordinateSystem: T.CoordinateSystem;
  readonly isDisabled?: boolean;
  readonly titles: Array<string>;
  readonly disabledTitleIndexes?: Array<number>;
  readonly disabledRowIndexes?: Array<number>;
  readonly rows: Array<RowValue>;
  readonly errorRowIndexes?: Array<number>;
  readonly hasTableError?: boolean;
  onRowsChange(rows: Array<RowValue>): void;
  onTitlesChange(titles: Array<string>): void;
  onRowHover?(rowIndex?: number): void;
}

export interface State {
  rows: Array<RowValue>;
  selectingRowIndex?: number;
}

/**
 * @desc The editable table
 */
class CoordinateTable extends Component<Props & L10nProps, State> {
  public constructor(props: Props & L10nProps) {
    super(props);

    this.state = {
      rows: paddingRow(props.rows),
    };
  }

  public componentDidUpdate({ rows: prevRows }: Props): void {
    if (!_.isEqual(this.props.rows, prevRows)) {
      this.setState({
        rows: paddingRow(this.props.rows),
      });
    }
  }

  @autobind
  private clearAll(): void {
    const rows: Array<RowValue> = [];
    _.times(defaultRowNumber, () => rows.push(['', '', '', '']));
    this.setState({ rows });
    this.props.onRowsChange(rows);
  }

  @autobind
  private deleteRow(rowIndex: number): void {
    const { rows }: State = this.state;
    rows.splice(rowIndex, 1);
    this.setState({ rows });
    this.props.onRowsChange(rows);
  }

  @autobind
  private addRow(): void {
    const { rows }: State = this.state;
    rows.push(['', '', '', '']);
    this.setState({ rows });
  }

  @autobind
  private handleSelectCoordinate(index: number, coordinate: string): void {
    const { titles }: Props = this.props;

    titles[index] = coordinate;
    this.props.onTitlesChange(titles);
  }

  public render(): ReactNode {
    const { language }: L10nProps = this.props;

    const tableHeaders: ReactNode = this.props.titles.map((title, index) => this.props.disabledTitleIndexes?.includes(index) ? (
      <TableHeadCell key={index}>
        <TableHeadCellText>{title}</TableHeadCellText>
      </TableHeadCell>
    ) : (
      <TableHeadCell key={index}>
        <CoordinateTitleDropdown
          coordinateSystem={this.props.coordinateSystem}
          value={title}
          onSelect={_.partial(this.handleSelectCoordinate, index)}
        />
      </TableHeadCell>
    ));

    const data: Array<Array<{ value: string }>> = this.state.rows
      .map((rowValue) => rowValue.map((value) => ({ value })));
    const valueRenderer: (cell: any) => string = (cell) => cell.value;
    const sheetRenderer: ReactDataSheet.SheetRenderer<GridElement, string> = (props) => (
      <span className={'data-grid-container'}>
        <Table className={'data-grid'} data-testid='coordinatetable-table'>
          <TableHead>
            <TableRow>
              {tableHeaders}
              <TableHiddenHeadCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {props.children}
          </TableBody>
        </Table>
      </span>
    );
    const rowRenderer: ReactDataSheet.RowRenderer<GridElement, string> = (props) => {
      const onClick: () => void = () => this.deleteRow(props.row);

      return (
        <TableRow data-testid='coordinatetable-row'>
          {props.children}
          <TableHiddenCell>
            <DeleteRowIcon isDisabled={this.props.isDisabled} onClick={onClick} data-testid='coordinatetable-delete-row-icon' />
          </TableHiddenCell>
        </TableRow>
      );
    };
    const cellRenderer: ReactDataSheet.CellRenderer<GridElement, string> = (props) => {
      const {
        cell, row, col, attributesRenderer,
        selected, editing, updated, style, className,
        ...rest
      }: ReactDataSheet.CellRendererProps<GridElement, string> = props;

      cell.disableEvents = this.props.isDisabled;

      const handleMouseEnter: MouseEventHandler<HTMLElement> = () => {
        this.props.onRowHover?.(row);
      };

      const handleMouseLeave: MouseEventHandler<HTMLElement> = () => {
        this.props.onRowHover?.();
      };

      return (
        <TableCell
          {...rest}
          className={className}
          hasError={this.props.errorRowIndexes?.includes(row)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {props.children}
        </TableCell>
      );
    };

    const deleteLastEmptyElement: (array: any) => Array<object> = (array) => array.slice(-1)[0].value === '' ? array.slice(0, -1) : array;

    const onCellsChanged: (changes: any, additional: any) => void = (changes, additional) => {
      const editedChanges: Array<object> = Object.values(deleteLastEmptyElement(changes));

      editedChanges.forEach(({ row, col, value }: any) => {
        this.setState((prevState) => {
          const rows: RowValue[] = [...prevState.rows];
          rows[row][col] = value;

          return ({
            ...prevState,
            rows,
          });
        });
      });

      if (additional !== undefined) {
        const editedAdditional: Array<object> = Object.values(deleteLastEmptyElement(additional));
        const maxColumnNumber: number = 4;
        let rowCounter: number = -1;
        editedAdditional.forEach(({ row, col, value }: any) => {
          if (col >= maxColumnNumber) {
            return;
          }

          if (rowCounter !== row) {
            rowCounter = row;
            this.addRow();
          }
          this.setState((prevState) => {
            const rows: RowValue[] = [...prevState.rows];
            rows[row][col] = value;

            return ({
              ...prevState,
              rows,
            });
          });
        });
      }
      this.props.onRowsChange(this.state.rows);
    };

    return (
      <Root>
        <ReactDataSheetWrapper hasError={this.props.hasTableError}>
          <ReactDataSheet
            data={data}
            valueRenderer={valueRenderer}
            sheetRenderer={sheetRenderer}
            rowRenderer={rowRenderer}
            cellRenderer={cellRenderer}
            onCellsChanged={onCellsChanged}
            data-testid='coordinatetable-table'
          />
        </ReactDataSheetWrapper>
        <TableBottomWrapper>
          <ResetButtonAndLastTitle>
            <ResetButton disabled={this.props.isDisabled} onClick={this.clearAll} data-testid='coordinatetable-reset-button'>
              {l10n(Text.clearAll, language)}
            </ResetButton>
          </ResetButtonAndLastTitle>
          <AddRowIcon isDisabled={this.props.isDisabled} onClick={this.addRow} data-testid='coordinatetable-add-row-icon' />
        </TableBottomWrapper>
      </Root>
    );
  }
}

export default withL10n(CoordinateTable);
