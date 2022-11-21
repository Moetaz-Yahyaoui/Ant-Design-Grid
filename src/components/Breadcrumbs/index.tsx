import Link, { LinkProps } from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Get } from "~/repositories/patientVisit.service";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useParams } from "react-router";

const breadcrumbNameMap: { [key: string]: string } = {
  "/patient": "Patients",
  "/patient/add-patient": "Add Patient",
  "/insurance": "Insurance",
  "/tasks": "Tasks",
};

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

const LinkRouter = (props: LinkRouterProps) => (
  <Link {...props} component={RouterLink as any} />
);

const Breadcrumb = () => {
  const [date, setDate] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const pathnames = location.pathname.split("/").filter(x => x);
  const searchParams = new URLSearchParams(location.search);
  const vriant: "h5" | "body2" = useMemo(() => {
    return pathnames.length == 1 ? "h5" : "body2";
  }, [pathnames]);

  const visitId = searchParams.get("visitId");
  const name = searchParams.get("name");
  const fetchVisits = useCallback(async () => {
    if (visitId) {
      await Get(visitId).then(
        (response: any) => {
          const formatedDate = dayjs(response.data[0].visitdate).format(
            "MM/DD/YYYY"
          );
          setDate(` / Visit : ${formatedDate}`);
        },
        (error: any) => {
          console.log(error);
        }
      );
    } else {
      setDate("");
    }
  }, [visitId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleNavigate = useCallback(() => {
    if (name) navigate(`/${pathnames[0]}/${id}?name=${name}`);
  }, [navigate, name, id, pathnames]);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {pathnames.map((value, index) => {
        let name = null;
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        if (searchParams.has("name")) name = searchParams.get("name");

        return last ? (
          <Typography
            onClick={() => handleNavigate()}
            sx={{ cursor: "pointer" }}
            variant={vriant}
            color="text.secondary"
            key={to}
          >
            {name || breadcrumbNameMap[to] || value}
            {date || ""}
          </Typography>
        ) : (
          <LinkRouter underline="hover" color="inherit" to={to} key={to}>
            <Typography variant="h5" color="text.secondary" key={to}>
              {breadcrumbNameMap[to] || value}
            </Typography>
          </LinkRouter>
        );
      })}
    </Breadcrumbs>
  );
};
export default Breadcrumb;
