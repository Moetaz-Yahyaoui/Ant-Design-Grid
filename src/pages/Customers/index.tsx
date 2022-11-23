import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";

import MainTable from "@components/Table/MainTable";

import Page from "@components/Page";
import { getAllPatient, Delete } from "~/repositories/patients.servise";
import ADDForm from "./AddCustomers/AddForm";
import { useParams } from "react-router-dom";
import { If, Then, Else } from "react-if";
import { ReactComponent as Close } from "~/assets/icons/close.svg";
import { Box, styled, Divider, Typography } from "@mui/material";
import SuspenseLoader from "~/components/SuspenseLoader";

interface IDefaultValues {
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  comments: string;
  tags: string;
}

interface EditMenuProps {
  visible: boolean;
}

interface IPagination {
  page: number;
  limit: number;
}

const TABLE_PATIENTS_STRUCTURE: Array<string> = [
  "firstname",
  "lastname",
  "dateofbirth",
  "city",
  "state",
];

const CUSTOMER_SHARED_DATA: Record<string, any> = {
  addRoute: "/patient/add-customer",
  title: "Patients List",
};

function CustomersPage() {
  const [patient, setPatient] = useState<IDefaultValues | null>(null);
  const { id } = useParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    page: 0,
    limit: 50,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [isEditMenuVisible, setIsEditMenuVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const PatientsService = useRef(getAllPatient);
  const DeleteService = useRef(Delete);

  const getPatients = useCallback(
    async (pagination: IPagination) => {
      setIsLoading(true);
      const patients = PatientsService.current(pagination);
      setCustomers(patients);
      setTotalRows(38811);
      setIsLoading(false);
    },
    [PatientsService]
  );

  useEffect(() => {
    getPatients(pagination);
  }, [pagination, getPatients]);

  const onDeletePatient = useCallback(
    async (id: number) => {
      await DeleteService.current(id).then(
        async (response: any) => {
          setCustomers(response.data.data);
          await getPatients(pagination);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [DeleteService, pagination, getPatients]
  );

  const handlePageChange = useCallback((event: any, newPage: number): void => {
    setPagination(state => ({ ...state, page: newPage }));
  }, []);

  const handleLimitChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setPagination(state => ({
        ...state,
        limit: parseInt(event.target.value),
      }));
    },
    []
  );

  const handelEdit = useCallback(
    (record?: any) => {
      setIsEditMenuVisible(!isEditMenuVisible);
      setPatient(record);
    },
    [isEditMenuVisible]
  );

  useEffect(() => {
    if (!isEditMenuVisible) setPatient(null);
  }, [isEditMenuVisible, setPatient]);

  return (
    <>
      <Page>
        <If condition={isLoading}>
          <Then>
            <SuspenseLoader />
          </Then>
          <Else>
            <MainTable
              title="Patient"
              tableRowColumns={TABLE_PATIENTS_STRUCTURE}
              handleLimitChange={handleLimitChange}
              handlePageChange={handlePageChange}
              pagination={pagination}
              onDeleteItem={onDeletePatient}
              itemlist={customers}
              sharedData={CUSTOMER_SHARED_DATA}
              totalRows={totalRows}
              onOpenMenu={handelEdit}
            />
          </Else>
        </If>

        <EditSideMenu visible={isEditMenuVisible}>
          <Box p="25px" display="flex" justifyContent="space-between">
            <Typography variant="h6">
              {patient ? "Edit Patient" : "Add New Patient"}
            </Typography>
            <Close onClick={() => setIsEditMenuVisible(false)} />
          </Box>
          <Divider />
          <ADDForm
            patient={patient}
            onOpenMenu={handelEdit}
            onFetch={getPatients}
          />
        </EditSideMenu>
      </Page>
    </>
  );
}

const EditSideMenu = styled("div", {
  shouldForwardProp: prop => prop !== "visible",
})<EditMenuProps>(
  ({ visible }) => `
  width: ${visible ? "33%" : "0"};
  position: absolute;
  height: 100%;
  top: 0;
  right: ${visible ? "0" : "-46px"};
  overflow: auto;
  background: #FFF;
  z-index: 11;
  transition: width 0.5s;
  box-shadow: -4px 0px 84px rgba(0, 0, 0, 0.1);
  svg {
    cursor: pointer;
    :hover{
      stroke: black;
    }
  }
  form {
    padding: 25px;
    div {
      display: block;
    }
  }

`
);

export default CustomersPage;
