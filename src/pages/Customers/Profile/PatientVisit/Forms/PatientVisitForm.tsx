import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useRef,
} from "react";
import dayjs, { Dayjs } from "dayjs";
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
  TextField,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { FormProvider, FormInput, RHFTextField } from "@components/hook-form";
import { IPagination, MethodeType } from "~/types";
import { Create, Modify } from "~/repositories/patients.servise";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import { getAllStates } from "~/repositories/state.service";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import { useParams } from "react-router";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
}

enum InputType {
  TextField = "textField",
  Select = "select",
  Date = "date",
}

const SaveButton = styled(LoadingButton)(
  ({ theme }) => `
    && {
      background: #282F6C;
      width:${theme.typography.pxToRem(111)};
      padding:${theme.typography.pxToRem(14)};
    }
`
);

const CancelButton = styled(LoadingButton)(
  ({ theme }) => `
    && {
      background: #DADADA;
      width:${theme.typography.pxToRem(111)};
      padding:${theme.typography.pxToRem(14)};
    }
`
);

const StyledInput = styled(RHFTextField)(
  ({ theme }) => `
      && {
        // margin-top: 0;
        background: #F9F9F9;
         input {
          // height: 5px !important;
        }
      }
  `
);

const StyledSelect = styled(FormSelect)(
  ({ theme }) => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
      }
  `
);

const FormInputList = [
  { name: "Patient Name", field: "firstname", type: InputType.TextField },
  { name: "Service Area", field: "middlename", type: InputType.Select },
  { name: "Provider", field: "lastname", type: InputType.Select },
];

const Column2 = [
  { name: "Refering Provider", field: "dateofbirth", type: InputType.Select },
  { name: "Ordering Provider", field: "address1", type: InputType.Select },
  {
    name: "Supervizing Provider",
    field: "address2",
    type: InputType.Select,
  },
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
  patient?: any | null;
  id?: string;
  onOpenMenu?: (record?: any) => void;
  onFetch?: (id: string) => void;
}

const PatientVisitForm: FC<IPropscompanyForm> = ({
  patient,
  id,
  onOpenMenu,
  onFetch,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });

  const [states, setStates] = useState<any>([]);
  const StatesService = useRef(getAllStates);

  const fetchStates = useCallback(
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

  useEffect(() => {
    fetchStates({
      page: 0,
      limit: 50,
    });
  }, [fetchStates]);

  const navigate = useNavigate();

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, []);

  const RegisterSchema = Yup.object().shape({
    firstname: Yup.string().required("Name required"),
    middlename: Yup.string().required("Middle Name required"),
    lastname: Yup.string().required("Last Name required"),
    patientnumber: Yup.string().required("phone number required"),
    address1: Yup.string().required("address1 name required"),
    address2: Yup.string().required("address1 name required"),
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

  const resetAsyncForm = useCallback(
    async (patient: IDefaultValues) => {
      reset(patient);
    },
    [reset, patient]
  );

  useEffect(() => {
    if (patient) {
      resetAsyncForm(patient as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [patient]);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (patient) {
        Modify(patient.id, data).then(
          () => {
            // id && onFetch(id);
            // onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      } else {
        await Create({ ...data, dateofbirth: new Date(), suffix: "test" }).then(
          () => {
            // id && onFetch(id);
            // onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      }
    },
    [patient, onOpenMenu, onFetch]
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
        <Box
          sx={{ pb: 0 }}
          display="flex"
          alignItems="baseline !important"
          p={2}
          gap="10px"
        >
          <Box display="flex" flexDirection="column" gap="10px" width="100%">
            {FormInputList.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                {field.type === InputType.TextField ? (
                  <StyledInput
                    key={index}
                    name={field.field}
                    label={field.name}
                    placeholder={`${field.name}...`}
                  />
                ) : (
                  <StyledSelect label={field.name} name={field.field}>
                    {states.length > 0 &&
                      states?.map((state: any) => (
                        <MenuItem key={state?.zip} value={state?.state}>
                          {state?.state}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                )}
              </Box>
            ))}
          </Box>
          <Box display="flex" flexDirection="column" gap="10px" width="100%">
            {Column2.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                <StyledSelect label={field.name} name={field.field}>
                  {states.length > 0 &&
                    states?.map((state: any) => (
                      <MenuItem key={state?.zip} value={state?.state}>
                        {state?.state}
                      </MenuItem>
                    ))}
                </StyledSelect>
              </Box>
            ))}
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default PatientVisitForm;
