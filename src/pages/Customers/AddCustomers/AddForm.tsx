/* eslint-disable react-hooks/rules-of-hooks */
import * as Yup from "yup";
import * as React from "react";
import { IMaskInput } from "react-imask";
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
  MenuItem,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { FormProvider, FormInput } from "@components/hook-form";
import { IPagination, MethodeType } from "~/types";
import { Create, Modify } from "~/repositories/patients.servise";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { getAllStates } from "~/repositories/state.service";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import dayjs from "dayjs";

enum InputType {
  TextField = "textField",
  Select = "select",
  Date = "date",
  Phone = "phone",
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
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

const TextMaskCustom = React.forwardRef<HTMLElement, CustomProps>(
  function TextMaskCustom(props) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(+3) 000-000-0000"
        definitions={{
          "#": /[1-9]/,
        }}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

export const SaveButton = styled(LoadingButton)(
  ({ theme }) => `
    && {
      background: #282F6C;
      width:${theme.typography.pxToRem(111)};
      padding:${theme.typography.pxToRem(14)};
      &:hover {
        color: #000;
        background: #7d83c8;
      }
    }
`
);

export const CancelButton = styled(LoadingButton)(
  ({ theme }) => `
    && {
      background: #DADADA;
      border: 1px solid #DADADA;
      width:${theme.typography.pxToRem(111)};
      padding:${theme.typography.pxToRem(14)};
      &:hover {
        color: #000;
        background: #FFF;
        border: 1px solid #000;
      }
    }
`
);

export const StyledInput = styled(FormInput)(
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

export const StyledSelect = styled(FormSelect)(
  () => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
      }
  `
);

export const StyledLabel = styled(Typography)(
  () => `
      && {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        width: 102px;
      }
  `
);

const FormInputList = [
  { name: "Patient Name", field: "firstname", type: InputType.TextField },
  { name: "Midle Name", field: "middlename", type: InputType.TextField },
  { name: "Last Name", field: "lastname", type: InputType.TextField },
  { name: "Date Of Birth", field: "dateofbirth", type: InputType.Date },

  { name: "Address 1", field: "address1", type: InputType.TextField },
  { name: "Address 2", field: "address2", type: InputType.TextField },
  { name: "City", field: "city", type: InputType.TextField },
  { name: "State", field: "state", type: InputType.Select },
  { name: "SSN", field: "ssn", type: InputType.TextField },
  { name: "Suffix", field: "suffix", type: InputType.TextField },
  { name: "Zip", field: "zip", type: InputType.TextField },

  { name: "Phone Number", field: "patientnumber", type: InputType.Phone },
];
interface IDefaultValues {
  firstname: string;
  middlename: string;
  lastname: string;
  dateofbirth: string;
  address1: string;
  address2: string;
  patientnumber: string;
  city: string;
  state: string;
  ssn: string;
  suffix: string;
  zip: string;
}
const DEFAULT_VALUES: IDefaultValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  dateofbirth: "",
  address1: "",
  address2: "",
  patientnumber: "",
  city: "",
  state: "",
  ssn: "",
  suffix: "",
  zip: "",
};

interface IPropscompanyForm {
  patient: any | null;
  onOpenMenu: (record?: any) => void;
  onFetch: (pagination: IPagination) => void;
}

const companyForm: React.FC<IPropscompanyForm> = ({
  patient,
  onOpenMenu,
  onFetch,
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
      const states = StatesService.current(pagination);
      setStates(states);
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

  const RegisterSchema = Yup.object().shape({
    firstname: Yup.string().required("Name required"),
    middlename: Yup.string().required("Middle Name required"),
    lastname: Yup.string().required("Last Name required"),
    patientnumber: Yup.string()
      .min(10, "Must be more than 10 characters")
      .required("This field is requried"),

    // email: Yup.string()
    //   .email("Email must be a valid email address")
    //   .required("Email is required"),
    address1: Yup.string().required("address1 name required"),
    dateofbirth: Yup.date().required("Date of birth name required"),
    city: Yup.string().required("city name required"),
    state: Yup.string().required("state name required"),
    ssn: Yup.string().required("SSN required"),
    suffix: Yup.string().required("Suffix required"),
    zip: Yup.string().required("Zip required"),
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
    async (patient: IDefaultValues) => {
      reset(patient);
    },
    [reset]
  );

  React.useEffect(() => {
    if (patient) {
      resetAsyncForm({
        ...patient,
        dateofbirth: dayjs(patient.dateofbirth).format("YYYY-MM-DD"),
      } as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [patient, resetAsyncForm]);

  const onSubmit = React.useCallback(
    async (data: IDefaultValues) => {
      if (patient) {
        Modify(patient.id, data).then(
          () => {
            onFetch({
              page: 0,
              limit: 50,
            });
            handleOpen();
            onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      } else {
        await Create(data).then(
          () => {
            onFetch({
              page: 0,
              limit: 50,
            });
            handleOpen();
            onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      }
    },
    [patient, onOpenMenu, onFetch, handleOpen]
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
                <FormInput
                  key={index}
                  name={field.field}
                  label={field.name}
                  placeholder={`${field.name}...`}
                />
              ) : field.type === InputType.Date ? (
                <StyledInput
                  key={index}
                  name={field.field}
                  label={field.name}
                  type="date"
                  inputProps={{ max: "2999-12-31" }}
                />
              ) : field.type === InputType.Phone ? (
                <StyledInput
                  key={index}
                  name={field.field}
                  label={field.name}
                  inputComponent={TextMaskCustom as any}
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

export default companyForm;
