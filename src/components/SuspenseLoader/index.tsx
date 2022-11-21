import { useEffect } from "react";
import NProgress from "nprogress";
import { Box, CircularProgress } from "@mui/material";

function SuspenseLoader() {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        // display: "flex",
        // alignItems: "center",
        // justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
      // display="flex"
      // alignItems="center"
      // justifyContent="center"
    >
      <CircularProgress size={24} disableShrink thickness={3} />
    </Box>
  );
}

export default SuspenseLoader;
