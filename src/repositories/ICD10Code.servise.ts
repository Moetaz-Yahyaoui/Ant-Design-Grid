import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "~/config/axios";

export const getAllICD10Code = ({
  page,
  limit,
  searchField,
  searchValue,
}: {
  page: number;
  limit: number;
  searchField?: string;
  searchValue?: string;
}) => {
  return axios.post(
    API_URL + "/ICD10/search",
    {
      pageSize: limit,
      pageNumber: page + 1,
      searchField: searchField,
      searchValue: searchValue,
    },
    { headers: authHeader() }
  );
};

export const Get = (id: string) => {
  return axios.get(API_URL + `/ICD10/${id}`, {
    headers: authHeader(),
  });
};

export const Create = (data: any) => {
  return axios.post(API_URL + "/ICD10/Create", data, {
    headers: authHeader(),
  });
};

export const Modify = (id: string, data: any) => {
  return axios.put(API_URL + `/ICD10/update?id=${id}`, data, {
    headers: authHeader(),
  });
};

export const Delete = (id: number) => {
  return axios.delete(API_URL + `/ICD10/${id}`, {
    headers: authHeader(),
  });
};
