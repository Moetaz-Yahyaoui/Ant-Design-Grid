import { styled, Grid, Box, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import Modal from "@components/Modal/BasicModal";
import { ReactComponent as EditIcon } from "~/assets/icons/edit.svg";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { Delete } from "~/repositories/notes.service";

const NotesTable = ({
  filtredNotes,
  onFetch,
  onSelectNote,
}: {
  filtredNotes: any;
  onFetch: (pagination: any) => void;
  onSelectNote: (note?: any) => void;
}): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<number>();

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

  const handleClickOpen = useCallback(
    (id: any) => {
      setSelectedID(id);
      setOpen(true);
    },
    [setSelectedID, setOpen]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  return (
    <>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={"Delete Note"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Grid
        sx={{ p: 2 }}
        container
        spacing={2}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="space-between"
      >
        {filtredNotes?.map((field: any, index: number) => (
          <Box
            key={index}
            sx={{ p: 2 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="52px"
            border="1px solid #000"
            gap="5px"
            mt="5px"
          >
            <Text fontWeight="600">{field?.note}</Text>
            <Text>{field?.createdUtc}</Text>
            <Text>{field?.modifiedUtc}</Text>
            <Text fontWeight="600">{field?.createdBy}</Text>
            <Box display="flex" alignItems="center" gap="10px">
              <EditIcon
                style={{ cursor: "pointer" }}
                onClick={() => onSelectNote(field)}
              />
              <DeleteIcon
                style={{ cursor: "pointer" }}
                onClick={() => handleClickOpen(field?.id)}
              />
            </Box>
          </Box>
        ))}
      </Grid>
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

export default NotesTable;
