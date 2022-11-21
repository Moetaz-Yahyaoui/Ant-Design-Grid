import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Page from "@components/Page";
import dayjs from "dayjs";
import { Box, styled, MenuItem, TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import VisitInsurance from "./Insurance";
import OtherInformationForm from "./Forms/OtherInformationForm";
import PatientVisit from "./PatientVisit";
import ColapsableSubPage from "~/components/ColapsableSubPage";
import { Else, If, Then } from "react-if";
import SuspenseLoader from "~/components/SuspenseLoader";
import { getAllPatVisitInsurance } from "~/repositories/patVisitInsurance.servise";
import ClaimDiagnosisTable from "./ClaimDiagnosis";
import ClaimLineTable from "./ClaimLineTble";
import { getAllPatVisitOther } from "~/repositories/patVisitOther.servise";
import Account from "../PatientDetails/Insurance";

const PatientVisitPage = ({
  patientVisit,
  patientInsurances,
  claimDiagnosis,
  claimLine,
  patient,
  onFetchClaim,
  onFetchPatientInsurance,
  onEditVisit,
  onEditInsurance,
  onFetchClaimLine,
  onEditClaimDiagnosis,
  onEditClaimLine,
}: {
  patientVisit?: any;
  patientInsurances: any;
  patient: any;
  claimLine: any;
  claimDiagnosis: any;
  onFetchClaim: (pagination: any) => void;
  onFetchClaimLine: (pagination: any) => void;
  onFetchPatientInsurance: (pagination: any) => void;
  onEditVisit: (visit?: any) => void;
  onEditInsurance: (patientInsurance?: any) => void;
  onEditClaimDiagnosis: (claimDiagnosis?: any) => void;
  onEditClaimLine: (claimLine?: any) => void;
}): JSX.Element => {
  const [selectedId, setSelectedId] = useState<string>(
    `${patientVisit?.length > 0 ? patientVisit[0].id : ""}`
  );
  const [patVisitInsurance, setPatVisitInsurance] = useState<any[]>([]);
  const [patVisitOther, setPatVisitOther] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("visitId")) {
      const visitId = searchParams.get("visitId");
      visitId && setSelectedId(visitId);
    }
  }, [location.search, setSelectedId]);

  const PatVisitInsuranceService = useRef(getAllPatVisitInsurance);
  const PatVisitOtherService = useRef(getAllPatVisitOther);

  const fetchPatientFisitInsurances = useCallback(
    async (pagination: any) => {
      await PatVisitInsuranceService.current(pagination).then(
        (response: any) => {
          setPatVisitInsurance(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatVisitInsuranceService, setPatVisitInsurance]
  );

  useEffect(() => {
    fetchPatientFisitInsurances({
      page: 0,
      limit: 50,
    });
  }, [fetchPatientFisitInsurances]);

  const fetchPatVisitOther = useCallback(
    async (pagination: any) => {
      await PatVisitOtherService.current(pagination).then(
        (response: any) => {
          setPatVisitOther(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [PatVisitOtherService, setPatVisitOther]
  );

  useEffect(() => {
    fetchPatVisitOther({
      searchField: "patvisitid",
      searchValue: `${selectedId}`,
    });
  }, [fetchPatVisitOther, selectedId]);

  const filtredData = useMemo(() => {
    const filtredPatVisitInsurances = patVisitInsurance?.filter(
      (item: any) => item.patientvisitid == selectedId
    );
    const patientInsuranceIds = filtredPatVisitInsurances?.map(
      (item: any) => item.patientinsuranceid
    );
    const filtredPatientInsurances = patientInsurances?.filter(
      (patientInsurance: any) =>
        patientInsuranceIds.some((filter: any) => patientInsurance.id == filter)
    );
    return filtredPatientInsurances;
  }, [patVisitInsurance, patientInsurances, selectedId]);

  const handleChangeVisit = useCallback(
    (id: string) => {
      setSelectedId(id);
      navigate(
        `/patient/${patient?.id}?name=${patient?.firstname}&visitId=${id}`
      );
    },
    [setSelectedId, navigate, patient]
  );

  const SelectedPatientVisit = useMemo(() => {
    const selectedVisit = patientVisit?.filter(
      (visit: any) => visit.id == selectedId
    );
    return selectedVisit;
  }, [patientVisit, selectedId]);

  const filtredClaimDiagnosis = useMemo(() => {
    const selectedVisit = claimDiagnosis?.filter(
      (claim: any) => claim.patvisitid == selectedId
    );
    return selectedVisit;
  }, [claimDiagnosis, selectedId]);

  const filtredClaimLine = useMemo(() => {
    const selectedVisit = claimLine?.filter(
      (claim: any) => claim.patvisitid == selectedId
    );
    return selectedVisit;
  }, [claimLine, selectedId]);

  return (
    <>
      <Page>
        <Box display="flex" flexDirection="column" gap="5px">
          <Header>
            <StyledSelect
              select
              fullWidth
              size="small"
              label={"Patient Visit"}
              onChange={e => handleChangeVisit(e.target.value)}
              defaultValue={selectedId}
            >
              {patientVisit?.map((visit: any) => (
                <MenuItem key={visit.id} value={`${visit.id}`}>
                  {dayjs(visit.visitdate).format("MM/DD/YYYY")}
                </MenuItem>
              ))}
            </StyledSelect>
          </Header>
          <Box width="100%" height="100%" display="flex" gap="5px">
            <Box width="70%" display="flex" flexDirection="column" gap="5px">
              <ColapsableSubPage
                edit={true}
                add={false}
                title={"Patient Details"}
                expanded={true}
                onClickEdit={() => onEditVisit(SelectedPatientVisit[0])}
              >
                <PatientVisit
                  patientVisit={SelectedPatientVisit}
                  patient={patient}
                />
              </ColapsableSubPage>
            </Box>
            <Box width="30%" display="flex" flexDirection="column" gap="5px">
              <ColapsableSubPage
                edit={false}
                add={patientInsurances?.length < 3}
                title={"Insurance"}
                expanded={true}
                onAddClick={() => onEditInsurance()}
              >
                <Box
                  pt={2}
                  pb={4}
                  display="flex"
                  flexDirection="column"
                  gap="5px"
                >
                  <If condition={patVisitInsurance.length > 0}>
                    <Then>
                      {patientInsurances?.map((insurance: any) => (
                        <Account
                          key={insurance.id}
                          title={insurance.insurancepayer}
                          insurance={insurance}
                          onSelectInsurance={() => onEditInsurance(insurance)}
                          onFetch={onFetchPatientInsurance}
                        />
                      ))}
                    </Then>
                    <Else>
                      <SuspenseLoader />
                    </Else>
                  </If>
                </Box>
              </ColapsableSubPage>
            </Box>
          </Box>

          <ColapsableSubPage
            edit={false}
            add={false}
            title={"Claim Diagnosis"}
            expanded={true}
            onAddClick={() => onEditClaimDiagnosis()}
          >
            <If condition={claimDiagnosis}>
              <Then>
                <ClaimDiagnosisTable
                  visitClaimDiagnosis={filtredClaimDiagnosis}
                  claimLine={filtredClaimLine}
                  onFetch={onFetchClaim}
                />
              </Then>
              <Else>
                <SuspenseLoader />
              </Else>
            </If>
          </ColapsableSubPage>
          <ColapsableSubPage
            edit={false}
            add={false}
            title={"Claim Lines"}
            expanded={true}
            onAddClick={() => onEditClaimLine()}
          >
            <Box pb={2} display="flex" flexDirection="column" gap="5px">
              <ClaimLineTable
                claimLine={filtredClaimLine}
                onFetch={onFetchClaimLine}
                patientVisitId={selectedId}
                claimDiagnosis={filtredClaimDiagnosis}
                onEdit={onEditClaimLine}
              />
            </Box>
          </ColapsableSubPage>
          <ColapsableSubPage
            edit={false}
            add={false}
            title={"Other Information"}
            expanded={true}
            onAddClick={() => onEditClaimLine()}
          >
            <OtherInformationForm
              patientVisit={patientVisit}
              patientVisitId={selectedId}
              information={patVisitOther[0]}
              onFetchData={fetchPatVisitOther}
              pagination={{
                searchField: "patvisitid",
                searchValue: `${selectedId}`,
              }}
            />
          </ColapsableSubPage>
        </Box>
      </Page>
    </>
  );
};

const Header = styled(Box)(
  () => `
        && {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #000;
          width: 10%;
        }
    `
);

const StyledSelect = styled(TextField)(
  () => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
      }
  `
);

export default PatientVisitPage;
