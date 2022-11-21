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
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { Get } from "~/repositories/ICD10Code.servise";

import { MethodeType } from "~/types";
import { FormProvider } from "@components/hook-form";
import { Create, Modify } from "~/repositories/patVisitDiagnosis.servise";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import { getAllCPTCode } from "~/repositories/CPTCode.servise";
import { getAllModifiers } from "~/repositories/modifier.servise";

enum InputType {
  TextField = "textField",
  Select = "select",
}

enum SelectType {
  Modifier = "modifier",
  ICD = "ICD",
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

const PointersList: FC<any> = ({ id, index, codes }) => {
  const [icdCode, setIcdCod] = useState<string>("");

  const getICD10Code = useCallback(async () => {
    await Get(id).then(
      async response => {
        setIcdCod(response.data[0].icdcode);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }, [id]);

  useEffect(() => {
    getICD10Code();
  }, [getICD10Code]);

  return (
    <Typography>
      {`${index + 1} - ${icdCode} - ${codes[index].description} `}{" "}
    </Typography>
  );
};

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

const StyledMultiSelect = styled(TextField)(
  () => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
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
  { name: "code", field: "cptcodeid", type: InputType.Select },
];

const Column = [
  { name: "Description", field: "cptcodeid", type: InputType.Select },
];

const ClaimLineForm: FC<any> = ({
  claimDiagnosis,
  codes,
  patientVisitId,
  pagination,
  onFetch,
  onClose,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });

  const defaultClaimArray = useMemo(() => {
    const newArray = claimDiagnosis?.pointers?.split(",");
    const idArray = newArray?.map((item: string) => item);

    return idArray || [];
  }, [claimDiagnosis?.pointers]);

  const defaultModifiersArray = useMemo(() => {
    const newArray = claimDiagnosis?.modifiers?.split(",");
    const idArray = newArray?.map((item: string) => parseInt(item));
    return idArray || [];
  }, [claimDiagnosis?.modifiers]);

  const [modifiersArray, setModifiersArray] = useState<number[]>(
    defaultModifiersArray
  );
  const [claimDiagnosisArray, setClaimDiagnosisArray] =
    useState<number[]>(defaultClaimArray);
  const [claimCodes, setClaimCodes] = useState<any[]>(codes);
  const [cptCode, setCptCode] = useState<any>([]);
  const [modifiers, setModifiers] = useState<any>([]);

  const modifierTemp = useMemo(() => new Array<any>(), []);
  const claimTemp = useMemo(() => new Array<any>(), []);

  const CPTCodeService = useRef(getAllCPTCode);
  const modifiersService = useRef(getAllModifiers);

  const usedPointers = useMemo(() => {
    const pointersArrays =
      claimDiagnosis?.pointers !== ""
        ? claimDiagnosis?.pointers?.split(",")
        : [];
    const unique = pointersArrays?.filter(
      (v: any, i: any, a: any) => a.indexOf(v) === i
    );
    const indexArray: any[] = [];
    // unique?.indexOf((item: any) => item === "A") > -1 ? indexArray.push(1)
    unique?.map((item: any) =>
      item === "A"
        ? indexArray.push(0)
        : item === "B"
        ? indexArray.push(1)
        : item === "C"
        ? indexArray.push(2)
        : indexArray.push(3)
    );
    return indexArray;
  }, [claimDiagnosis]);

  useEffect(() => {
    setClaimCodes(codes);
  }, [codes]);

  const fetchCPTCode = useCallback(async () => {
    await CPTCodeService.current({
      page: 0,
      limit: 50,
      searchField: "id",
      searchValue: `${claimDiagnosis.cptcodeid}`,
    }).then(
      (response: any) => {
        setCptCode(response.data.data);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }, [CPTCodeService, setCptCode, claimDiagnosis.cptcodeid]);

  const fetchModifiers = useCallback(
    async (pagination: any) => {
      await modifiersService.current(pagination).then(
        (response: any) => {
          setModifiers(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [modifiersService, setModifiers]
  );

  useEffect(() => {
    fetchModifiers({
      page: 0,
      limit: 50,
    });
  }, [fetchModifiers]);

  useEffect(() => {
    fetchCPTCode();
  }, [fetchCPTCode]);

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const filtredClaimDiagnosis = useCallback(
    (index: number) => {
      return (
        <MenuItem
          key={claimDiagnosisArray[index]}
          value={claimDiagnosisArray[index]}
        >
          {claimDiagnosisArray[index]}
        </MenuItem>
      );
    },
    [claimDiagnosisArray]
  );

  const filtredModifiers = useCallback(
    (index: number) => {
      const filtred = modifiers?.filter(
        (modifier: any) => !modifiersArray?.includes(modifier.id)
      );

      const existing = modifiers?.filter(
        (modifier: any) => modifier.id == modifiersArray[index]
      );

      const final = existing.concat(filtred);

      return final?.map((code: any) => (
        <MenuItem key={code?.id} value={code?.id}>
          {code?.name}
        </MenuItem>
      ));
    },
    [modifiers, modifiersArray]
  );

  const handleMultiSelection = useCallback(
    (value: number, index: number, select: SelectType) => {
      const tempM = modifierTemp.concat(modifiersArray);
      const tempC = claimTemp.concat(claimDiagnosisArray);

      if (select === SelectType.Modifier) {
        tempM[index] = value;
        setModifiersArray(tempM);
      } else {
        tempC[index] = value;
        setClaimDiagnosisArray(tempC);
      }
    },
    [modifierTemp, claimTemp, claimDiagnosisArray, modifiersArray]
  );

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      cptcodeid: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    cptcodeid: Yup.string().required("Code is required"),
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
    async (claimDiagnosis: any) => {
      reset(claimDiagnosis);
    },
    [reset]
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
        await Modify(claimDiagnosis.icdcodeid, {
          ...data,
          patvisitid: patientVisitId,
          modifiersarr: modifiersArray,
          icdcodesarr: claimDiagnosisArray,
        }).then(
          async () => {
            handleOpen();
            onClose();
            onFetch(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        await Create({
          ...data,
          patvisitid: patientVisitId,
          modifiersarr: modifiersArray,
          icdcodesarr: claimDiagnosisArray,
        }).then(
          async () => {
            handleOpen();
            onClose();
            onFetch(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [
      modifiersArray,
      claimDiagnosisArray,
      onClose,
      handleOpen,
      onFetch,
      pagination,
      patientVisitId,
      claimDiagnosis,
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
        <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="10px">
          <StyledTitle>Code</StyledTitle>
          {FormInputList.map((field, index) => (
            <Box key={index} display="flex !important">
              <StyledSelect
                name={field.field}
                disabled
                InputLabelProps={{ shrink: true }}
              >
                {cptCode.length > 0 &&
                  cptCode?.map((code: any) => (
                    <MenuItem key={code?.id} value={code?.id}>
                      {code?.cptcode}
                    </MenuItem>
                  ))}
              </StyledSelect>
            </Box>
          ))}
          <StyledTitle>Description</StyledTitle>
          {Column.map((field, index) => (
            <Box key={index} display="flex !important">
              <StyledSelect
                name={field.field}
                disabled
                InputLabelProps={{ shrink: true }}
              >
                {cptCode.length > 0 &&
                  cptCode?.map((code: any) => (
                    <MenuItem key={code?.id} value={code?.id}>
                      {code?.description}
                    </MenuItem>
                  ))}
              </StyledSelect>
            </Box>
          ))}
          <StyledTitle>Modifiers</StyledTitle>
          <Box flexWrap="wrap" gap="5px">
            {Array.from({ length: 4 }, (field, index) => (
              <Box
                key={`Modifiers${index}`}
                display="flex !important"
                width="49% !important"
              >
                <StyledMultiSelect
                  select
                  fullWidth
                  disabled
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  defaultValue={modifiersArray[index]}
                >
                  {filtredModifiers(index)}
                </StyledMultiSelect>
              </Box>
            ))}
          </Box>
          <StyledTitle>Pointers</StyledTitle>
          <Box display="flex" flexDirection="column" gap="5px">
            {usedPointers.map((field, index) => (
              <Box key={`ICD-10${index}`} display="flex !important">
                {/* <Typography>
                  {`${index + 1} - ${getICD10Code(codes[index].icdcodeid)} - ${
                    codes[index].description
                  } `}{" "}
                </Typography> */}
                <PointersList
                  id={codes[index].icdcodeid}
                  index={index}
                  codes={codes}
                />
                {/* <StyledMultiSelect
                  select
                  fullWidth
                  disabled
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  onChange={e =>
                    handleMultiSelection(
                      parseInt(e.target.value),
                      index,
                      SelectType.ICD
                    )
                  }
                  defaultValue={
                    claimDiagnosisArray && claimDiagnosisArray[index]
                  }
                >
                  {filtredClaimDiagnosis(index)}
                </StyledMultiSelect> */}
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          {/* <Divider />
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
          </Box> */}
        </Box>
      </FormProvider>
    </>
  );
};

export default ClaimLineForm;
