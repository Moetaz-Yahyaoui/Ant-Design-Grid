import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ColapsableSubPage from "~/components/ColapsableSubPage";
import { getAllPatient } from "~/repositories/patients.servise";
import Adress from "./Adress";
import {
  Box,
  CircularProgress,
  styled,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { getAllPatientInsurance } from "~/repositories/patientInsurance.servise";
import { getAllPatientTasks } from "~/repositories/patientsTaskList.service";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CropFreeIcon from "@mui/icons-material/CropFree";
import AccordionActions from "@mui/material/AccordionActions";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Else, If, Then } from "react-if";

function TasksTag() {
  const [patients, setPatients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const InsuranceService = useRef(getAllPatientInsurance);
  const PatientsService = useRef(getAllPatient);
  const navigate = useNavigate();

  const getAllPatients = useCallback(
    async (pagination: any) => {
      await PatientsService.current(pagination).then(
        (response: any) => {
          setPatients(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [InsuranceService]
  );

  const getAllPatientsTasks = useCallback(async () => {
    await getAllPatientTasks().then(
      (response: any) => {
        setTasks(response.data);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }, [getAllPatientTasks]);

  useEffect(() => {
    getAllPatientsTasks();
  }, [getAllPatientsTasks]);

  useEffect(() => {
    getAllPatients({
      page: 0,
      limit: 50,
    });
  }, [getAllPatients]);

  const filtredData = useMemo(() => {
    const filtredTasks = Array.from(
      new Set(
        tasks.map(data => {
          return {
            id: data.id,
            task: data.task,
            patientid: data.patientid,
            patientfullname: data.patientfullname,
          };
        })
      )
    );
    return filtredTasks;
  }, [tasks]);

  return (
    <Box p={1} display="flex" flexDirection="column" gap="5px">
      <If condition={filtredData.length > 0}>
        <Then>
          {tasks.length > 0 &&
            tasks.map((task, index) => (
              <StyledContaner key={index}>
                <StyledAccordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={{ minHeight: "36px !important" }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                      alignItems="center"
                    >
                      <StyledHeader>TaskList</StyledHeader>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Divider />
                    <Box
                      pt={1}
                      pb={4}
                      display="flex"
                      flexDirection="column"
                      gap="12px"
                    >
                      {patients.length > 0 &&
                        task?.patients?.map((patient: any, index: number) => (
                          <StyledList
                            key={`${patient.patientid} ${index}`}
                            onClick={() =>
                              navigate(
                                `/tasks/${patient?.patientid}?name=${patient?.firstname}`
                              )
                            }
                          >{`${patient.firstname} ${patient.lastname}`}</StyledList>
                        ))}
                    </Box>
                  </AccordionDetails>
                </StyledAccordion>
              </StyledContaner>
            ))}
        </Then>
        <Else>
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={64} disableShrink thickness={3} />
          </Box>
        </Else>
      </If>
    </Box>
  );
}

const StyledContaner = styled(Box)(
  () => `
    && {
      > div {
        background: #F9F9F9;
        box-shadow: none;
      }
    }
`
);

const StyledList = styled(Box)(
  () => `
    && {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #000000;
      cursor: pointer;
    }
`
);

const StyledAccordion = styled(Accordion)(
  () => `
    && {
      border-radius: 0;
      box-shadow: 0px 6px 10px rgb(0 0 0 / 15%);
      .MuiAccordionSummary-content {
        margin: 0;

      }
    }
`
);

const StyledHeader = styled(Typography)(
  () => `
    && {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
      color: #000000;
    }
`
);

export default TasksTag;
