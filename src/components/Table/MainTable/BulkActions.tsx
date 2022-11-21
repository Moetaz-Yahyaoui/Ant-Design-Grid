import {
  useState,
  useRef,
  FC,
  useCallback,
  ReactNode,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Menu,
  ListItemText,
  ListItem,
  List,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  styled,
  Paper,
  Divider,
  InputBase,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import { ReactComponent as AddIcon } from "~/assets/icons/add.svg";

const StyledSearch = styled(Paper)(
  () => `
  border-bottom: 1px solid #000;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  width: 278px !important;
`
);

const IconCustomButton = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) => (
  <IconButton color="primary" onClick={onClick} sx={{ ml: 1, p: 1 }}>
    {children}
  </IconButton>
);

IconCustomButton.displayName = "IconCustomButton";

interface IBulkActions {
  onHandleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  AddItemAction: () => void;
  onOpenMenu: (record?: any) => void;
  title: string;
}

const BulkActions: FC<IBulkActions> = ({
  onHandleSearch,
  AddItemAction,
  onOpenMenu,
  title,
}) => {
  const [onMenuOpen, menuOpen] = useState<boolean>(false);

  const moreRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const openMenu = useCallback((): void => {
    menuOpen(true);
  }, []);

  const closeMenu = (): void => {
    menuOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="h5" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <StyledSearch
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 200,
            }}
          >
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search..."
              inputProps={{ "aria-label": "search...." }}
              onChange={onHandleSearch}
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          </StyledSearch>
          <IconCustomButton onClick={() => onOpenMenu()}>
            <AddIcon />
          </IconCustomButton>
        </Box>
      </Box>
      <Menu
        keepMounted
        anchorEl={moreRef.current}
        open={onMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
      >
        <List sx={{ p: 1 }} component="nav">
          <ListItem button>
            <ListItemText primary="Bulk delete selected" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Bulk edit selected" />
          </ListItem>
        </List>
      </Menu>
    </>
  );
};

export default BulkActions;
