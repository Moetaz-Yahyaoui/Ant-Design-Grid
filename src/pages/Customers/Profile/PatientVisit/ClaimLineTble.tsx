import * as React from "react";
import {
  Box,
  CircularProgress,
  styled,
  MenuItem,
  Typography,
  Chip,
  TextField,
  Autocomplete,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Modal from "@components/Modal/BasicModal";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { getAllCPTCode } from "~/repositories/CPTCode.servise";
import {
  Delete,
  Create,
  Modify,
} from "~/repositories/patVisitDiagnosis.servise";
import OutlinedInput from "@mui/material/OutlinedInput";
import { getAllModifiers } from "~/repositories/modifier.servise";
import { ReactComponent as EyeIcon } from "~/assets/icons/eye.svg";

const SaveButton = styled(LoadingButton)(
  ({ theme }) => `
      && {
        background: #282F6C;
        width:${theme.typography.pxToRem(111)};
        padding:${theme.typography.pxToRem(14)};
      }
  `
);

const defaultRow = [
  {
    id: self.crypto.randomUUID(),
    cptcodeid: "mock",
    // icdcodes: "",
    modifiers: "mock",
    units: "mock",
    pointers: "mock",
    patvisitid: "mock",
  },
];

const ClaimLineTable = ({
  claimLine,
  claimDiagnosis,
  patientVisitId,
  onEdit,
  onFetch,
}: {
  claimLine: any;
  claimDiagnosis: any;
  patientVisitId: any;
  onEdit: (claimLine: any) => void;
  onFetch: (pagination: any) => void;
}): JSX.Element => {
  const [rows, setRows] = React.useState<any[]>(claimLine);
  const [modifiers, setModifiers] = React.useState<any>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedID, setSelectedID] = React.useState<number>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isEditLoading, setIsEditLoading] = React.useState<boolean>(false);

  const CPTCodeService = React.useRef(getAllCPTCode);

  const handleAdd = React.useCallback(() => {
    setRows((prev: any) => {
      const filtred = prev?.filter((item: any) => item.cptcodeid !== "mock");
      return [
        ...filtred,
        {
          id: self.crypto.randomUUID(),
          cptcodeid: "",
          // icdcodes: "",
          modifiers: "",
          units: 1,
          pointers: "",
          patvisitid: patientVisitId,
        },
        {
          id: self.crypto.randomUUID(),
          cptcodeid: "mock",
          // icdcodes: "",
          modifiers: "mock",
          units: "mock",
          pointers: "mock",
          patvisitid: "mock",
        },
      ];
    });
  }, [patientVisitId]);

  React.useEffect(() => {
    setRows([
      ...claimLine,
      {
        id: self.crypto.randomUUID(),
        cptcodeid: "mock",
        // icdcodes: "",
        modifiers: "mock",
        units: "mock",
        pointers: "mock",
        patvisitid: "mock",
      },
    ]);
  }, [claimLine]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = React.useMemo(() => {
    return {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };
  }, []);

  const modifiersService = React.useRef(getAllModifiers);

  const fetchModifiers = React.useCallback(
    async (pagination: any) => {
      await modifiersService.current(pagination).then(
        (response: any) => {
          setModifiers(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [modifiersService, setModifiers]
  );

  React.useEffect(() => {
    fetchModifiers({
      page: 0,
      limit: 50,
    });
  }, [fetchModifiers]);

  const handleChangeField = React.useCallback(
    (id: any, field: string, newValue: string, index: number) => {
      const changedRow = rows?.filter((row: any) => row?.id === id);
      const newRow = changedRow[0];
      if (
        rows?.length === index &&
        newRow.cptcodeid === "" &&
        // newRow.icdcodes === "" &&
        newRow.modifiers === ""
      ) {
        handleAdd();
      }
      newRow[`${field}`] = newValue;
      setRows((prev: any) => {
        const temp = prev?.map((item: any) => {
          if (item.id === id) {
            return newRow;
          } else {
            return item;
          }
        });
        return temp;
      });
    },
    [rows, handleAdd]
  );

  const handleClickOpen = React.useCallback(
    (id: any) => {
      setSelectedID(id);
      setOpen(true);
    },
    [setSelectedID, setOpen]
  );

  const handleAction = React.useCallback(async () => {
    if (typeof selectedID === "string") {
      setIsDeleting(true);
      setRows((prev: any) =>
        prev.filter((item: any) => item.id !== selectedID)
      );
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      await Delete(selectedID as number).then(
        async () => {
          setOpen(false);
          onFetch({
            page: 0,
            limit: 50,
          });
        },
        (error: any) => {
          console.log("error", error);
        }
      );
      setIsDeleting(false);
    }
  }, [selectedID, setOpen, onFetch]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const defaultClaimArray = React.useCallback((array: string) => {
    const newArray = array !== "" ? array?.split(",") : [];

    const idArray = newArray?.map((item: string) => parseInt(item));
    return idArray || [];
  }, []);

  const transformPontersArray = React.useCallback((array: string) => {
    const newArray = array !== "" ? array?.split(",") : [];

    return newArray || [];
  }, []);

  const handleSave = React.useCallback(async () => {
    rows?.map(async (row: any) => {
      if (typeof row.id === "string") {
        setIsEditLoading(true);
        await Create({
          patvisitid: patientVisitId,
          cptcodeid: `${row.cptcodeid}`,
          // icdcodesarr: defaultClaimArray(row.icdcodes),
          icdcodesarr: [],
          modifiersarr: defaultClaimArray(row.modifiers),
          pointersarr: transformPontersArray(row.pointers),
          units: row.units,
        }).then(
          async () => {
            onFetch({
              page: 0,
              limit: 50,
            });
          },
          (error: any) => {
            console.log("error", error);
          }
        );
        setIsEditLoading(false);
      } else {
        setIsEditLoading(true);
        await Modify(row.id, {
          patvisitid: row.patvisitid,
          cptcodeid: row.cptcodeid,
          // icdcodesarr: defaultClaimArray(row.icdcodes),
          icdcodesarr: [],
          modifiersarr: defaultClaimArray(row.modifiers),
          pointersarr: transformPontersArray(row.pointers),
          units: row.units,
        }).then(
          async () => {
            onFetch({
              page: 0,
              limit: 50,
            });
          },
          (error: any) => {
            console.log("error", error);
          }
        );
        setIsEditLoading(false);
      }
    });
  }, [onFetch, defaultClaimArray, transformPontersArray, rows, patientVisitId]);

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: "cptcodeid",
        headerName: "CPT/HCPCS",
        renderCell: (params: GridRenderCellParams<string>) => {
          const [searchString, setSearchString] = React.useState<string>("");
          const [cptCode, setCptCode] = React.useState<any>([]);

          const fetchCPTCode = React.useCallback(async () => {
            await CPTCodeService.current({
              page: 0,
              limit: 50,
              searchField: "id",
              searchValue: `${params.value}`,
            }).then(
              (response: any) => {
                setCptCode(response.data.data);
              },
              (error: any) => {
                console.log(error);
              }
            );
          }, [params.value]);

          React.useEffect(() => {
            fetchCPTCode();
          }, [fetchCPTCode]);

          const getOptionValue = React.useCallback(
            (value: string) => {
              const filtredCodes = cptCode?.filter(
                (code: any) => code.id == value
              );
              return filtredCodes?.length > 0 ? filtredCodes[0] : {};
            },
            [cptCode]
          );

          const handleSearch = React.useCallback(async (value: string) => {
            if (value?.length > 1) {
              setSearchString(value);
              await CPTCodeService.current({
                page: 0,
                limit: 50,
                searchField: "cptcode",
                searchValue: `${value}`,
              }).then(
                (response: any) => {
                  setCptCode(response.data.data);
                },
                (error: any) => {
                  console.log(error);
                }
              );
            }
          }, []);

          const index = params.api.getRowIndex(params.row.id) + 1;
          const handleChange = (value: any) => {
            // const {
            //   target: { value },
            // } = event;
            handleChangeField(params.id, params.field, value, index);
          };
          const CodeValue = React.useMemo(() => {
            const filtredCodes = cptCode?.filter(
              (code: any) => code.id == params.value
            );
            return filtredCodes?.length > 0
              ? (`${filtredCodes[0].cptcode}` as string)
              : "";
          }, [cptCode, params.value]);

          return (
            <>
              {params.value !== "mock" ? (
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  onKeyDown={event => event.stopPropagation()}
                  options={cptCode}
                  getOptionLabel={(option: any) =>
                    option.code || searchString || CodeValue
                  }
                  sx={{ width: 380 }}
                  isOptionEqualToValue={(option, value) =>
                    option.cptcode === value.cptcode
                  }
                  onChange={(event, value) => {
                    setSearchString(value?.cptcode);
                    handleChange(value.id);
                  }}
                  value={
                    searchString ||
                    CodeValue ||
                    (params.value && getOptionValue(params.value))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      onChange={ev => handleSearch(ev.target.value)}
                      size="small"
                      label=""
                    />
                  )}
                />
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="start"
                  p="5px"
                  gap="10px"
                  width="fit-content"
                  sx={{ cursor: "pointer" }}
                  onClick={handleAdd}
                >
                  <AddIcon />
                  <Typography>Add Line Item</Typography>
                </Box>
              )}
            </>
          );
        },
        width: 250,
        type: "number",
        align: "center",
        headerAlign: "center",
      },
      {
        field: "modifiers",
        headerName: "Modifiers",
        renderCell: (params: GridRenderCellParams<string>) => {
          const idArray = params?.value !== "" ? params?.value?.split(",") : [];
          const [personName, setPersonName] = React.useState<string[]>(
            idArray || []
          );
          const index = params.api.getRowIndex(params.row.id) + 1;
          const handleChange = (
            event: SelectChangeEvent<typeof personName>
          ) => {
            const {
              target: { value },
            } = event;

            typeof value !== "string"
              ? handleChangeField(params.id, params.field, value.join(), index)
              : handleChangeField(params.id, params.field, value, index);
            setPersonName((prev: string[]) => {
              // On autofill we get a stringified value.
              if (prev.length < 4) {
                return typeof value === "string" ? value.split(",") : value;
              } else {
                if (typeof value !== "string" && value?.length >= 4) {
                  return prev;
                } else if (typeof value !== "string") {
                  return value;
                } else {
                  return value.split(",");
                }
              }
            });
          };
          return (
            <>
              {params.value !== "mock" ? (
                <Select
                  labelId="demo-multiple-chip-label"
                  id="demo-multiple-chip"
                  multiple
                  fullWidth
                  size="small"
                  label=""
                  value={personName}
                  onChange={handleChange}
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Chip" />
                  }
                  renderValue={(selected: any) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected?.map((value: any) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {modifiers?.length > 0 &&
                    modifiers?.map((modifier: any) => (
                      <MenuItem
                        key={modifier?.id}
                        value={`${modifier?.id}`}
                        sx={{
                          cursor: `${
                            personName?.length < 4 ? "pointer" : "not-allowed"
                          }`,
                        }}
                      >
                        {modifier?.name}
                      </MenuItem>
                    ))}
                </Select>
              ) : null}
            </>
          );
        },
        width: 230,
        type: "number",
        align: "center",
        headerAlign: "center",
      },
      // {
      //   field: "icdcodes",
      //   headerName: "ICD-10 Codes",
      //   renderCell: (params: GridRenderCellParams<string>) => {
      //     const idArray = params?.value !== "" ? params?.value?.split(",") : [];
      //     const [personName, setPersonName] = React.useState<string[]>(
      //       idArray || []
      //     );
      //     const index = params.api.getRowIndex(params.row.id) + 1;
      //     const handleChange = (
      //       event: SelectChangeEvent<typeof personName>
      //     ) => {
      //       const {
      //         target: { value },
      //       } = event;
      //       typeof value !== "string"
      //         ? handleChangeField(params.id, params.field, value.join(), index)
      //         : handleChangeField(params.id, params.field, value, index);

      //       setPersonName((prev: string[]) => {
      //         // On autofill we get a stringified value.
      //         if (prev.length < 4) {
      //           return typeof value === "string" ? value.split(",") : value;
      //         } else {
      //           if (typeof value !== "string" && value?.length >= 4) {
      //             return prev;
      //           } else if (typeof value !== "string") {
      //             return value;
      //           } else {
      //             return value.split(",");
      //           }
      //         }
      //       });
      //     };
      //     return (
      //       <>
      //         <Select
      //           labelId="demo-multiple-chip-label"
      //           id="demo-multiple-chip"
      //           multiple
      //           fullWidth
      //           label=""
      //           size="small"
      //           defaultValue={idArray}
      //           onChange={handleChange}
      //           input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
      //           renderValue={(selected: any) => (
      //             <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      //               {selected?.map((value: any) => (
      //                 <Chip key={value} label={value} />
      //               ))}
      //             </Box>
      //           )}
      //           MenuProps={MenuProps}
      //         >
      //           {claimDiagnosis?.length > 0 &&
      //             claimDiagnosis?.map((icd: any) => (
      //               <MenuItem key={icd?.id} value={`${icd?.id}`}>
      //                 {icd?.description}
      //               </MenuItem>
      //             ))}
      //         </Select>
      //       </>
      //     );
      //   },
      //   width: 230,
      //   type: "number",
      //   align: "center",
      //   headerAlign: "center",
      // },
      {
        field: "pointers",
        headerName: "Pointers",
        renderCell: (params: GridRenderCellParams<string>) => {
          const idArray = params?.value !== "" ? params?.value?.split(",") : [];
          const [personName, setPersonName] = React.useState<string[]>(
            idArray || []
          );
          const index = params.api.getRowIndex(params.row.id) + 1;
          const handleChange = (
            event: SelectChangeEvent<typeof personName>
          ) => {
            const {
              target: { value },
            } = event;

            typeof value !== "string"
              ? handleChangeField(params.id, params.field, value.join(), index)
              : handleChangeField(params.id, params.field, value, index);
            setPersonName((prev: string[]) => {
              // On autofill we get a stringified value.
              if (prev.length < 4) {
                return typeof value === "string" ? value.split(",") : value;
              } else {
                if (typeof value !== "string" && value?.length >= 4) {
                  return prev;
                } else if (typeof value !== "string") {
                  return value;
                } else {
                  return value.split(",");
                }
              }
            });
          };
          return (
            <>
              {params.value !== "mock" ? (
                <Select
                  labelId="demo-multiple-chip-label"
                  id="demo-multiple-chip"
                  multiple
                  fullWidth
                  size="small"
                  label=""
                  value={personName}
                  onChange={handleChange}
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Chip" />
                  }
                  renderValue={(selected: any) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected?.map((value: any) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {["A", "B", "C", "D"].map((pointer: any) => (
                    <MenuItem
                      key={pointer}
                      value={pointer}
                      sx={{
                        cursor: `${
                          personName?.length < 4 ? "pointer" : "not-allowed"
                        }`,
                      }}
                    >
                      {pointer}
                    </MenuItem>
                  ))}
                </Select>
              ) : null}
            </>
          );
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "units",
        headerName: "Units",
        renderCell: (params: GridRenderCellParams<string>) => {
          const [personName, setPersonName] = React.useState<string>(
            params.value || ""
          );
          const index = params.api.getRowIndex(params.row.id) + 1;
          const handleChange = (event: any) => {
            const {
              target: { value },
            } = event;
            handleChangeField(params.id, params.field, value, index);
            setPersonName(value);
          };
          return (
            <>
              {params.value !== "mock" ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="20px"
                >
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    fullWidth
                    onChange={handleChange}
                    value={personName}
                  />
                </Box>
              ) : null}
            </>
          );
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "charge",
        headerName: "Charge",
        renderCell: (params: GridRenderCellParams<string>) => {
          const [cptCode, setCptCode] = React.useState<any>([]);

          const fetchCPTCode = React.useCallback(async () => {
            await CPTCodeService.current({
              page: 0,
              limit: 50,
              searchField: "id",
              searchValue: `${params.row.cptcodeid}`,
            }).then(
              (response: any) => {
                setCptCode(response.data.data);
              },
              (error: any) => {
                console.log(error);
              }
            );
          }, [params.row.cptcodeid]);

          React.useEffect(() => {
            fetchCPTCode();
          }, [fetchCPTCode]);

          const getCharge = React.useCallback(
            (value: string) => {
              const filtredCodes = cptCode?.filter(
                (code: any) => code.id == value
              );
              return (
                filtredCodes?.length > 0 && filtredCodes[0].nonfacilityamount
              );
            },
            [cptCode]
          );
          return params.row.cptcodeid !== "mock"
            ? `$ ${getCharge(params.row.cptcodeid)}`
            : null;
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "SubTotal",
        headerName: "Sub Total",
        valueGetter: (params: GridValueGetterParams) => {
          const [cptCode, setCptCode] = React.useState<any>([]);

          const fetchCPTCode = React.useCallback(async () => {
            await CPTCodeService.current({
              page: 0,
              limit: 50,
              searchField: "id",
              searchValue: `${params.row.cptcodeid}`,
            }).then(
              (response: any) => {
                setCptCode(response.data.data);
              },
              (error: any) => {
                console.log(error);
              }
            );
          }, [params.row.cptcodeid]);

          React.useEffect(() => {
            fetchCPTCode();
          }, [fetchCPTCode]);

          const getCharge = React.useCallback(
            (value: string) => {
              const filtredCodes = cptCode?.filter(
                (code: any) => code.id == value
              );
              return (
                filtredCodes?.length > 0 && filtredCodes[0].nonfacilityamount
              );
            },
            [cptCode]
          );
          return params.row.cptcodeid !== "mock"
            ? `$ ${params.row.units * getCharge(params.row.cptcodeid)}`
            : null;
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "Delete",
        headerName: "Delete",
        renderCell: (params: GridRenderCellParams<string>) => {
          return (
            <>
              {params.row.cptcodeid !== "mock" ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="20px"
                >
                  {isDeleting ? (
                    <CircularProgress size={24} disableShrink thickness={3} />
                  ) : (
                    <DeleteIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => handleClickOpen(params.row.id)}
                    />
                  )}
                </Box>
              ) : null}
            </>
          );
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "Details",
        headerName: "Details",
        renderCell: (params: GridRenderCellParams<string>) => {
          return (
            <>
              {params.row.cptcodeid !== "mock" ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="20px"
                >
                  <EyeIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => onEdit(params.row)}
                  />
                </Box>
              ) : null}
            </>
          );
        },
        width: 230,
        type: "number",
        sortable: false,
        align: "center",
        headerAlign: "center",
      },
    ],
    [
      onEdit,
      handleClickOpen,
      handleChangeField,
      isDeleting,
      MenuProps,
      modifiers,
      handleAdd,
    ]
  );

  return (
    <>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={"Delete Claim Line"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Box
        sx={{
          height: 550,
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "end",
          gap: "10px",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          onCellDoubleClick={params => onEdit(params.row)}
          pagination={undefined}
          pageSize={10}
          rowsPerPageOptions={[4]}
          disableSelectionOnClick
          rowHeight={60}
          sx={{ width: "100%" }}
          experimentalFeatures={{ newEditingApi: true }}
        />
        <Box>
          <SaveButton
            size="small"
            onClick={() => handleSave()}
            variant="contained"
            startIcon={
              isEditLoading ? (
                <CircularProgress
                  color="info"
                  size={20}
                  disableShrink
                  thickness={3}
                />
              ) : null
            }
          >
            Save
          </SaveButton>
        </Box>
      </Box>
    </>
  );
};

export default ClaimLineTable;
