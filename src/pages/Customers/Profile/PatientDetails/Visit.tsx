import { styled, Grid, Box, Typography, Divider } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as EditIcon } from "~/assets/icons/edit.svg";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { getAllDropdowns } from "~/repositories/dropdown.service";
import Modal from "@components/Modal/BasicModal";
import dayjs from "dayjs";
import { Delete } from "~/repositories/patientVisit.service";

const VisitssTable = ({
  visits,
  onFetch,
  onSelectVisit,
  onChangePage,
}: {
  visits?: any;
  onFetch: (pagination: any) => void;
  onSelectVisit: (visit?: any) => void;
  onChangePage: (id: string) => void;
}): JSX.Element => {
  const [serviceArea, setServiceArea] = useState<any>([]);
  const [visitstatus, setVisitStatus] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<number>();

  const dropDownService = useRef(getAllDropdowns);

  const fetchDropDown = useCallback(async () => {
    await dropDownService.current().then(
      (response: any) => {
        setServiceArea(response.data.serviceareas);
        setVisitStatus(response.data.visitstatus);
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

  const getStatus = useCallback(
    (statusId: number) => {
      const status = visitstatus?.filter(
        (status: any) => status.id == statusId
      );
      return status?.length > 0 ? status[0].name : statusId;
    },
    [visitstatus]
  );

  const handleClickOpen = useCallback(
    (id: any) => {
      setSelectedID(id);
      setOpen(true);
    },
    [setSelectedID, setOpen]
  );

  const handleAction = useCallback(async () => {
    await Delete(selectedID as number).then(
      async () => {
        setOpen(false);
        onFetch({
          page: 0,
          limit: 50,
        });
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }, [selectedID, setOpen, onFetch]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={"Delete Patient Visit!"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <Grid
        container
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="space-between"
        width="100%"
      >
        <Box
          sx={{ p: 1, background: "#E1E3F1" }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          height="24px"
          width="100%"
          gap="5px"
          mt="5px"
        >
          <Text width="35%">Date</Text>
          <Text width="35%">Service Location</Text>
          <Text width="20%">Status</Text>
          <Text width="10%">Actions</Text>
        </Box>
        {visits?.length > 0 &&
          visits?.map((visit: any) => (
            <>
              <Box
                key={visit.id}
                sx={{ p: 1, cursor: "pointer" }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                height="24px"
                width="100%"
                gap="5px"
                mt="5px"
                onDoubleClick={() => onChangePage(visit.id)}
              >
                <Text width="35%">
                  {dayjs(visit?.visitdate).format("MM/DD/YYYY")}
                </Text>
                <Text width="35%">{getLocation(visit?.serviceareaid)} </Text>
                <Text
                  width="20%"
                  color={
                    visit?.visitstatusid === 1
                      ? "red"
                      : visit?.visitstatusid === 2
                      ? "green"
                      : "yellow"
                  }
                >
                  {getStatus(visit?.visitstatusid)}
                </Text>
                <Box display="flex" alignItems="center" gap="5px" width="10%">
                  <EditIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectVisit(visit)}
                  />
                  <DeleteIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => handleClickOpen(visit.id)}
                  />
                </Box>
              </Box>
              <Divider />
            </>
          ))}
      </Grid>
    </>
  );
};

const Text = styled(Typography)(
  () => `
        && {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 14px;
        }
    `
);

export default VisitssTable;
