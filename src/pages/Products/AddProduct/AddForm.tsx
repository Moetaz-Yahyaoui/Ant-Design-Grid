/* eslint-disable react-hooks/rules-of-hooks */
import * as Yup from "yup";
import * as React from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Grid,
  Divider,
  Box,
  styled,
  Snackbar,
  Typography,
  MenuItem,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import {
  MethodeType,
  IPropsproductForm,
  IDefaultValuesProducts as IDefaultValues,
} from "~/types";
import { FormInput, FormProvider } from "@components/hook-form";
import { Create, Modify } from "~/repositories/insurance.servise";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import { getAllStates } from "~/repositories/state.service";
import {
  CancelButton,
  SaveButton,
  StyledLabel,
} from "~/pages/Customers/AddCustomers/AddForm";

enum InputType {
  TextField = "textField",
  Select = "select",
}

interface InsuranceForm {
  id?: string;
  insurancename: string;
  email: string;
  adjustername: string;
  city: string;
  state: string;
  phone: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
}

const StyledInput = styled(FormInput)(
  () => `
      && {
        // margin-top: 0;
        // background: #F9F9F9;
         input {
          width: 93% !important;
        }
      }
  `
);

const StyledSelect = styled(FormSelect)(
  () => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
      }
  `
);

const FormInputList = [
  {
    name: "Insurance Company",
    field: "insurancename",
    type: InputType.TextField,
  },
  { name: "Adjuster", field: "adjustername", type: InputType.TextField },
  { name: "Address", field: "address", type: InputType.TextField },
  { name: "City", field: "city", type: InputType.TextField },
  { name: "State", field: "state", type: InputType.Select },
  { name: "Zip", field: "zip", type: InputType.TextField },
  { name: "Adjuster Phone No", field: "phone", type: InputType.TextField },
  { name: "Fax No", field: "fax", type: InputType.TextField },
  { name: "Email", field: "email", type: InputType.TextField },
];

const productForm: React.FC<IPropsproductForm> = ({
  id,
  insurance,
  pagination,
  onOpenMenu,
  onFetchData,
}) => {
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });

  const [states, setStates] = React.useState<any>([]);

  const StatesService = React.useRef(getAllStates);

  const fetchStates = React.useCallback(
    async (pagination: any) => {
      await StatesService.current(pagination).then(
        (response: any) => {
          setStates(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [StatesService]
  );

  React.useEffect(() => {
    fetchStates({
      page: 0,
      limit: 50,
    });
  }, [fetchStates]);

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = React.useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const DEFAULT_VALUES: InsuranceForm = React.useMemo(() => {
    return {
      insurancename: "",
      email: "",
      adjustername: "",
      city: "",
      state: "",
      phone: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    insurancename: Yup.string().required("Name is required"),
    email: Yup.string().required("Email is required"),
    adjustername: Yup.string().required("Contact name required"),
    city: Yup.string().required("city is required"),
    state: Yup.string().required("State required"),
    phone: Yup.string().required("Phone Number is required"),
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

  const resetAsyncForm = React.useCallback(
    async (insurance: IDefaultValues) => {
      reset(insurance);
    },
    [reset]
  );

  React.useEffect(() => {
    if (insurance) {
      resetAsyncForm(insurance as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [insurance, resetAsyncForm, DEFAULT_VALUES]);

  const onSubmit = React.useCallback(
    async (data: InsuranceForm) => {
      if (id) {
        Modify(id, data).then(
          async () => {
            handleOpen();
            onOpenMenu();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        await Create(data).then(
          async () => {
            handleOpen();
            onOpenMenu();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [id, onFetchData, onOpenMenu, handleOpen, pagination]
  );

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        key={vertical + horizontal}
      >
        <Alert severity="success">Saved!</Alert>
      </Snackbar>
      <FormProvider
        methods={methods as unknown as MethodeType}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid sx={{ pb: 3 }} container spacing={2}>
          {FormInputList.map((field, index) => (
            <Grid key={index} item>
              {field.type === InputType.TextField ? (
                <StyledInput
                  key={index}
                  name={field.field}
                  multiline={field.name === "Note" || field.name === "Action"}
                  label={field.name}
                  placeholder={`${field.name}...`}
                />
              ) : (
                <Box>
                  <StyledLabel>{field.name}</StyledLabel>
                  {field.name === "State" ? (
                    <StyledSelect
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {states.length > 0 &&
                        states?.map((state: any) => (
                          <MenuItem key={state?.zip} value={state?.state}>
                            {state?.state}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : (
                    <StyledSelect
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {states.length > 0 &&
                        states?.map((state: any) => (
                          <MenuItem key={state?.zip} value={state?.city}>
                            {state?.city}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  )}
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
        <Divider />
        <Box
          display="flex !important"
          p="18px 0"
          justifyContent="end"
          gap="15px"
        >
          <SaveButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Save
          </SaveButton>
          <CancelButton
            onClick={() => onOpenMenu()}
            size="large"
            type="reset"
            variant="contained"
          >
            Cancel
          </CancelButton>
        </Box>
      </FormProvider>
    </>
  );
};

export default productForm;
