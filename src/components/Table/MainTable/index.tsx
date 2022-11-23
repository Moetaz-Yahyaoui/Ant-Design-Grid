import {
  FC,
  ChangeEvent,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import {
  Tooltip,
  Divider,
  Box,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  useTheme,
  styled,
} from "@mui/material";

import Label from "@components/Label";
import { ServiceStatus } from "~/types/patienTable";
import { IMainTable } from "~/types";
import BulkActions from "./BulkActions";
import { useNavigate } from "react-router-dom";
import Modal from "@components/Modal/BasicModal";

import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { ReactComponent as EditIcon } from "~/assets/icons/edit.svg";
import { ReactComponent as EyeIcon } from "~/assets/icons/eye.svg";

interface IPagination {
  page: number;
  limit: number;
}

interface RecentOrdersTableProps {
  title: string;
  className?: string;
  itemlist: IMainTable[];
  onDeleteItem: (id: number) => Promise<void>;
  pagination: IPagination;
  handleLimitChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePageChange: (event: any, newPage: number) => void;
  tableRowColumns: Array<string>;
  sharedData: Record<string, any>;
  totalRows: number;
  onOpenMenu: (record: any) => void;
}

interface Filters {
  status?: ServiceStatus | null;
  query?: string | undefined;
}

const getStatusLabel = (ServiceStatus: ServiceStatus): JSX.Element => {
  const map = {
    failed: {
      text: "Failed",
      color: "error",
    },
    completed: {
      text: "Completed",
      color: "success",
    },
    pending: {
      text: "Pending",
      color: "warning",
    },
  };

  const { text, color }: any = map[ServiceStatus];

  return <Label color={color}>{text}</Label>;
};

const CardStyled = styled(Card)(
  () => `
    && {
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: unset;
      border-radius:0;
    }
`
);

const applyFilters = (
  itemlist: IMainTable[],
  filters: Filters
): IMainTable[] => {
  return itemlist.filter(item => {
    let matches = true;
    const { status, query } = filters;

    if (
      status &&
      //item.status !== filters.status
      true
    ) {
      matches = false;
    }
    if (query) {
      matches = Object.keys(item).some(key => {
        return (
          item[key] &&
          item[key].toString().toLowerCase().indexOf(query.toLowerCase()) > -1
        );
      });
    }

    return matches;
  });
};

const applyPagination = (itemlist: IMainTable[]): IMainTable[] => {
  // return itemlist.slice(page * limit, page * limit + limit);
  return itemlist;
};

const RecentOrdersTable: FC<RecentOrdersTableProps> = ({
  title,
  itemlist,
  onDeleteItem,
  pagination,
  handleLimitChange,
  handlePageChange,
  tableRowColumns,
  sharedData,
  totalRows,
  onOpenMenu,
}) => {
  const [selectedItems, setItems] = useState<number[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<number>();
  const [filters, setFilters] = useState<Filters>({
    status: null,
    query: "",
  });

  const handleSelectAllItems = (event: ChangeEvent<HTMLInputElement>): void => {
    setItems(
      (event.target.checked ? itemlist.map(item => item.id) : []) as number[]
    );
  };

  const onHandleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setFilters(filters => ({ ...filters, query: event.target.value }));
  };

  const handleSelectOneItem = (
    event: ChangeEvent<HTMLInputElement>,
    ItemId: any
  ): void => {
    if (!selectedItems.includes(ItemId)) {
      setItems(prevSelected => [...prevSelected, ItemId]);
    } else {
      setItems(prevSelected => prevSelected.filter(id => id !== ItemId));
    }
  };

  const filteredItems = useMemo(
    () => applyFilters(itemlist, filters),
    [filters, itemlist]
  );

  const paginatedItems = applyPagination(filteredItems);

  const selectedSomeItems = useMemo(
    () => selectedItems.length > 0 && selectedItems.length < itemlist.length,
    [itemlist, selectedItems]
  );

  const selectedAllItems = useMemo(
    () => selectedItems.length === itemlist.length,
    [selectedItems, itemlist]
  );

  const theme = useTheme();

  const navigate = useNavigate();

  const handleClickOpen = useCallback(
    (id: any) => {
      setSelectedID(id);
      setOpen(true);
    },
    [setSelectedID, setOpen]
  );

  const handleAction = useCallback(async () => {
    await onDeleteItem(selectedID as number);
    setOpen(false);
  }, [selectedID, onDeleteItem, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const AddItemAction = useCallback((): void => {
    navigate(sharedData.addRoute);
  }, [navigate, sharedData.addRoute]);

  return (
    <CardStyled>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={`Delete ${title}`}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Box p={1}>
        <BulkActions
          title={sharedData.title}
          onOpenMenu={onOpenMenu}
          AddItemAction={AddItemAction}
          onHandleSearch={onHandleSearch}
        />
      </Box>
      <Divider />
      <TableContainer sx={{ overflowX: "scroll", height: "68vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAllItems}
                  indeterminate={selectedSomeItems}
                  onChange={handleSelectAllItems}
                />
              </TableCell>
              {tableRowColumns.map((value, index) => {
                return <TableCell key={index}>{value as ReactNode}</TableCell>;
              })}
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item, index) => {
              const isItemSelected = selectedItems.includes(item.id as number);
              return (
                <TableRow hover key={index} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneItem(event, item["id"])
                      }
                      value={isItemSelected}
                    />
                  </TableCell>
                  {tableRowColumns.map((key, index) => {
                    return (
                      <TableCell key={index}>
                        <Typography
                          variant="body1"
                          color="text.primary"
                          gutterBottom
                          noWrap
                        >
                          {item[key] as ReactNode}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    {Object.keys(item).filter(
                      key =>
                        item[`${key}`] === "" ||
                        item[`${key}`] === null ||
                        !item[`${key}`]
                    ).length > 0
                      ? getStatusLabel("pending")
                      : getStatusLabel("completed")}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Patient" arrow>
                      <IconButton
                        onClick={() => onOpenMenu(item)}
                        sx={{
                          "&:hover": {
                            background: theme.colors.primary.lighter,
                          },
                          color: theme.palette.primary.main,
                        }}
                        color="inherit"
                        size="small"
                      >
                        <EyeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Patient" arrow>
                      <IconButton
                        onClick={() => onOpenMenu(item)}
                        sx={{
                          "&:hover": {
                            background: theme.colors.primary.lighter,
                          },
                          color: theme.palette.primary.main,
                        }}
                        color="inherit"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      onClick={() => handleClickOpen(item["id"])}
                      title="Delete Item"
                      arrow
                    >
                      <IconButton
                        sx={{
                          "&:hover": { background: theme.colors.error.lighter },
                          color: theme.palette.error.main,
                        }}
                        color="inherit"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box>
        <TablePagination
          component="div"
          count={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={pagination.page}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[10, 50, 100, 500]}
          showFirstButton={true}
          showLastButton={true}
          labelDisplayedRows={({ page }) => {
            return `Page: ${page + 1}`;
          }}
          backIconButtonProps={{
            color: "secondary",
          }}
        />
      </Box>
    </CardStyled>
  );
};

RecentOrdersTable.propTypes = {
  itemlist: PropTypes.array.isRequired,
};

RecentOrdersTable.defaultProps = {
  itemlist: [],
};

export default RecentOrdersTable;
