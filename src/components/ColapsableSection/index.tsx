import { ReactNode, memo } from "react";
import { styled, Typography, Box, Divider } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ColapsableSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element => {
  return (
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
          <StyledHeader>{title}</StyledHeader>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Divider />
        {children}
      </AccordionDetails>
    </StyledAccordion>
  );
};

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

export default memo(ColapsableSection);
