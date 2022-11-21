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
  Divider,
  Box,
  styled,
  Snackbar,
  Typography,
  MenuItem,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { MethodeType, IDefaultValuesProducts as IDefaultValues } from "~/types";
import { FormInput, FormProvider, RHFTextField } from "@components/hook-form";
import { Create, Modify } from "~/repositories/patientVisit.service";
import { useParams } from "react-router";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import dayjs from "dayjs";
import { getAllDropdowns } from "~/repositories/dropdown.service";
import { getAllPhysicians } from "~/repositories/physician.service";
import {
  CancelButton,
  SaveButton,
  StyledLabel,
} from "~/pages/Customers/AddCustomers/AddForm";

enum InputType {
  TextField = "textField",
  Select = "select",
  Date = "date",
  Time = "time",
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
        background: #F9F9F9;
         input {
          // height: 5px !important;
        }
      }
  `
);

const StyledPhysicianInput = styled(FormInput)(
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
      }
  `
);

const FormInputList = [
  { name: "Visit Date *", field: "visitdate", type: InputType.Date },
  { name: "Visit Time", field: "visittime", type: InputType.Time },
  { name: "Physician", field: "physicianid", type: InputType.Select },
  { name: "Clinician", field: "clinicianid", type: InputType.Select },
  {
    name: "Supervisior Physician",
    field: "supphysicianid",
    type: InputType.Select,
  },
  { name: "Service Location", field: "serviceareaid", type: InputType.Select },
];

