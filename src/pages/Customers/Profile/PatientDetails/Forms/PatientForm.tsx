import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useRef,
} from "react";
import dayjs from "dayjs";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Divider, Box, styled, Snackbar, MenuItem } from "@mui/material";
// components
import { FormProvider, RHFTextField } from "@components/hook-form";
import { MethodeType } from "~/types";
import { Create, Modify } from "~/repositories/patients.servise";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { getAllStates } from "~/repositories/state.service";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import {
  CancelButton,
  SaveButton,
} from "~/pages/Customers/AddCustomers/AddForm";

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

const StyledInput = styled(RHFTextField)(
  () => `
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
  { name: "First Name", field: "firstname", type: InputType.TextField },
  { name: "Last Name", field: "lastname", type: InputType.TextField },
];

const Column2 = [
  { name: "Midle Name", field: "middlename", type: InputType.TextField },
];

const Column = [
  { name: "Address 1", field: "address1", type: InputType.TextField },
  { name: "Address 2", field: "address2", type: InputType.TextField },
];

const Column3 = [
  { name: "City", field: "city", type: InputType.TextField },
  { name: "State", field: "state", type: InputType.Select },
  { name: "Zip", field: "zip", type: InputType.TextField },
];

const Column4 = [
  { name: "Date Of Birth", field: "dateofbirth", type: InputType.Date },
  { name: "SSN", field: "ssn", type: InputType.TextField },
  { name: "Phone Number", field: "patientnumber", type: InputType.TextField },
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

interface PatientFormProps {
  patient: any | null;
  id?: string;
  onOpenMenu: (record?: any) => void;
  onFetch: (id: string) => void;
}

const PatientForm: FC<PatientFormProps> = ({
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

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const RegisterSchema = Yup.object().shape({
    firstname: Yup.string().required("Name required"),
    middlename: Yup.string().required("Middle Name required"),
    lastname: Yup.string().required("Last Name required"),
    patientnumber: Yup.string().required("phone number required"),
    address1: Yup.string().required("address1 name required"),
    address2: Yup.string().required("address1 name required"),
    dateofbirth: Yup.string().required("Date of birth name required"),
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
    [reset]
  );

  useEffect(() => {
    if (patient) {
      resetAsyncForm({
        ...patient,
        dateofbirth: dayjs(patient.dateofbirth).format("YYYY-MM-DD"),
      } as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [patient, resetAsyncForm]);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (patient) {
        Modify(patient.id, data).then(
          () => {
            handleOpen();
            id && onFetch(id);
            onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      } else {
        await Create({ ...data, suffix: "test" }).then(
          () => {
            handleOpen();
            id && onFetch(id);
            onOpenMenu();
          },
          error => {
            console.log("error", error);
          }
        );
      }
    },
    [patient, id, onOpenMenu, onFetch, handleOpen]
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
        <Box display="flex" flexDirection="column">
          <Box
            sx={{ pb: 1 }}
            display="flex"
            alignItems="baseline !important"
            gap="10px"
          >
            <Box
              sx={{ pb: 1 }}
              display="flex"
              flexDirection="column"
              gap="10px"
            >
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
                    <StyledInput
                      key={index}
                      name={field.field}
                      label={field.name}
                      type="date"
                      inputProps={{ max: "2999-12-31" }}
                    />
                  )}
                </Box>
              ))}
            </Box>
            <Box
              sx={{ pb: 1 }}
              display="flex"
              flexDirection="column"
              gap="10px"
            >
              {Column2.map((field, index) => (
                <Box key={index} display="flex !important" gap="59px">
                  {field.type === InputType.TextField ? (
                    <StyledInput
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
                  ) : (
                    <StyledSelect
                      label={field.name}
                      defaultValue={patient?.state}
                      name={field.field}
                    >
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
          </Box>
          <Box sx={{ pb: 1 }} display="flex" gap="5px">
            {Column.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                {field.type === InputType.TextField ? (
                  <StyledInput
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
                ) : (
                  <StyledSelect
                    label={field.name}
                    defaultValue={patient?.state}
                    name={field.field}
                  >
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
          <Box sx={{ pb: 1 }} display="flex" gap="5px">
            {Column3.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                {field.type === InputType.TextField ? (
                  <StyledInput
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
                ) : (
                  <StyledSelect
                    label={field.name}
                    defaultValue={patient?.state}
                    name={field.field}
                  >
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
          <Box sx={{ pb: 10 }} display="flex" flexDirection="column" gap="10px">
            {Column4.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                {field.type === InputType.TextField ? (
                  <StyledInput
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
                ) : (
                  <StyledSelect
                    label={field.name}
                    defaultValue={patient?.state}
                    name={field.field}
                  >
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
        </Box>
        <Divider />
        <Box
          display="flex !important"
          justifyContent="end"
          p="18px 0"
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

export default PatientForm;
