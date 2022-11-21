import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useRef,
} from "react";
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
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";

import {
  MethodeType,
  IPropsproductForm,
  IDefaultValuesProducts as IDefaultValues,
} from "~/types";
import {
  FormInput,
  FormProvider,
  RHFTextField,
  RHSelectDropDown,
} from "@components/hook-form";
import { Create, Modify } from "~/repositories/patientInsurance.servise";
import { useParams } from "react-router";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import { getAllStates } from "~/repositories/state.service";
import dayjs from "dayjs";

enum InputType {
  TextField = "textField",
  Select = "select",
  Date = "date",
}

interface InsuranceForm {
  d?: string;
  insurancename: string;
  email: string;
  contactname: string;
  city: string;
  state: string;
  phone: string;
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

const FormInputList = [
  {
    name: "Admit",
    field: "Employer",
    type: InputType.Date,
  },
  {
    name: "Discharge",
    field: "copay",
    type: InputType.Date,
  },
];

const clasification = [
  { name: "Primary", id: 1 },
  { name: "Secondary", id: 2 },
  { name: "Triatiary", id: 3 },
];

const HospitalizationForm: FC<any> = ({
  insuranceId,
  patientInsurance,
  insurances,
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

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, []);

  const DEFAULT_VALUES: any = {
    insuranceid: null,
    classification: "",
    copay: "",
    policyholder: "",
    ploicynumber: "",
    groupname: "",
    groupnumber: "",
    effectivedate: "",
    terminationdate: "",
    deductibleamount: "",
    percentcoverage: "",
    deductiblemet: "",
    verifiedwith: "",
  };

  const RegisterSchema = Yup.object().shape({
    // city: Yup.string().required("city is required"),
    insuranceid: Yup.string().required("required"),
    classification: Yup.string().required("required"),
    copay: Yup.string().required("required"),
    policyholder: Yup.string().required("required"),
    ploicynumber: Yup.string().required("required"),
    groupname: Yup.string().required("required"),
    groupnumber: Yup.string().required("required"),
    effectivedate: Yup.string().required("required"),
    terminationdate: Yup.string().required("required"),
    deductibleamount: Yup.number().required("required"),
    percentcoverage: Yup.number().required("required"),
    deductiblemet: Yup.number().required("required"),
    verifiedwith: Yup.string().required("required"),
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
    if (patientInsurance) {
      resetAsyncForm(patientInsurance as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [patientInsurance]);

  const getInsuranceName = useCallback(
    (id: string) => {
      const filtred = insurances?.filter(
        (insurance: any) => insurance.id === id
      );
      return filtred[0].insurancename;
    },
    [insurances]
  );

  const getPolicy = useCallback((value: string) => {
    if (value === "true") {
      return true;
    } else {
      return false;
    }
  }, []);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (patientInsurance) {
        await Modify(insuranceId, {
          ...data,
          patientid: id,
          notepriorityid: null,
          insurancepayer: getInsuranceName(methods.getValues("insuranceid")),
          policyholder: getPolicy(methods.getValues("policyholder")),
        }).then(
          async () => {
            // onOpenMenu();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        await Create({
          ...data,
          patientid: id,
          notepriorityid: null,
          insurancepayer: getInsuranceName(methods.getValues("insuranceid")),
          policyholder: getPolicy(methods.getValues("policyholder")),
        }).then(
          async () => {
            // onOpenMenu();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [
      id,
      getPolicy,
      insuranceId,
      handleOpen,
      Modify,
      Create,
      onFetchData,
      getInsuranceName,
      methods,
    ]
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
        <Box sx={{ pb: 0 }} display="flex" gap="10px">
          <Box
            sx={{ pb: 0 }}
            display="flex"
            flexDirection="column"
            width="100%"
          >
            {FormInputList.map((field, index) => (
              <Box key={index} p={1} display="flex !important">
                <StyledInput
                  key={index}
                  name={field.field}
                  label={field.name}
                  type="date"
                  inputProps={{ max: "2999-12-31" }}
                  InputLabelProps={{ shrink: true }}
                  // value={dayjs(methods.getValues("dateofbirth"))}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default HospitalizationForm;