const VisitForm: FC<any> = ({
  visit,
  onChangePages,
  pagination,
  onClose,
  onFetchData,
}) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });

  const [physicians, setPhysicians] = useState<any>([]);
  const [clinicians, setClinitians] = useState<any>([]);
  const [serviceArea, setServiceArea] = useState<any>([]);
  const [visittypes, setVisitType] = useState<any>([]);
  const [visitstatus, setVisitStatus] = useState<any>([]);
  const [allPhysicians, setAllPhysicians] = useState<any[]>([]);
  const [supPhysicians, setSupPhysicians] = useState<any>([]);
  const [physicianId, setPhysicianId] = useState<number>(visit?.physicianid);
  const [supName, setSupName] = useState<string>();

  const dropDownService = useRef(getAllDropdowns);
  const physicianService = useRef(getAllPhysicians);

  const fetchAllPhysicians = useCallback(
    async (pagination: any) => {
      await physicianService.current(pagination).then(
        (response: any) => {
          setAllPhysicians(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [physicianService, setAllPhysicians]
  );

  useEffect(() => {
    fetchAllPhysicians({
      page: 0,
      limit: 50,
    });
  }, [fetchAllPhysicians]);

  const fetchDropDown = useCallback(async () => {
    await dropDownService.current().then(
      (response: any) => {
        setPhysicians(response.data.physicians);
        setClinitians(response.data.clinicians);
        setServiceArea(response.data.serviceareas);
        setVisitType(response.data.visittypes);
        setVisitStatus(response.data.visitstatus);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }, [
    setPhysicians,
    setClinitians,
    setServiceArea,
    setVisitType,
    setVisitStatus,
  ]);

  useEffect(() => {
    fetchDropDown();
  }, [fetchDropDown]);

  const { id } = useParams();

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      visitdate: null,
      visittime: "",
      physicianid: "",
      clinicianid: "",
      supphysicianid: "",
      serviceareaid: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    // physicianid: Yup.string().required("visit date is required"),
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

  const getSupPhysician = useCallback(
    (value: string) => {
      const filtredCodes = allPhysicians?.filter(
        (code: any) => code.id == value
      );
      setPhysicianId(parseInt(value));
      filtredCodes?.length > 0 &&
        setSupPhysicians(filtredCodes[0].supphysicianid);
      const filtredSup = allPhysicians?.filter(
        (code: any) => code.id == filtredCodes[0].supphysicianid
      );
      filtredSup?.length > 0 && setSupName(filtredSup[0].physicianname);
    },
    [allPhysicians]
  );

  useEffect(() => {
    physicianId && getSupPhysician(`${physicianId}`);
  }, [physicianId, getSupPhysician]);

  const resetAsyncForm = useCallback(
    async (visit: IDefaultValues) => {
      reset(visit);
    },
    [reset]
  );

  useEffect(() => {
    if (visit) {
      resetAsyncForm({
        ...visit,
        visitdate: dayjs(visit.visitdate).format("YYYY-MM-DD"),
        supphysicianid: supPhysicians || visit?.supphysicianid,
        physicianid: physicianId,
      } as unknown as any);
    } else {
      resetAsyncForm({
        visitdate: methods.getValues("visitdate") || null,
        visittime: methods.getValues("visittime") || "",
        clinicianid: methods.getValues("clinicianid") || "",
        serviceareaid: methods.getValues("serviceareaid") || "",
        supphysicianid: supPhysicians || visit?.supphysicianid,
        physicianid: physicianId,
      } as unknown as IDefaultValues);
    }
  }, [visit, resetAsyncForm, supPhysicians, physicianId, methods]);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (visit) {
        await Modify(visit.id, {
          ...data,
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
          room: "test",
          accountnumber: "12GFRS",
        }).then(
          async response => {
            handleOpen();
            onClose();
            onFetchData(pagination);
            onChangePages(response?.data?.result?.id);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [onClose, onFetchData, handleOpen, visit, id, pagination, onChangePages]
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
        <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="12px">
          {FormInputList.map(field => (
            <Box key={field.field} display="flex !important" gap="33px">
              <StyledLabel>{field.name}</StyledLabel>
              {field.type === InputType.Date ? (
                <StyledInput
                  type="date"
                  inputProps={{ max: "2999-12-31" }}
                  name={field.field}
                  InputLabelProps={{ shrink: true }}
                />
              ) : field.type === InputType.Time ? (
                <StyledInput
                  type="time"
                  name={field.field}
                  InputLabelProps={{ shrink: true }}
                />
              ) : (
                <>
                  {field.name === "Clinician" ? (
                    <StyledSelect
                      label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {clinicians.length > 0 &&
                        clinicians?.map((clinician: any) => (
                          <MenuItem
                            key={`${clinician?.id} + ${clinician?.name}`}
                            value={clinician?.id}
                          >
                            {clinician?.name}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : field.name === "Service Location" ? (
                    <StyledSelect
                      label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {serviceArea.length > 0 &&
                        serviceArea?.map((area: any) => (
                          <MenuItem
                            key={`${area?.id} + ${area?.name}`}
                            value={area?.id}
                          >
                            {area?.name}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : field.name === "Visit Status" ? (
                    <StyledSelect
                      label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {visitstatus.length > 0 &&
                        visitstatus?.map((area: any) => (
                          <MenuItem
                            key={`${area?.id} + ${area?.name}`}
                            value={area?.id}
                          >
                            {area?.name}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : field.name === "Visit Type" ? (
                    <StyledSelect
                      label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                    >
                      {visittypes.length > 0 &&
                        visittypes?.map((area: any) => (
                          <MenuItem
                            key={`${area?.id} + ${area?.name}`}
                            value={area?.id}
                          >
                            {area?.name}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : field.name === "Physician" ? (
                    <StyledSelect
                      label={field.name}
                      name={field.field}
                      onChange={e => getSupPhysician(e.target.value)}
                      placeholder={`${field.name}...`}
                    >
                      {physicians.length > 0 &&
                        physicians?.map((physician: any) => (
                          <MenuItem
                            key={`${physician?.id} + ${physician?.name}`}
                            value={physician?.id}
                          >
                            {physician?.name}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : (
                    <StyledPhysicianInput
                      readOnly
                      name={field.field}
                      value={supName}
                    />
                  )}
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

export default VisitForm;
