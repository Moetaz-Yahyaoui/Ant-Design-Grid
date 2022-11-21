import { useState, forwardRef, useCallback, FC } from "react";
// @mui
import { Box, Snackbar, Button } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import DropZone from "react-dropzone";
import { useParams } from "react-router";
import { CancelButton } from "~/pages/Customers/AddCustomers/AddForm";
import { Create, Modify } from "~/repositories/patientDocument.service";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
}

const DocumentForm: FC<any> = ({
  document,
  pagination,
  onClose,
  onFetchData,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { id } = useParams();
  const { vertical, horizontal, open } = state;

  const handleClose = useCallback(() => {
    setState({ ...state, open: false });
  }, [state]);

  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
    console.log("state", state);
  }, [state]);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const formData: FormData = new FormData();

      formData.append("Attachment", file);
      formData.append("documenttype", file.type);
      formData.append("documentname", file.name);
      formData.append("notetype", file.type);
      id && formData.append("patientid", id);
      formData.append("claimid", "");
      if (document) {
        await Modify(document.id, formData).then(
          () => {
            onClose();
            handleOpen();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        await Create(formData).then(
          () => {
            onClose();
            handleOpen();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [onClose, handleOpen, document, onFetchData, pagination, id]
  );

  console.log("document", document);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        key={vertical + horizontal}
      >
        <Alert severity="success">Uploaded!</Alert>
      </Snackbar>
      <Box display="flex" justifyContent="end" padding="10px" gap="15px">
        <DropZone
          onDrop={handleDrop}
          maxFiles={1}
          multiple={false}
          accept={{
            "application/pdf-msword": [".pdf"],
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <Button
                variant="contained"
                component="label"
                sx={{ height: "100%" }}
              >
                {document ? document?.documentname : "Upload File"}
              </Button>
            </div>
          )}
        </DropZone>
        <CancelButton
          onClick={() => onClose()}
          size="large"
          type="reset"
          variant="contained"
        >
          Cancel
        </CancelButton>
      </Box>
    </>
  );
};

export default DocumentForm;
