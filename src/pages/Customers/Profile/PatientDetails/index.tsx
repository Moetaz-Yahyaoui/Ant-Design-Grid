import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Page from "@components/Page";
import ColapsableSubPage from "~/components/ColapsableSubPage";
import dayjs from "dayjs";
import { Get } from "~/repositories/patients.servise";
import Adress from "./Insurance";
import { Box, Divider, Typography, styled } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { getAllPatientInsurance } from "~/repositories/patientInsurance.servise";
import NotesTable from "./Notes";
import DocumentsTable from "./Documents";
import ProfileForm from "./ProfileForm";
import TasksTag from "~/components/Tasks";
import MenuIcon from "@mui/icons-material/Menu";
import { If, Then, Else } from "react-if";

import { ReactComponent as Plus } from "~/assets/icons/plus.svg";
import { ReactComponent as Clock } from "~/assets/icons/clock.svg";
import { ReactComponent as Bolt } from "~/assets/icons/bolt.svg";
import CloseIcon from "@mui/icons-material/Close";
import { getAllPatientNotes } from "~/repositories/patientsNotes.service";
import { getAllNotes } from "~/repositories/notes.service";
import SuspenseLoader from "~/components/SuspenseLoader";
import { getAllInsurances } from "~/repositories/insurance.servise";
import { getAllPatientDocuments } from "~/repositories/patientDocument.service";
import VisitssTable from "./Visit";
import { getAllPatientVisits } from "~/repositories/patientVisit.service";
import PatientVisitPage from "../PatientVisit";
import ClaimDiagnosisForm from "./Forms/ClaimDiagnosisForm";
import { getAllPatVisitClaimDiagnose } from "~/repositories/patVisitClaimDiagnosis.servise";
import InsuranceForm from "./Forms/InsuranceForm";
import NoteForm from "./Forms/NotesForm";
import DocumentForm from "./Forms/DocumentsForm";
import VisitForm from "./Forms/VisitForm";
import PatientForm from "./Forms/PatientForm";
import ClaimLineForm from "./Forms/ClaimLineForm";
import { getAllPatVisitDiagnosis } from "~/repositories/patVisitDiagnosis.servise";

enum TaskListForm {
  InsuranceForm = "insuranceForm",
  NoteForm = "noteForm",
  DocumentForm = "documentForm",
  PatientForm = "patientForm",
  VisitForm = "VisitForm",
  ClaimDiagnosisForm = "claimDiagnosisForm",
  ClaimLineForm = "claimLineForm",
}

enum PageType {
  PatientDetails = "patientDetails",
  PatientVisit = "patientVisit",
}

interface EditMenuProps {
  visible: boolean;
  display?: boolean;
}

interface BalanceBoxProps {
  title: string;
  balance: string;
}

const BalanceBox: FC<BalanceBoxProps> = ({ title, balance }) => {
  return (
    <StyledBox>
      <StyledTitle>{title}</StyledTitle>
      <StyledBalnce>{`$${balance}`}</StyledBalnce>
    </StyledBox>
  );
};

