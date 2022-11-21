import {
  styled,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import update from "immutability-helper";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@components/Modal/BasicModal";
import {
  Create as CreatePatVisitDiagnosis,
  Modify as ModifyPatVisitDiagnosis,
  Delete,
} from "~/repositories/patVisitClaimDiagnosis.servise";

import { Card } from "./DragableTable/card";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SaveButton } from "../../AddCustomers/AddForm";
import APIAutoComplete from "./AutoComplete";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  openAlert: boolean;
}

interface Item {
  id: string | number;
  sortorder: number;
  icdcodeid: number;
  patvisitid: number;
  description: string;
}

const ClaimDiagnosisTable = ({
  visitClaimDiagnosis,
  claimLine,
  onFetch,
}: {
  visitClaimDiagnosis?: any;
  claimLine?: any[];
  onFetch: (pagination: any) => void;
}): JSX.Element => {
  const [state, setState] = useState<State>({
    openAlert: false,
    vertical: "top",
    horizontal: "right",
  });
  const [cards, setCards] = useState<Item[]>(visitClaimDiagnosis);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<number>();
  const [patVisitId, setPatVisitId] = useState<string>("");
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);

  const { vertical, horizontal, openAlert } = state;

  const usedPointers = useMemo(() => {
    const pointersArrays = claimLine?.flatMap((item: any) => {
      const idArray = item?.pointers !== "" ? item?.pointers?.split(",") : [];
      return idArray;
    });
    const unique = pointersArrays?.filter((v, i, a) => a.indexOf(v) === i);
    const indexArray: any[] = [];
    unique?.map((item: any) =>
      item === "A"
        ? indexArray.push(0)
        : item === "B"
        ? indexArray.push(1)
        : item === "C"
        ? indexArray.push(2)
        : indexArray.push(3)
    );
    return indexArray;
  }, [claimLine]);

  useEffect(() => {
    setCards(visitClaimDiagnosis);
  }, [setCards, visitClaimDiagnosis]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("visitId")) {
      const name = searchParams.get("visitId");
      name && setPatVisitId(name);
    }
  }, [setPatVisitId]);

  const handleCloseAlert = () => {
    setState({ ...state, openAlert: false });
  };

  const handleOpenAlert = useCallback(() => {
    setState({ ...state, openAlert: true });
  }, [state]);

  const handleClickOpen = useCallback(
    (id: any, index: number) => {
      if (usedPointers?.includes(index)) {
        handleOpenAlert();
      } else {
        setSelectedID(id);
        setOpen(true);
      }
    },
    [setSelectedID, setOpen, usedPointers, handleOpenAlert]
  );

  const handleAction = useCallback(async () => {
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
  }, [selectedID, setOpen, onFetch]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards((prevCards: Item[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as Item],
        ],
      })
    );
  }, []);

  const handleAddLine = useCallback(() => {
    const newRow: Item = {
      id: self.crypto.randomUUID(),
      description: "",
      sortorder: cards?.length + 1 || 1,
      patvisitid: parseInt(patVisitId),
      icdcodeid: 0,
    };
    setCards(prev => [...prev, newRow]);
  }, [cards?.length, patVisitId]);

  const handleEditRow = useCallback(
    (
      id: string,
      codeid: string,
      claimDiagnosis: any,
      description: string,
      index: number
    ) => {
      const newRow = {
        id: id,
        // description: getDescriptionValue(codeid),
        description: description,
        sortorder: parseInt(claimDiagnosis.sortorder),
        patvisitid: parseInt(claimDiagnosis.patvisitid),
        icdcodeid: parseInt(codeid),
      } as Item;
      setCards(prev =>
        prev.map((item, i) => {
          if (i === index) {
            return newRow;
          } else {
            return item;
          }
        })
      );
    },
    []
  );

  const handleSave = useCallback(async () => {
    cards?.map(async (row: any, index: number) => {
      if (typeof row.id === "string") {
        setIsEditLoading(true);
        await CreatePatVisitDiagnosis({ ...row, sortorder: index + 1 }).then(
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
        await ModifyPatVisitDiagnosis(row.id, {
          ...row,
          sortorder: index + 1,
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
  }, [onFetch, cards]);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openAlert}
        onClose={handleCloseAlert}
        key={vertical + horizontal}
      >
        <Alert severity="error">This Line is Used In Claim Line Grid</Alert>
      </Snackbar>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={"Delete Claim Diagnosis"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Box display="flex" flexDirection="column" gap="10px">
        <Box pt={1} display="flex" flexDirection="column" alignItems="end">
          <Grid
            container
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="space-between"
            border="1px solid #2233541a"
            width="100%"
            gap="3px"
          >
            <Box
              sx={{ background: "#E1E3F1" }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              height="24px"
              width="100%"
              gap="5px"
            >
              <Box
                width="10%"
                borderRight="1px solid #FFF"
                display="flex"
                alignItems="center"
                height="100%"
              />
              <Text
                width="20%"
                borderRight="1px solid #FFF"
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                Code
              </Text>
              <Text
                width="60%"
                borderRight="1px solid #FFF"
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                Description
              </Text>
              <Text
                width="10%"
                borderRight="1px solid #FFF"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                Actions
              </Text>
            </Box>
            <DndProvider backend={HTML5Backend}>
              <>
                {cards?.length > 0 ? (
                  <>
                    {cards?.map((claim: any, index: number) => {
                      return (
                        <Card
                          key={claim.id}
                          index={index}
                          id={claim.id}
                          moveCard={moveCard}
                          onFetch={onFetch}
                        >
                          <APIAutoComplete
                            claim={claim}
                            index={index}
                            handleClickOpen={handleClickOpen}
                            handleEditRow={handleEditRow}
                          />
                        </Card>
                      );
                    })}
                    <Box
                      sx={{
                        border: "1px dashed gray",
                        backgroundColor: "white",
                        cursor: "move",
                      }}
                    >
                      <Box
                        sx={{ cursor: "pointer" }}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        height="45px"
                        width="100%"
                        gap="5px"
                      >
                        <Text
                          width="10%"
                          borderRight="1px solid #2233541a"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          height="100%"
                        >
                          <AddIcon onClick={handleAddLine} />
                        </Text>
                        <Text
                          width="20%"
                          borderRight="1px solid #2233541a"
                          display="flex"
                          alignItems="center"
                          height="100%"
                        ></Text>
                        <Text
                          width="60%"
                          borderRight="1px solid #2233541a"
                          display="flex"
                          alignItems="center"
                          height="100%"
                        ></Text>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          gap="10px"
                          width="10%"
                          height="100%"
                          borderRight="1px solid #2233541a"
                        ></Box>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      border: "1px dashed gray",
                      backgroundColor: "white",
                      cursor: "move",
                    }}
                  >
                    <Box
                      sx={{ cursor: "pointer" }}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      height="45px"
                      width="100%"
                      gap="5px"
                    >
                      <Text
                        width="10%"
                        borderRight="1px solid #2233541a"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                      >
                        <AddIcon onClick={handleAddLine} />
                      </Text>
                      <Text
                        width="20%"
                        borderRight="1px solid #2233541a"
                        display="flex"
                        alignItems="center"
                        height="100%"
                      ></Text>
                      <Text
                        width="60%"
                        borderRight="1px solid #2233541a"
                        display="flex"
                        alignItems="center"
                        height="100%"
                      ></Text>
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap="10px"
                        width="10%"
                        height="100%"
                        borderRight="1px solid #2233541a"
                      ></Box>
                    </Box>
                  </Box>
                )}
              </>
            </DndProvider>
          </Grid>
        </Box>
        <Box display="flex" justifyContent="end">
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

const Text = styled(Typography)(
  () => `
        && {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 14px;
        }
    `
);

export default ClaimDiagnosisTable;
