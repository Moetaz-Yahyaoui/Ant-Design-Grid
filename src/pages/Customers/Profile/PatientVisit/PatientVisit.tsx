import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  useMemo,
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
  Typography,
  Card,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { IDefaultValuesProducts, MethodeType } from "~/types";
import {
  FormInput,
  FormProvider,
  RHFTextInputLabel,
} from "@components/hook-form";
import { Create, Modify } from "~/repositories/patients.servise";
import { Else, If, Then } from "react-if";
import SuspenseLoader from "~/components/SuspenseLoader";
import { getAllDropdowns } from "~/repositories/dropdown.service";

export const DEFAULT_PROFILE_VALUES = {
  firstname: "",
  email: "",
  country: "",
  state: "",
  city: "",
  zipCode: "",
  company: "",
  role: "",
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
}

interface PatientProfileProps {
  patientVisit: any;
  patient: any;
}

const PatientVisit: FC<PatientProfileProps> = ({ patientVisit, patient }) => {
  const [serviceArea, setServiceArea] = useState<any>([]);
  const [visitstatus, setVisitStatus] = useState<any>([]);
  const [clinician, setClinician] = useState<any>([]);
  const [physician, setPhysician] = useState<any>([]);

  const dropDownService = useRef(getAllDropdowns);

  const fetchDropDown = useCallback(async () => {
    await dropDownService.current().then(
      (response: any) => {
        setServiceArea(response.data.serviceareas);
        setVisitStatus(response.data.visitstatus);
        setPhysician(response.data.clinicians);
        setClinician(response.data.physicians);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }, [dropDownService, setServiceArea, setVisitStatus]);

  useEffect(() => {
    fetchDropDown();
  }, [fetchDropDown]);

  const getLocation = useCallback(
    (locationId: number) => {
      const location = serviceArea?.filter(
        (area: any) => area.id == locationId
      );
      return location?.length > 0 ? location[0].name : locationId;
    },
    [serviceArea]
  );

  const getPhysician = useCallback(
    (physicianId: number) => {
      const status = physician?.filter(
        (status: any) => status.id == physicianId
      );
      return status?.length > 0 ? status[0].name : physicianId;
    },
    [physician]
  );

  const getClinician = useCallback(
    (clinicianId: number) => {
      const status = clinician?.filter(
        (status: any) => status.id == clinicianId
      );
      return status?.length > 0 ? status[0].name : clinicianId;
    },
    [clinician]
  );

  const FormInputProfileList = useMemo(
    () => [
      {
        name: "Account Number",
        field: `${patientVisit?.length > 0 && patientVisit[0].accountnumber}`,
      },
      {
        name: "Patient Name",
        field: `${patient.firstname} ${patient.lastname}`,
      },
      {
        name: "Service Area",
        field: `${
          patientVisit?.length > 0 && getLocation(patientVisit[0].serviceareaid)
        }`,
      },
      {
        name: "Clinician",
        field: `${
          patientVisit?.length > 0 && getClinician(patientVisit[0].clinicianid)
        }`,
      },
    ],
    [getLocation, getClinician, patient, patientVisit]
  );

  const Column2 = useMemo(
    () => [
      {
        name: "Room",
        field: `${patientVisit?.length > 0 && patientVisit[0].room}`,
      },

      {
        name: "Refering Physician",
        field: `${
          patientVisit?.length > 0 && getPhysician(patientVisit[0].physicianid)
        }`,
      },
      {
        name: "Supervizing Physician",
        field: `${
          patientVisit?.length > 0 &&
          getPhysician(patientVisit[0].supphysicianid)
        }`,
      },
    ],
    [patientVisit, getPhysician]
  );

  return (
    <CardStyled>
      <If condition={patientVisit}>
        <Then>
          <Box>
            <FormContainer>
              {FormInputProfileList.map((field: any) => (
                <>
                  <Box
                    key={field.name}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <StyledTitle>{`${field.name}: `} </StyledTitle>
                    <StyledTitle key={field.name}>
                      {`${field.field}`}{" "}
                    </StyledTitle>
                  </Box>
                </>
              ))}
            </FormContainer>
            <Divider orientation="vertical" />
            <FormContainer>
              {Column2.map((field: any) => (
                <>
                  <Box
                    key={field.name}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <StyledTitle>{`${field.name}: `} </StyledTitle>
                    <StyledTitle key={field.name}>
                      {`${field.field}`}{" "}
                    </StyledTitle>
                  </Box>
                </>
              ))}
            </FormContainer>
          </Box>
        </Then>
        <Else>
          <SuspenseLoader />
        </Else>
      </If>
    </CardStyled>
  );
};

const CardStyled = styled(Box)(
  () => `
      && {
        height: 100%;
        min-height: 40px;
        display: flex;
        box-shadow: unset;
        border-radius:0;
        padding: 10px;
        > div {
          width: 100%;
          display: flex;
          align-items: end;
          gap: 10px;
        }
      }
  `
);

const StyledHeader = styled(Box)(
  () => `
      && {
        display: flex;
        flex-direction: column;
        background: #D5D8EF;
        padding: 10px;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
        margin-bottom: 10px;
      }
  `
);

const FormContainer = styled(Box)(
  () => `
      && {
        display: flex;
        flex-direction: column;
        width: 50%;
        gap: 5px;
      }
  `
);

const StyledTitle = styled(Typography)(
  () => `
      && {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;

        color: #000000;
      }
  `
);

export default PatientVisit;
