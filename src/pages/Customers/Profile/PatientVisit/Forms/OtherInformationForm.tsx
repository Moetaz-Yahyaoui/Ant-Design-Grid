import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useRef,
  useMemo,
} from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Box,
  styled,
  Snackbar,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { MethodeType, IDefaultValuesProducts as IDefaultValues } from "~/types";
import { FormInput, FormProvider, RHFTextField } from "@components/hook-form";
import { Create, Modify } from "~/repositories/patVisitOther.servise";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import { getAllStates } from "~/repositories/state.service";
import dayjs from "dayjs";

enum InputType {
  TextField = "textField",
  Select = "select",
  Date = "date",
  CHeckbox = "checkbox",
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
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

const StyledInput = styled(RHFTextField)(
  () => `
      && {
        // margin-top: 0;
        // width: 100%;
        background: #F9F9F9;
         input {
          // height: 5px !important;
        }
      }
  `
);

const StyledCheckbox = styled(FormInput)(
  () => `
      && {
        margin-top: 7px !important;
        width: 100%;
        background: #FFF;
        border: 0;
         input {
          height: 26px!important;
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

const StyledLabel = styled(Typography)(
  () => `
      && {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        
      }
  `
);

const FormInputList = [
  {
    name: "Prior Authorization Number",
    field: "priorauthorizationno",
    type: InputType.TextField,
  },
  {
    name: "Referral Number",
    field: "referralno",
    type: InputType.TextField,
  },
];

const Column = [
  {
    name: "Claim Frequancy",
    field: "claimfrequancy",
    type: InputType.TextField,
  },
  {
    name: "Oroginal Reference Number",
    field: "orignalreferenceno",
    type: InputType.TextField,
  },
];

const Column2 = [
  {
    name: "Hospital Admit Date",
    field: "hospitalizationadmin",
    type: InputType.Date,
  },
  {
    name: "Hospital Discharge Date",
    field: "hospitalizationdischarge",
    type: InputType.Date,
  },
];

const Column3 = [
  {
    name: "Unable To Work From",
    field: "unabletoworkfrom",
    type: InputType.Date,
  },
  {
    name: "Unable To Work To",
    field: "unabletoworkto",
    type: InputType.Date,
  },
];

const OtherInformationForm: FC<any> = ({
  information,
  patientVisit,
  patientVisitId,
  pagination,
  onFetchData,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = state;
  const [states, setStates] = useState<any>([]);
  const [description, setDescription] = useState<string>("");
  const [codeId, setCodeId] = useState<number>(
    parseInt(information?.otherclaimid)
  );
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

  const getDate = useCallback(
    (value: string) => {
      const filtredCodes = patientVisit?.filter(
        (code: any) => code.id == value
      );
      setCodeId(parseInt(value));
      filtredCodes?.length > 0 && setDescription(filtredCodes[0].visitdate);
    },
    [patientVisit]
  );

  useEffect(() => {
    setCodeId(parseInt(information?.otherclaimid));
  }, [information?.otherclaimid]);

  useEffect(() => {
    getDate(`${codeId}`);
  }, [codeId, getDate]);

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      patvisitid: patientVisitId,
      priorauthorizationno: "",
      referralno: "",
      claimfrequancy: "",
      orignalreferenceno: "",
      otherclaimid: "1",
      additionalclaiminfomation: false,
      employment: false,
      autoaccident: false,
      otheraccident: false,
      caseno: null,
      additionalclaiminfomationdes: null,
      state: null,
      release: null,
      unabletoworkfrom: "2022-10-28T22:48:40.838Z",
      unabletoworkto: "2022-10-28T22:48:40.838Z",
      hospitalizationadmin: "2022-10-28T22:48:40.838Z",
      hospitalizationdischarge: "2022-10-28T22:48:40.838Z",
    };
  }, [patientVisitId]);

  const RegisterSchema = Yup.object().shape({
    // city: Yup.string().required("city is required"),
    priorauthorizationno: Yup.string().required("required"),
    referralno: Yup.string().required("required"),
    claimfrequancy: Yup.string().required("required"),
    // state: Yup.string().required("State required"),
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
    async (insurance: IDefaultValues) => {
      reset(insurance);
    },
    [reset]
  );

  useEffect(() => {
    if (information) {
      resetAsyncForm({
        ...information,
        otherclaimid: `${codeId}`,
        unabletoworkfrom: dayjs(information.unabletoworkfrom).format(
          "YYYY-MM-DD"
        ),
        unabletoworkto: dayjs(information.unabletoworkto).format("YYYY-MM-DD"),
        hospitalizationadmin: dayjs(information.hospitalizationadmin).format(
          "YYYY-MM-DD"
        ),
        hospitalizationdischarge: dayjs(
          information.hospitalizationdischarge
        ).format("YYYY-MM-DD"),
      } as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [information, resetAsyncForm, DEFAULT_VALUES, codeId]);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (information) {
        await Modify(information.id, data).then(
          async () => {
            handleOpen();
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
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [information, onFetchData, pagination, handleOpen, patientVisitId]
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
        <Box sx={{ pb: 0 }} display="flex" alignItems="start" gap="10px">
          <Box
            sx={{ pb: 0 }}
            display="flex"
            // flexDirection="column"
            // alignItems="start"
            width="100%"
          >
            <Box display="flex !important" flexDirection="column" width="100%">
              {FormInputList.map((field, index) => (
                <Box
                  key={index}
                  p={1}
                  display="flex !important"
                  flexDirection="column"
                  width="100%"
                >
                  <StyledLabel>{field.name}</StyledLabel>
                  <StyledInput key={index} fullWidth name={field.field} />
                </Box>
              ))}
            </Box>
            <Box display="flex !important" flexDirection="column" width="100%">
              {Column.map((field, index) => (
                <Box
                  key={index}
                  p={1}
                  display="flex !important"
                  flexDirection="column"
                  width="100%"
                >
                  <StyledLabel>{field.name}</StyledLabel>
                  <StyledInput key={index} fullWidth name={field.field} />
                </Box>
              ))}
            </Box>
          </Box>
          <Divider orientation="vertical" sx={{ height: "158px" }} />
          <Box
            sx={{ pb: 0 }}
            display="flex"
            flexDirection="column"
            width="100%"
          >
            <Box sx={{ pb: 0 }} display="flex" width="100%">
              {Column3.map((field, index) => (
                <Box
                  key={index}
                  p={1}
                  display="flex !important"
                  flexDirection="column"
                  width="100%"
                >
                  <StyledLabel>{field.name}</StyledLabel>
                  <StyledInput
                    name={field.field}
                    type="date"
                    inputProps={{ max: "2999-12-31" }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              ))}
            </Box>
            <Box sx={{ pb: 0 }} display="flex" width="100%">
              {Column2.map((field, index) => (
                <Box
                  key={index}
                  p={1}
                  display="flex !important"
                  flexDirection="column"
                  width="100%"
                >
                  <StyledLabel>{field.name}</StyledLabel>
                  <StyledInput
                    name={field.field}
                    type="date"
                    inputProps={{ max: "2999-12-31" }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Box display="flex !important" justifyContent="end" p="10px" gap="15px">
          <SaveButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Save
          </SaveButton>
        </Box>
      </FormProvider>
    </>
  );
};

export default OtherInformationForm;
