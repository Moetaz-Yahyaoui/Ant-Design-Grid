import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "~/config/axios";

export const getAllDropdowns = () => {
  return axios.get(API_URL + "/Dropdown/GetPatientVisitDDL", {
    headers: authHeader(),
  });
};
