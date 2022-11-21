import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "~/config/axios";

export const getAllPatVisitClaimDiagnose = ({
  page,
  limit,
  orderBy,
}: {
  page: number;
  limit: number;
  orderBy: string;
}) => {
  return axios.post(
    API_URL + "/PatVisitClaimDiagnosis/search",
    {
      pageSize: limit,
      pageNumber: page + 1,
      orderBy: orderBy,
    },
    { headers: authHeader() }
  );
};

export const Get = (id: string) => {
  return axios.get(API_URL + `/PatVisitClaimDiagnosis/${id}`, {
    headers: authHeader(),
  });
};

export const Create = (data: any) => {
  return axios.post(API_URL + "/PatVisitClaimDiagnosis/Create", data, {
    headers: authHeader(),
  });
};

export const Modify = (id: string, data: any) => {
  return axios.put(API_URL + `/PatVisitClaimDiagnosis/update?id=${id}`, data, {
    headers: authHeader(),
  });
};

export const Delete = (id: number) => {
  return axios.delete(API_URL + `/PatVisitClaimDiagnosis/${id}`, {
    headers: authHeader(),
  });
};
