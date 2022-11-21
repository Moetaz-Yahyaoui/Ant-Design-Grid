import * as Yup from "yup";
import {
  FC,
  forwardRef,
  useCallback,
  useMemo,
  useEffect,
  useContext,
  useState,
} from "react";

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
  Typography,
  Divider,
  Snackbar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "~/contexts/authContext";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import Iconify from "@components/Iconify";
import { MethodeType, IDefaultValuesProducts as IDefaultValues } from "~/types";
import { FormProvider, RHFTextField } from "@components/hook-form";
import { Modify } from "~/repositories/user.service";
import SuspenseLoader from "../SuspenseLoader";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  openAlert: boolean;
}

interface IResponsiveDialog {
  open: boolean;
  onClose: () => void;
}

const PasswordModal: FC<IResponsiveDialog> = ({ open, onClose }) => {
  const [state, setState] = useState<State>({
    openAlert: false,
    vertical: "top",
    horizontal: "right",
  });

  const { vertical, horizontal, openAlert } = state;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      newPassword: "",
      confirmPassword: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    newPassword: Yup.string().required("Password Is Required"),
    confirmPassword: Yup.string().required("Password Is Required"),
  });

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    reset(DEFAULT_VALUES as unknown as IDefaultValues);
  }, [reset, DEFAULT_VALUES]);

  const { user } = useContext(AuthContext);

  const handleCloseAlert = () => {
    setState({ ...state, openAlert: false });
  };

  const handleOpenAlert = useCallback(() => {
    setState({ ...state, openAlert: true });
  }, [state]);

  const confirmPassword = methods.watch("confirmPassword");

  const onSubmit = useCallback(
    async (data: any) => {
      if (confirmPassword === data.newPassword) {
        await Modify({
          newPassword: data.newPassword,
          id: user.id,
        }).then(
          async () => {
            handleOpenAlert();
            onClose();
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        methods.setError("newPassword", { message: "Passwords Don't Match" });
        methods.setError("confirmPassword", {
          message: "Passwords Don't Match",
        });
      }
    },
    [user, methods, confirmPassword, handleOpenAlert, onClose]
  );

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openAlert}
        onClose={handleCloseAlert}
        key={vertical + horizontal}
      >
        <Alert severity="success">New Password Saved!</Alert>
      </Snackbar>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        maxWidth="sm"
        fullWidth={true}
        // onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        sx={{ borderRadius: "8px" }}
      >
        <FormProvider
          methods={methods as unknown as MethodeType}
          onSubmit={handleSubmit(onSubmit)}
        >
          <StyledBox />
          <Box display="flex" alignItems="center" p="15px">
            <Box>
              <DialogTitle id="responsive-dialog-title">
                User Details
              </DialogTitle>
              <Box display="flex" gap="60px" px="25px">
                <Box display="flex" alignItems="center" gap="5px">
                  <Typography variant="h6">First Name :</Typography>
                  <Typography>{user?.firstname}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap="5px">
                  <Typography variant="h6">Last Name :</Typography>
                  <Typography>{user?.lastname}</Typography>
                </Box>
              </Box>
              <DialogContent>
                <Box py={1}>
                  {isSubmitting ? (
                    <SuspenseLoader />
                  ) : (
                    <Box display="flex" flexDirection="column" gap="10px">
                      <RHFTextField
                        name="newPassword"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                <Iconify
                                  icon={
                                    showPassword
                                      ? "eva:eye-fill"
                                      : "eva:eye-off-fill"
                                  }
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <RHFTextField
                        name="confirmPassword"
                        label="Confirm Password"
                        // onChange={e => setConfirmPassword(e.target.value)}
                        type={showConfirmPassword ? "text" : "password"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                <Iconify
                                  icon={
                                    showConfirmPassword
                                      ? "eva:eye-fill"
                                      : "eva:eye-off-fill"
                                  }
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <DialogContentText></DialogContentText>
              </DialogContent>
            </Box>
          </Box>
          <Divider />
          <DialogActions>
            <Button type="submit" autoFocus>
              Confirm
            </Button>
            <Button onClick={onClose} autoFocus>
              Cancel
            </Button>
          </DialogActions>
        </FormProvider>
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

export default PasswordModal;
