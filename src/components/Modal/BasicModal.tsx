import { FC, useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  styled,
  Box,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface IResponsiveDialog {
  handleClose: () => void;
  handleAction: () => void;
  open: boolean;
  title: string;
  confirmText?: string;
  contentText: string;
}

const ResponsiveDialog: FC<IResponsiveDialog> = ({
  handleClose,
  handleAction,
  open,
  title,
  confirmText,
  contentText,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleConfirme = useCallback(() => {
    handleAction();
    handleClose();
    setConfirmOpen(false);
  }, [handleAction, setConfirmOpen, handleClose]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        maxWidth="sm"
        fullWidth={true}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        sx={{ borderRadius: "8px" }}
      >
        <StyledBox></StyledBox>
        <Box display="flex" alignItems="center" p="15px">
          <Box component="img" src="/static/image/warning.png" />
          <Box>
            <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
            <DialogContent>
              <DialogContentText>{contentText}</DialogContentText>
            </DialogContent>
          </Box>
        </Box>
        <Divider />
        <DialogActions>
          <Button onClick={() => setConfirmOpen(true)} autoFocus>
            Confirm
          </Button>
          <Button autoFocus onClick={handleClose}>
            Cancel
          </Button>
          <Dialog
            fullScreen={fullScreen}
            open={confirmOpen}
            maxWidth="sm"
            fullWidth={false}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogContent>
              <DialogContentText>{confirmText}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleConfirme} autoFocus>
                Yes
              </Button>
              <Button autoFocus onClick={() => setConfirmOpen(false)}>
                No
              </Button>
            </DialogActions>
          </Dialog>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const StyledBox = styled("div")(
  () => `
    && {
      width: 100%;
      height: 20px;
      background: #FFCE1B;
    }
`
);

export default ResponsiveDialog;
