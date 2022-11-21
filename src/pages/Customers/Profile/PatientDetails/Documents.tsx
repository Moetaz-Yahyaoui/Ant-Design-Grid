import { Box, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import Modal from "@components/Modal/BasicModal";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { Delete } from "~/repositories/patientDocument.service";

const DocumentsTable = ({
  documents,
  onFetch,
  onSelectDocument,
}: {
  documents?: any;
  onFetch: (pagination: any) => void;
  onSelectDocument: (document?: any) => void;
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
        title={"Delete Document"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Box sx={{ p: 2 }}>
        {documents?.map((item: any, index: number) => {
          const InsuranceForm = [
            { title: "Type", content: `${item?.documenttype}` },
            { title: "Create Date", content: `${item?.createdUtc}` },
            { title: "Description", content: `${item?.documentname}` },
            { title: "Amount", content: `${item?.contactphone}` },
          ];
          return (
            <Box
              key={index}
              display="-webkit-box"
              borderBottom="1px solid #000"
            >
              <Box
                sx={{ p: 2 }}
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                width="30%"
              >
                {InsuranceForm.map((field, index) => (
                  <Box key={index} display="flex" gap="8px">
                    <Typography fontSize="12px">{field?.title}</Typography>
                    <Typography fontSize="12px" fontWeight="600">
                      {field?.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="60%"
              >
                <InsertDriveFileIcon onClick={() => onSelectDocument(item)} />
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="10%"
              >
                <DeleteIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClickOpen(item?.id)}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default DocumentsTable;
