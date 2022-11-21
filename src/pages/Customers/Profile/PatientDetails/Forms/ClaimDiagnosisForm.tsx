import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useMemo,
  useRef,
} from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Divider,
  Box,
  styled,
  Snackbar,
  Typography,
  MenuItem,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { MethodeType } from "~/types";
import { FormInput, FormProvider } from "@components/hook-form";
import { getAllICD10Code } from "~/repositories/ICD10Code.servise";
import {
  Create as CreatePatVisitDiagnosis,
  Modify as ModifyPatVisitDiagnosis,
} from "~/repositories/patVisitClaimDiagnosis.servise";
import { useLocation } from "react-router";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import {
  CancelButton,
  SaveButton,
} from "~/pages/Customers/AddCustomers/AddForm";

enum InputType {
  TextField = "textField",
  Select = "select",
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

const StyledInput = styled(FormInput)(
  () => `
      && {
        background: #F9F9F9;
         textarea {
          height: 80px !important;
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

const StyledTitle = styled(Typography)(
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
  { name: "Code", field: "icdcodeid", type: InputType.Select },
  { name: "Description", field: "description", type: InputType.TextField },
];

const ClaimDiagnosisForm: FC<any> = ({
  claimDiagnosis,
  tableLength,
  pagination,
  onClose,
  onFetchData,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });
  const [icd10Code, setIcd10Code] = useState<any>([]);

  const [patVisitId, setPatVisitId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [codeId, setCodeId] = useState<number>(claimDiagnosis?.icdcodeid);

  const location = useLocation();

  const ICDCode10Service = useRef(getAllICD10Code);

  const fetchICD10Code = useCallback(
    async (pagination: any) => {
      await ICDCode10Service.current(pagination).then(
        (response: any) => {
          setIcd10Code(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [ICDCode10Service, setIcd10Code]
  );

  useEffect(() => {
    fetchICD10Code({
      page: 0,
      limit: 50,
    });
  }, [fetchICD10Code]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("visitId")) {
      const name = searchParams.get("visitId");
      name && setPatVisitId(name);
    }
  }, [location.search, setPatVisitId]);

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      icdcodeid: "",
      description: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    icdcodeid: Yup.string().required("Name is required"),
    description: Yup.string().required("Name is required"),
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

  const getDescription = useCallback(
    (value: string) => {
      const filtredCodes = icd10Code?.filter((code: any) => code.id == value);
      setCodeId(parseInt(value));
      filtredCodes?.length > 0 && setDescription(filtredCodes[0].description);
    },
    [icd10Code]
  );

  const resetAsyncForm = useCallback(
    async (data: any) => {
      reset({
        ...data,
        icdcodeid: codeId,
        description: description || claimDiagnosis?.description,
      });
    },
    [reset, codeId, description, claimDiagnosis]
  );

  useEffect(() => {
    if (claimDiagnosis) {
      resetAsyncForm(claimDiagnosis as unknown as any);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as any);
    }
  }, [claimDiagnosis, resetAsyncForm, DEFAULT_VALUES]);

  const onSubmit = useCallback(
    async (data: any) => {
      if (claimDiagnosis) {
        await ModifyPatVisitDiagnosis(claimDiagnosis.id, {
          description: data.description,
          sortorder: claimDiagnosis.sortorder,
          patvisitid: claimDiagnosis.patvisitid,
          icdcodeid: data.icdcodeid,
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
        await CreatePatVisitDiagnosis({
          description: data.description,
          sortorder: tableLength + 1,
          patvisitid: patVisitId,
          icdcodeid: data.icdcodeid,
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
      }
    },
    [
      onFetchData,
      onClose,
      handleOpen,
      patVisitId,
      tableLength,
      claimDiagnosis,
      pagination,
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
        <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="20px">
          {FormInputList.map((field, index) => (
            <Box key={index} display="flex" flexDirection="column" gap="5px">
              {field.type === InputType.Select ? (
                <>
                  <StyledTitle>Code</StyledTitle>
                  <StyledSelect
                    name={field.field}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => getDescription(e.target.value)}
                  >
                    {icd10Code.length > 0 &&
                      icd10Code?.map((code: any) => (
                        <MenuItem key={code?.id} value={code?.id}>
                          {code?.icdcode}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                </>
              ) : (
                <>
                  <StyledTitle>Description</StyledTitle>
                  <StyledInput
                    key={index}
                    readOnly
                    name={field.field}
                    placeholder={`${field.name}...`}
                  />
                </>
              )}
            </Box>
          ))}
        </Box>
        <Box>
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
              onClick={() => onClose()}
              size="large"
              type="reset"
              variant="contained"
            >
              Cancel
            </CancelButton>
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default ClaimDiagnosisForm;
