import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useMemo,
} from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Divider, Box, styled, Snackbar, MenuItem } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { MethodeType, IDefaultValuesProducts as IDefaultValues } from "~/types";
import { FormProvider, RHFTextField } from "@components/hook-form";
import { Create, Modify } from "~/repositories/patientInsurance.servise";
import { Create as createPatVisitInsurance } from "~/repositories/patVisitInsurance.servise";
import { useLocation, useParams } from "react-router";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import dayjs from "dayjs";
import {
  CancelButton,
  SaveButton,
} from "~/pages/Customers/AddCustomers/AddForm";

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

interface InsuranceFormProps {
  patientInsurance: any;
  insurances: any;
  filtredInsurances: any;
  pagination: any;
  onClose: () => void;
  onFetchData: (padination: any) => void;
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
        div {
          height: 39px;
        }
      }
  `
);

const FormInputList = [
  {
    name: "Insurance Payer",
    field: "insuranceid",
    type: InputType.Select,
  },
  {
    name: "Insurance Classification",
    field: "classification",
    type: InputType.Select,
  },
  { name: "Copay", field: "copay", type: InputType.TextField },
  { name: "Policy Holder", field: "policyholder", type: InputType.Select },
  { name: "Policy Number", field: "ploicynumber", type: InputType.TextField },
  { name: "Group Name", field: "groupname", type: InputType.TextField },
  { name: "Group Number", field: "groupnumber", type: InputType.TextField },
];

const column2 = [
  { name: "Efective Date", field: "effectivedate", type: InputType.Date },
  { name: "Termination Date", field: "terminationdate", type: InputType.Date },
  {
    name: "Deductible Amount",
    field: "deductibleamount",
    type: InputType.TextField,
  },
  {
    name: "Percent Coverage",
    field: "percentcoverage",
    type: InputType.TextField,
  },
  { name: "Deductible Met", field: "deductiblemet", type: InputType.TextField },
  { name: "Verified With", field: "verifiedwith", type: InputType.TextField },
];

const clasification = [
  { name: "Primary", id: 1 },
  { name: "Secondary", id: 2 },
  { name: "Triatiary", id: 3 },
];

const InsuranceForm: FC<InsuranceFormProps> = ({
  patientInsurance,
  insurances,
  filtredInsurances,
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
  const [patVisitId, setPatVisitId] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("visitId")) {
      const name = searchParams.get("visitId");
      name && setPatVisitId(name);
    }
  }, [location.search, setPatVisitId]);

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const getClassification = useMemo(() => {
    const length = filtredInsurances?.length;
    switch (length) {
      case 0:
        return patientInsurance?.classification || 1;
        break;
      case 1:
        return patientInsurance?.classification || 2;
        break;
      case 2:
        return patientInsurance?.classification || 3;
        break;
      default:
        return patientInsurance?.classification;
    }
  }, [filtredInsurances, patientInsurance]);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      insuranceid: "",
      classification: getClassification,
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
  }, [getClassification]);

  const RegisterSchema = Yup.object().shape({
    insuranceid: Yup.string().required("required"),
    classification: Yup.string().required("required"),
    copay: Yup.string().required("required"),
    policyholder: Yup.string().required("required"),
    ploicynumber: Yup.string().required("required"),
    groupname: Yup.string().required("required"),
    groupnumber: Yup.string().required("required"),
    effectivedate: Yup.string().required("required"),
    terminationdate: Yup.string().required("required"),
    deductibleamount: Yup.string().required("Number Required"),
    percentcoverage: Yup.string().required("Number Required"),
    deductiblemet: Yup.string().required("Number Required"),
    verifiedwith: Yup.string().required("required"),
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
      resetAsyncForm({
        ...patientInsurance,
        effectivedate: dayjs(patientInsurance.effectivedate).format(
          "YYYY-MM-DD"
        ),
        terminationdate: dayjs(patientInsurance.terminationdate).format(
          "YYYY-MM-DD"
        ),
      } as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [patientInsurance, resetAsyncForm, DEFAULT_VALUES]);

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
        await Modify(patientInsurance.id, {
          ...data,
          patientid: id,
          notepriorityid: null,
          insurancepayer: getInsuranceName(methods.getValues("insuranceid")),
          policyholder: getPolicy(methods.getValues("policyholder")),
        }).then(
          async () => {
            handleOpen();
            onClose();
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
          async response => {
            if (patVisitId) {
              await createPatVisitInsurance({
                patientinsuranceid: response.data.result.id,
                patientvisitid: patVisitId,
              }).then(
                async () => {
                  handleOpen();
                  onClose();
                  onFetchData(pagination);
                },
                (error: any) => {
                  console.log("error", error);
                }
              );
            } else {
              onClose();
              onFetchData(pagination);
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [
      id,
      pagination,
      patientInsurance,
      patVisitId,
      handleOpen,
      onClose,
      getPolicy,
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
        <Box
          sx={{ pb: 3 }}
          display="flex"
          alignItems="baseline !important"
          gap="10px"
        >
          <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="10px">
            {FormInputList.map((field, index) => (
              <Box key={index} display="flex !important" gap="59px">
                {field.type === InputType.TextField ? (
                  <StyledInput
                    key={index}
                    label={field.name}
                    name={field.field}
                  />
                ) : (
                  <Box display="flex" flexDirection="column">
                    {field.name === "Insurance Payer" ? (
                      <StyledSelect
                        name={field.field}
                        label={field.name}
                        InputLabelProps={{ shrink: true }}
                      >
                        {insurances.length > 0 &&
                          insurances?.map((insurance: any) => (
                            <MenuItem key={insurance?.id} value={insurance?.id}>
                              {insurance?.insurancename}
                            </MenuItem>
                          ))}
                      </StyledSelect>
                    ) : field.name === "Insurance Classification" ? (
                      <StyledSelect
                        value={getClassification}
                        disabled
                        name={field.field}
                        label={field.name}
                      >
                        {clasification?.map((item: any) => (
                          <MenuItem key={item?.name} value={item?.id}>
                            {item?.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    ) : (
                      <StyledSelect name={field.field} label={field.name}>
                        {["true", "false"].map((item, index) => (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="10px">
            {column2?.map((field, index) => (
              <>
                {field.type === InputType.TextField ? (
                  <StyledInput
                    key={index}
                    name={field.field}
                    label={field.name}
                  />
                ) : (
                  <StyledInput
                    key={index}
                    type="date"
                    inputProps={{ max: "2999-12-31" }}
                    label={field.name}
                    name={field.field}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </>
            ))}
          </Box>
        </Box>
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
            onClick={() => onClose()}
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

export default InsuranceForm;