function CustomersPage() {
  const [pageDisplay, setPageDisplay] = useState<PageType>(
    PageType.PatientDetails
  );
  const [patient, setPatient] = useState<any>([]);
  const [sideMenu, setSideMenu] = useState<TaskListForm>();
  const [isTaskMenuVisible, setIsEditMenuVisible] = useState<boolean>(false);
  const [isFormMenuVisible, setIsFormMenuVisible] = useState<boolean>(false);
  const [displayTask, setDisplayTask] = useState<boolean>(false);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [patientInsurances, setPatientInsurance] = useState<any>([]);
  const [editInsurances, setEditInsurance] = useState<any>([]);
  const [claimLine, setClaimLine] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>();
  const [selectedVisit, setSelectedVisit] = useState<any>();
  const [selectedClaimDiagnosis, setSelectedClaimDiagnosis] = useState<any>();
  const [selectedClaimLine, setSelectedClaimLine] = useState<any>();
  const [selectedDocument, setSelectedDocument] = useState<any>([]);

  const [notes, setNotes] = useState<any[]>([]);
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);
  const [claimDiagnosis, setClaimDiagnosis] = useState<any[]>([]);

  const PatientDocumentService = useRef(getAllPatientDocuments);
  const PatientNotesService = useRef(getAllPatientNotes);
  const NotesService = useRef(getAllNotes);
  const InsuranceService = useRef(getAllInsurances);
  const PatientsService = useRef(Get);
  const PatientInsuranceService = useRef(getAllPatientInsurance);
  const VisitService = useRef(getAllPatientVisits);
  const ClaimDiagnosisService = useRef(getAllPatVisitClaimDiagnose);
  const ClaimLineService = useRef(getAllPatVisitDiagnosis);

  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter(x => x);
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const [path, setPath] = useState<string>(pathnames[0]);

  useEffect(() => {
    if (pathnames[0] === "tasks") {
      setPath("tasks");
      setDisplayTask(true);
    } else if (!isFormMenuVisible) {
      setIsEditMenuVisible(false);
    } else {
      setDisplayTask(false);
    }
  }, [pathnames, isFormMenuVisible]);

  const handlePages = useCallback(
    (id?: string) => {
      if (
        pageDisplay === PageType.PatientDetails &&
        !searchParams.has("visitId") &&
        id
      ) {
        setPageDisplay(PageType.PatientVisit);
        navigate(
          `/${path}/${patient?.id}?name=${patient?.firstname}&visitId=${id}`
        );
      } else {
        setPageDisplay(PageType.PatientDetails);
        navigate(`/${path}/${patient?.id}?name=${patient?.firstname}`);
      }
    },
    [setPageDisplay, navigate, searchParams, pageDisplay, patient, path]
  );

  useEffect(() => {
    if (searchParams.has("visitId")) {
      const visitId = searchParams.get("visitId");
      visitId && setSelectedId(visitId);
      setPageDisplay(PageType.PatientVisit);
    } else {
      setPageDisplay(PageType.PatientDetails);
      id !== ":id"
        ? navigate(`/${path}/${id}?name=${patient?.firstname}`)
        : navigate(`/${path}/${id}`);
    }
  }, [searchParams, patient, navigate, setSelectedId, id, path]);

  const fetchPatVisitDiagnosis = useCallback(
    async (pagination: any) => {
      await ClaimLineService.current(pagination).then(
        (response: any) => {
          setClaimLine(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [ClaimLineService, setClaimLine]
  );

  useEffect(() => {
    fetchPatVisitDiagnosis({
      page: 0,
      limit: 50,
    });
  }, [fetchPatVisitDiagnosis]);

  const fetchPatientInsurances = useCallback(
    async (pagination: any) => {
      await PatientInsuranceService.current(pagination).then(
        (response: any) => {
          setPatientInsurance(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatientInsuranceService, setPatientInsurance]
  );

  useEffect(() => {
    fetchPatientInsurances({
      page: 0,
      limit: 50,
    });
  }, [fetchPatientInsurances]);

  const fetchVisits = useCallback(
    async (pagination: any) => {
      await VisitService.current(pagination).then(
        (response: any) => {
          setVisits(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [VisitService, setVisits]
  );

  useEffect(() => {
    fetchVisits({
      page: 0,
      limit: 50,
    });
  }, [fetchVisits]);

  const fetchClaimDiagnosis = useCallback(
    async (pagination: any) => {
      await ClaimDiagnosisService.current({
        ...pagination,
        orderBy: "sortorder",
      }).then(
        (response: any) => {
          const sorted = response?.data?.data?.sort(
            (a: any, b: any) => a.sortorder - b.sortorder
          );
          sorted && setClaimDiagnosis(sorted);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [ClaimDiagnosisService, setClaimDiagnosis]
  );

  useEffect(() => {
    fetchClaimDiagnosis({
      page: 0,
      limit: 50,
    });
  }, [fetchClaimDiagnosis]);

  const filtredVisits = useMemo(() => {
    const filtredvisits = visits?.filter((item: any) => item.patientid == id);
    return filtredvisits;
  }, [visits, id]);

  const filtredData = useMemo(() => {
    const filtredPatientInsurances = patientInsurances?.filter(
      (item: any) => item.patientid == id
    );
    return filtredPatientInsurances;
  }, [patientInsurances, id]);

  const filtredNotes = useMemo(() => {
    const filtredPatientNotes = patientNotes?.filter(
      (item: any) => item.patientid == id
    );
    const NoteIds = filtredPatientNotes.map((item: any) => item.noteid);
    const filtredNotes = notes.filter((notes: any) =>
      NoteIds.some((filter: any) => notes.id == filter)
    );
    return filtredNotes;
  }, [patientNotes, notes, id]);

  const filtredDocuments = useMemo(() => {
    const filtredPatientDocuments = patientDocuments?.filter(
      (item: any) => item.patientid == id
    );
    return filtredPatientDocuments;
  }, [patientDocuments, id]);

  const getPatientDocuments = useCallback(
    async (pagination: any) => {
      await PatientDocumentService.current(pagination).then(
        (response: any) => {
          setPatientDocuments(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatientDocumentService, setPatientDocuments]
  );

  useEffect(() => {
    getPatientDocuments({
      page: 0,
      limit: 50,
    });
  }, [getPatientDocuments]);

  const getPatientNotes = useCallback(
    async (pagination: any) => {
      await PatientNotesService.current(pagination).then(
        (response: any) => {
          setPatientNotes(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatientNotesService]
  );

  const getNotes = useCallback(
    async (pagination: any) => {
      await NotesService.current(pagination).then(
        (response: any) => {
          setNotes(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [NotesService, setNotes]
  );

  const fetchNotes = useCallback(
    async (pagination: any) => {
      getPatientNotes(pagination);
      getNotes(pagination);
    },
    [getPatientNotes, getNotes]
  );

  useEffect(() => {
    fetchNotes({
      page: 0,
      limit: 50,
    });
  }, [fetchNotes]);

  const getPatients = useCallback(
    async (id: string) => {
      await PatientsService.current(id).then(
        (response: any) => {
          setPatient(response.data[0]);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatientsService]
  );

  const fetchInsurances = useCallback(
    async (pagination: any) => {
      await InsuranceService.current(pagination).then(
        (response: any) => {
          setInsurances(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [InsuranceService]
  );

  useEffect(() => {
    id && getPatients(id);
  }, [id, getPatients]);

  useEffect(() => {
    fetchInsurances({
      page: 0,
      limit: 50,
    });
  }, [fetchInsurances]);

  const handleEditPatient = useCallback(() => {
    setSideMenu(TaskListForm.PatientForm);
    setIsFormMenuVisible(true);
    setIsEditMenuVisible(true);
  }, [setIsFormMenuVisible, setIsEditMenuVisible, setSideMenu]);

  const handleEditInsurance = useCallback(
    (insurance?: any) => {
      insurance ? setEditInsurance(insurance) : setEditInsurance(undefined);
      setSideMenu(TaskListForm.InsuranceForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [setSideMenu, setIsFormMenuVisible, setIsEditMenuVisible, setEditInsurance]
  );

  const handleEditNotes = useCallback(
    (note?: any) => {
      note ? setSelectedNote(note) : setSelectedNote(undefined);
      setSideMenu(TaskListForm.NoteForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [setIsEditMenuVisible, setIsFormMenuVisible, setSelectedNote]
  );

  const handleEditDocuments = useCallback(
    (document?: any) => {
      document ? setSelectedDocument(document) : setSelectedDocument(undefined);
      setSideMenu(TaskListForm.DocumentForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [
      setIsFormMenuVisible,
      setIsEditMenuVisible,
      setSelectedDocument,
      setSideMenu,
    ]
  );

  const handleEditVisit = useCallback(
    (visit?: any) => {
      visit ? setSelectedVisit(visit) : setSelectedVisit(undefined);
      setSideMenu(TaskListForm.VisitForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [setIsFormMenuVisible, setIsEditMenuVisible, setSelectedVisit, setSideMenu]
  );

  const handleEditClaimDiagnosis = useCallback(
    (claimDiagnosis?: any) => {
      claimDiagnosis
        ? setSelectedClaimDiagnosis(claimDiagnosis)
        : setSelectedClaimDiagnosis(undefined);
      setSideMenu(TaskListForm.ClaimDiagnosisForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [
      setIsFormMenuVisible,
      setIsEditMenuVisible,
      setSelectedClaimDiagnosis,
      setSideMenu,
    ]
  );

  const handleEditClaimLine = useCallback(
    (claimLine?: any, claimDiagnosis?: any) => {
      claimLine
        ? setSelectedClaimLine(claimLine)
        : setSelectedClaimLine(undefined);
      claimDiagnosis
        ? setSelectedClaimDiagnosis(claimDiagnosis)
        : setSelectedClaimDiagnosis(undefined);
      setSideMenu(TaskListForm.ClaimLineForm);
      setIsFormMenuVisible(true);
      setIsEditMenuVisible(true);
    },
    [
      setIsFormMenuVisible,
      setIsEditMenuVisible,
      setSelectedClaimLine,
      setSideMenu,
    ]
  );

  const handleCloseEdit = useCallback(() => {
    setIsFormMenuVisible(false);
    setIsEditMenuVisible(false);
  }, [setIsFormMenuVisible, setIsEditMenuVisible]);

  const getAge = useCallback((birthday: Date) => {
    const ageDifMs = dayjs(birthday).toDate();
    const ageDate = new Date(); // miliseconds from epoch
    return Math.abs(ageDifMs.getUTCFullYear() - ageDate.getUTCFullYear());
  }, []);

  const filtredClaimDiagnosis = useMemo(() => {
    const selectedVisit = claimDiagnosis?.filter(
      (claim: any) => claim.patvisitid == selectedId
    );
    return selectedVisit;
  }, [claimDiagnosis, selectedId]);

  const GetTaskList = useMemo(() => {
    switch (sideMenu) {
      case TaskListForm.InsuranceForm:
        return (
          <InsuranceForm
            patientInsurance={editInsurances}
            insurances={insurances}
            filtredInsurances={filtredData}
            pagination={{ page: 0, limit: 50 }}
            onFetchData={fetchPatientInsurances}
            onClose={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.NoteForm:
        return (
          <NoteForm
            id={selectedNote?.id}
            notes={selectedNote}
            pagination={{ page: 0, limit: 50 }}
            onFetchData={fetchNotes}
            onClose={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.DocumentForm:
        return (
          <DocumentForm
            id={selectedDocument?.id}
            document={selectedDocument}
            pagination={{ page: 0, limit: 50 }}
            onFetchData={getPatientDocuments}
            onClose={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.PatientForm:
        return (
          <PatientForm
            id={id}
            patient={patient}
            onFetch={() => id && getPatients(id)}
            onOpenMenu={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.VisitForm:
        return (
          <VisitForm
            id={selectedVisit?.id}
            visit={selectedVisit}
            onChangePages={handlePages}
            pagination={{ page: 0, limit: 50 }}
            onFetchData={fetchVisits}
            onClose={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.ClaimDiagnosisForm:
        return (
          <ClaimDiagnosisForm
            claimDiagnosis={selectedClaimDiagnosis}
            tableLength={filtredClaimDiagnosis.length}
            pagination={{ page: 0, limit: 50 }}
            onFetchData={fetchClaimDiagnosis}
            onClose={handleCloseEdit}
          />
        );
        break;
      case TaskListForm.ClaimLineForm:
        return (
          <ClaimLineForm
            claimDiagnosis={selectedClaimLine}
            patientVisitId={selectedId}
            codes={filtredClaimDiagnosis}
            pagination={{ page: 0, limit: 50 }}
            onClose={handleCloseEdit}
            onFetch={fetchPatVisitDiagnosis}
          />
        );
        break;
      default:
        return null;
    }
  }, [
    id,
    patient,
    sideMenu,
    selectedVisit,
    selectedNote,
    selectedDocument,
    insurances,
    selectedId,
    filtredData,
    fetchPatVisitDiagnosis,
    selectedClaimDiagnosis,
    selectedClaimLine,
    filtredClaimDiagnosis,
    editInsurances,
    handlePages,
    fetchClaimDiagnosis,
    fetchPatientInsurances,
    fetchNotes,
    getPatientDocuments,
    getPatients,
    fetchVisits,
    handleCloseEdit,
  ]);

  const GetFormTitle = useMemo(() => {
    switch (sideMenu) {
      case TaskListForm.InsuranceForm:
        if (editInsurances) {
          return "Edit Insurance";
        } else {
          return "Add insurance";
        }
        break;
      case TaskListForm.NoteForm:
        if (selectedNote) {
          return "Edit Note";
        } else {
          return "Add Note";
        }
        break;
      case TaskListForm.DocumentForm:
        if (selectedDocument) {
          return "Edit Document";
        } else {
          return "Add Document";
        }
        break;
      case TaskListForm.PatientForm:
        if (patient) {
          return "Edit Patient";
        } else {
          return "Add Patient";
        }
        break;
      case TaskListForm.VisitForm:
        if (selectedVisit) {
          return "Edit Visit";
        } else {
          return "Add Visit";
        }
        break;
      case TaskListForm.ClaimDiagnosisForm:
        if (selectedClaimDiagnosis) {
          return "Edit Claim Diagnosis";
        } else {
          return "Add Claim Diagnosis";
        }
        break;
      case TaskListForm.ClaimLineForm:
        if (selectedClaimLine) {
          return "Claim Line Details";
        } else {
          return "Claim Line Details";
        }
        break;
      default:
        return "";
    }
  }, [
    sideMenu,
    editInsurances,
    selectedVisit,
    selectedClaimDiagnosis,
    selectedClaimLine,
    selectedDocument,
    selectedNote,
    patient,
  ]);

  return (
    <>
      <Page>
        <Box width="100%" display="flex" gap="10px">
          <EditSideMenu visible={isFormMenuVisible} display={true}>
            <Box
              p="15px"
              display="flex"
              justifyContent={isFormMenuVisible ? "space-between" : "center"}
              alignItems="center"
              height={"79px"}
              sx={{ borderBottom: "1px solid #E9E9E9" }}
            >
              <Typography
                display={isFormMenuVisible ? "block" : "none"}
                variant="h4"
                sx={{ cursor: "pointer" }}
              >
                {GetFormTitle}
              </Typography>
              <CloseIcon
                onClick={() => {
                  setIsFormMenuVisible(!isFormMenuVisible);
                  setIsEditMenuVisible(!isTaskMenuVisible);
                }}
              />
            </Box>
            <Divider />
            {isFormMenuVisible ? GetTaskList : null}
          </EditSideMenu>

          <TaskSideMenu visible={isTaskMenuVisible} display={displayTask}>
            <Box
              p="5px"
              display="flex"
              justifyContent={isTaskMenuVisible ? "space-between" : "center"}
              alignItems="center"
              height={"79px"}
              sx={{ borderBottom: "1px solid #000" }}
            >
              <Typography
                display={isTaskMenuVisible ? "block" : "none"}
                variant="h4"
                sx={{ cursor: "pointer" }}
              >
                TaskList
              </Typography>

              <MenuIcon
                onClick={() => setIsEditMenuVisible(!isTaskMenuVisible)}
              />
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="column"
              gap={isTaskMenuVisible ? "none" : "200px"}
            >
              <Box>
                <StyledName
                  display={isTaskMenuVisible ? "none" : "block"}
                  variant="h4"
                  sx={{ cursor: "pointer", rotate: "270deg" }}
                >
                  {` ${patient?.lastname}`}
                </StyledName>
                <StyledName
                  display={isTaskMenuVisible ? "none" : "block"}
                  variant="h4"
                  sx={{ cursor: "pointer", rotate: "270deg" }}
                >
                  {`${patient?.firstname}`}
                </StyledName>
              </Box>
            </Box>
            {isTaskMenuVisible ? <TasksTag /> : null}
          </TaskSideMenu>
          <If condition={id !== ":id"}>
            <Then>
              <Box
                width="100%"
                display="flex"
                flexDirection="column"
                gap="10px"
              >
                <Box display="flex" height="100px" sx={{ background: "#FFF" }}>
                  <IconBox>
                    <Plus />
                    <Clock />
                    <Bolt />
                  </IconBox>
                  <Divider orientation="vertical" />
                  <PatientCard>
                    <Typography
                      sx={{ cursor: "pointer" }}
                      onClick={() => handlePages()}
                      fontWeight="600 !important"
                    >
                      {`${patient?.firstname} ${patient?.lastname}`}
                    </Typography>
                    <Typography fontWeight="600 !important">
                      {`${patient?.dateofbirth}, ${
                        patient.dateofbirth && getAge(patient?.dateofbirth)
                      } years`}
                    </Typography>
                    <Typography fontWeight="600!important">
                      Other, Team: 0
                    </Typography>
                    <Typography fontWeight="600!important">
                      {`Patient ID: ${patient?.id}`}
                    </Typography>
                    <Typography>Acc No: AEC7F57E58CB95</Typography>
                  </PatientCard>
                  <Divider orientation="vertical" />
                  <PatientCard>
                    <Typography fontWeight="600!important">
                      7EEBF9, 15FA2
                    </Typography>
                    <Typography>02/01/1964, 58 Years</Typography>
                    <Typography>Other, Team: 0</Typography>
                    <Typography>Patient ID: 3622001</Typography>
                    <Typography>Acc No: AEC7F57E58CB95</Typography>
                  </PatientCard>
                  <Divider orientation="vertical" />
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    width="30%"
                    gap="1px"
                  >
                    <Box display="flex" justifyContent="center" gap="10px">
                      <BalanceBox title="Acct Balance" balance="7,645.00" />
                      <BalanceBox title="Group Balance" balance="7,645.00" />
                    </Box>
                    <Box display="flex" justifyContent="center" gap="10px">
                      <BalanceBox title="Acct Charges" balance="7,645.00" />
                      <BalanceBox title="Group Charges" balance="7,645.00" />
                    </Box>
                  </Box>
                </Box>
                {pageDisplay === PageType.PatientDetails ? (
                  <Box display="flex" gap="10px">
                    <Box
                      width="70%"
                      display="flex"
                      flexDirection="column"
                      gap="10px"
                    >
                      <ColapsableSubPage
                        edit={true}
                        add={false}
                        title={"Patient Details"}
                        expanded={true}
                        onClickEdit={handleEditPatient}
                      >
                        <ProfileForm
                          onFetchData={getPatients}
                          patient={patient}
                        />
                      </ColapsableSubPage>

                      <ColapsableSubPage
                        expanded={true}
                        edit={false}
                        add={true}
                        title={"Notes"}
                        count={filtredNotes?.length}
                        onAddClick={() => handleEditNotes()}
                      >
                        <If
                          condition={
                            patientNotes.length > 0 && notes.length > 0
                          }
                        >
                          <Then>
                            <NotesTable
                              filtredNotes={filtredNotes}
                              onFetch={fetchNotes}
                              onSelectNote={handleEditNotes}
                            />
                          </Then>
                          <Else>
                            <SuspenseLoader />
                          </Else>
                        </If>
                      </ColapsableSubPage>
                      <ColapsableSubPage
                        expanded={true}
                        edit={false}
                        add={true}
                        title={"Documents"}
                        count={filtredDocuments?.length}
                        onAddClick={() => handleEditDocuments()}
                      >
                        <DocumentsTable
                          documents={filtredDocuments}
                          onFetch={getPatientDocuments}
                          onSelectDocument={handleEditDocuments}
                        />
                      </ColapsableSubPage>
                    </Box>
                    <Box
                      width="30%"
                      display="flex"
                      flexDirection="column"
                      gap="10px"
                    >
                      <ColapsableSubPage
                        edit={false}
                        add={filtredData?.length < 3}
                        title={"Insurance"}
                        expanded={true}
                        count={filtredData?.length}
                        onAddClick={() => handleEditInsurance()}
                      >
                        <Box
                          pt={2}
                          pb={4}
                          display="flex"
                          flexDirection="column"
                          gap="5px"
                        >
                          <If condition={patientInsurances.length > 0}>
                            <Then>
                              {filtredData?.map((insurance: any) => (
                                <Adress
                                  key={insurance.id}
                                  title={insurance.insurancepayer}
                                  insurance={insurance}
                                  onSelectInsurance={handleEditInsurance}
                                  onFetch={fetchPatientInsurances}
                                />
                              ))}
                            </Then>
                            <Else>
                              <SuspenseLoader />
                            </Else>
                          </If>
                        </Box>
                      </ColapsableSubPage>
                      <ColapsableSubPage
                        edit={false}
                        add={true}
                        title={"Patient Visit"}
                        expanded={true}
                        onAddClick={() => handleEditVisit()}
                      >
                        <Box
                          pb={4}
                          display="flex"
                          flexDirection="column"
                          gap="5px"
                        >
                          <If condition={true}>
                            <Then>
                              <VisitssTable
                                visits={filtredVisits}
                                onFetch={fetchVisits}
                                onSelectVisit={handleEditVisit}
                                onChangePage={handlePages}
                              />
                            </Then>
                            <Else>
                              <SuspenseLoader />
                            </Else>
                          </If>
                        </Box>
                      </ColapsableSubPage>
                    </Box>
                  </Box>
                ) : (
                  <PatientVisitPage
                    patientVisit={filtredVisits}
                    patient={patient}
                    patientInsurances={filtredData}
                    claimDiagnosis={claimDiagnosis}
                    claimLine={claimLine}
                    onEditVisit={handleEditVisit}
                    onEditInsurance={handleEditInsurance}
                    onEditClaimDiagnosis={handleEditClaimDiagnosis}
                    onEditClaimLine={handleEditClaimLine}
                    onFetchClaim={fetchClaimDiagnosis}
                    onFetchClaimLine={fetchPatVisitDiagnosis}
                    onFetchPatientInsurance={fetchPatientInsurances}
                  />
                )}
              </Box>
            </Then>
            <Else>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="87vh"
              >
                <StyledRequest>
                  Please Select patient from task details
                </StyledRequest>
              </Box>
            </Else>
          </If>
        </Box>
      </Page>
    </>
  );
}

const TaskSideMenu = styled("div", {
  shouldForwardProp: prop => prop !== "visible" && prop !== "display",
})<EditMenuProps>(
  ({ theme, visible, display }) => `
  width: ${visible ? "500px" : display ? "50px" : "0px"};
  opacity: ${display ? "1" : "0"};
  background: #E9E9E9;
  // z-index: 11;
  transition: width 0.5s;
  border-top: 1px solid #cecbcb;
  box-shadow: 5px 12px 9px rgb(0 0 0 / 10%);
  overflow: auto;
  form {
    padding: 25px;
    div {
      display: block;
    }
  }
`
);

const EditSideMenu = styled("div", {
  shouldForwardProp: prop => prop !== "visible" && prop !== "display",
})<EditMenuProps>(
  ({ theme, visible, display }) => `
  width: ${visible ? "380px" : display ? "50px" : "0px"};
  height: 100%;
  position: absolute;
  top: 0;
  left: ${visible ? "0" : "-50px"};

  background: #FFF;
  z-index: 12;
  transition: width 0.5s;
      border-top: 1px solid #cecbcb;
    box-shadow: 5px 12px 9px rgb(0 0 0 / 10%);
    // overflow: auto;
  form {
    padding: 25px;
    height: 92%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    div {
      display: flex;
      align-items: center;
      margin-top: 0 !important;
      width: 100%;
    }
  }
`
);

const StyledBox = styled(Box)(
  () => `
    && {
      width: 90px;
      background: rgb(0 0 0 / 10%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 2.5px;
    }
`
);

const StyledRequest = styled(Typography)(
  () => `
    && {
font-style: normal;
font-weight: 600;
font-size: 36px;
line-height: 44px;

color: rgba(0, 0, 0, 0.2);
    }
`
);

const IconBox = styled(Box)(
  () => `
    && {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
      padding: 10px;
    }
`
);

const PatientCard = styled(Box)(
  () => `
    && {
      width: 30%;
      height: 100px;
      background: #FFF;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8px 70px;
      border-radius: 2.5px;
       div {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 14px;
      }
    }
`
);

const StyledTitle = styled(Typography)(
  () => `
    && {
      font-style: normal;
      font-weight: 400;
      font-size: 10px;
      line-height: 10px;

    }
`
);

const StyledBalnce = styled(Typography)(
  () => `
    && {
      font-style: normal;
      font-weight: 700;
      font-size: 12px;
      line-height: 12px;

      color: #000000;
    }
`
);

const StyledName = styled(Typography)(
  () => `
    && {
      margin-top: 150px;
      margin-bottom: 150px;
      font-style: normal;
      font-weight: 700;
      font-size: 33px;
      line-height: 12px;
      color: #000000;
    }
`
);

export default CustomersPage;
