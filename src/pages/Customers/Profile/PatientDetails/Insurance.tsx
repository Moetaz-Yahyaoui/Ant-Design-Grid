import {
  Card,
  styled,
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@components/Modal/BasicModal";
import { ReactComponent as TickIcon } from "~/assets/icons/tick.svg";
import { ReactComponent as EditIcon } from "~/assets/icons/edit.svg";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Delete } from "~/repositories/patientInsurance.servise";

const Account = ({
  title,
  insurance,
  onFetch,
  onSelectInsurance,
}: {
  title: string;
  insurance?: any;
  onFetch: (pagination: any) => void;
  onSelectInsurance: (insurance: any) => void;
}): JSX.Element => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<number>();

  const getClassification = useMemo(() => {
    const classification = insurance?.classification;

    switch (classification) {
      case 1:
        return "Primary";
        break;
      case 2:
        return "Secondary";
        break;
      case 3:
        return "Triatiary";
        break;
      default:
        return "Primary";
    }
  }, [insurance]);

  const InsuranceForm = useMemo(
    () => [
      { title: "Insurance Payer", content: `${insurance?.insurancepayer}` },
      { title: "Classification", content: getClassification },
      {
        title: "Effective Date",
        content: dayjs(insurance?.effectivedate).format("MM-DD-YYYY"),
      },
      { title: "Copay", content: `${insurance?.copay}` },
    ],
    [insurance, getClassification]
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

  const handleClickOpen = useCallback(
    (id: any) => {
      setSelectedID(id);
      setOpen(true);
    },
    [setSelectedID, setOpen]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <Modal
        open={open}
        handleClose={handleClose}
        handleAction={handleAction}
        title={"Delete Insurance"}
        confirmText={"Are You Sure You Want To Delete This Item!"}
        contentText={"This action is permantly!"}
      />
      <StyledAccordion expanded={expanded}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon onClick={() => setExpanded(!expanded)} />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          onClick={e => e.stopPropagation()}
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap="5px"
            >
              <TickIcon />
              <StyledTitle>{title}</StyledTitle>
            </Box>

            <AccordionActions>
              <EditIcon onClick={() => onSelectInsurance(insurance)} />
              <DeleteIcon
                onClick={() => handleClickOpen(insurance?.id)}
                fontSize="small"
              />
            </AccordionActions>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Divider />
          <Grid
            sx={{ p: 2 }}
            container
            spacing={2}
            // direction="row"
            justifyContent="space-between"
            alignItems="self-start"
          >
            {InsuranceForm.map((field, index) => (
              <>
                <Grid
                  columns={{ xs: 1, sm: 1, md: 1 }}
                  key={index}
                  item
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                  width="50%"
                >
                  <Box display="flex" gap="24px">
                    <StyledTitle fontWeight="600">
                      {`${field.title}: `}{" "}
                    </StyledTitle>
                  </Box>
                </Grid>
                <Grid
                  columns={{ xs: 1, sm: 1, md: 1 }}
                  key={`${index} 2`}
                  item
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                  width="50%"
                >
                  <Box display="flex" gap="24px" key={index}>
                    <StyledTitle>{`${field.content}`} </StyledTitle>
                  </Box>
                </Grid>
              </>
            ))}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    </>
  );
};

const StyledAccordion = styled(Accordion)(
  () => `
    && {
      border-radius: 0;
      background: #AFE5F9;
      > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 35px;
        padding: 0px 5px;
      }
    }
`
);

const StyledTitle = styled(Typography)(
  () => `
    && {
      font-style: normal;
      font-weight: 400;
      font-size: 10.1818px;
      line-height: 12px;
    }
`
);

export default Account;
