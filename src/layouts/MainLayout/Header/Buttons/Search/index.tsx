import { Divider, IconButton, Paper, InputBase, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const StyledSearch = styled(Paper)(
  () => `
  border-bottom: 1px solid #000;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`
);

function HeaderSearch() {
  return (
    <StyledSearch
      sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 200 }}
    >
      <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search..."
        inputProps={{ "aria-label": "search...." }}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    </StyledSearch>
  );
}

export default HeaderSearch;
