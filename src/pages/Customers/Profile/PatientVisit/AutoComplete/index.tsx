import { TextField, Typography, Box, styled } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactComponent as DeleteIcon } from "~/assets/icons/delete.svg";
import { getAllICD10Code } from "~/repositories/ICD10Code.servise";

const APIAutoComplete = ({
  claim,
  index,
  handleClickOpen,
  handleEditRow,
}: {
  claim?: any;
  index: number;
  handleClickOpen: (id: any, index: number) => void;
  handleEditRow: (
    id: string,
    codeid: string,
    claimDiagnosis: any,
    description: string,
    index: number
  ) => void;
}): JSX.Element => {
  const [icd10Code, setIcd10Code] = useState<any>([]);
  const [searchString, setSearchString] = useState<string>("");

  const ICDCode10Service = useRef(getAllICD10Code);

  const getOptionValue = useCallback(
    (value: string) => {
      const filtredCodes = icd10Code?.filter((code: any) => code.id == value);
      return filtredCodes?.length > 0 && filtredCodes[0];
    },
    [icd10Code]
  );

  const fetchOptions = useCallback(async () => {
    await ICDCode10Service.current({
      page: 0,
      limit: 50,
      searchField: "id",
      searchValue: `${claim.icdcodeid}`,
    }).then(
      (response: any) => {
        setIcd10Code(response.data.data);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }, [claim.icdcodeid]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleSearch = useCallback(async (value: string) => {
    if (value?.length > 1) {
      setSearchString(value);
      await ICDCode10Service.current({
        page: 0,
        limit: 50,
        searchField: "icdcode",
        searchValue: value,
      }).then(
        (response: any) => {
          setIcd10Code(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }, []);

  const getDescriptionValue = useCallback(
    (value: string) => {
      const filtredCodes = icd10Code?.filter((code: any) => code.id == value);
      return filtredCodes?.length > 0
        ? (filtredCodes[0].description as string)
        : "";
    },
    [icd10Code]
  );

  const CodeValue = useMemo(() => {
    const filtredCodes = icd10Code?.filter(
      (code: any) => code.id == claim.icdcodeid
    );
    return filtredCodes?.length > 0
      ? (`${filtredCodes[0].icdcode}` as string)
      : "";
  }, [icd10Code, claim.icdcodeid]);

  return (
    <>
      <Box
        key={claim.id}
        sx={{ cursor: "pointer" }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="55px"
        width="100%"
        gap="5px"
      >
        <Text
          width="10%"
          borderRight="1px solid #2233541a"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          {index + 1}
        </Text>
        <Box
          width="20%"
          borderRight="1px solid #2233541a"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={icd10Code}
            filterOptions={x => x}
            getOptionLabel={(option: any) =>
              option.code || searchString || CodeValue
            }
            sx={{ width: 250 }}
            isOptionEqualToValue={(option, value) =>
              option.id === value.icdcodeid
            }
            onChange={(event, value) => {
              const description = getDescriptionValue(value?.id);
              setSearchString(value?.icdcode);
              handleEditRow(claim.id, value?.id, claim, description, index);
            }}
            value={searchString || CodeValue || getOptionValue(claim.icdcodeid)}
            renderInput={params => (
              <TextField
                {...params}
                onChange={ev => handleSearch(ev.target.value)}
                size="small"
                label=""
              />
            )}
          />
        </Box>
        <Box
          width="60%"
          borderRight="1px solid #2233541a"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <StyledInput
            size="small"
            disabled
            value={getDescriptionValue(claim.icdcodeid)}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap="10px"
          width="10%"
          height="100%"
          borderRight="1px solid #2233541a"
        >
          <DeleteIcon
            style={{ cursor: "pointer" }}
            onClick={() => handleClickOpen(claim.id, index)}
          />
        </Box>
      </Box>
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

const StyledInput = styled(TextField)(
  () => `
        && {
          background: #F9F9F9;
          width: 80%;
          > div {
            height: 31px !important;
          }
        }
    `
);

export default APIAutoComplete;
