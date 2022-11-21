import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "~/config/axios";

export const getAllCPTCode = ({
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
    API_URL + "/CPTCode/search",
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
  return axios.get(API_URL + `/CPTCode/${id}`, {
    headers: authHeader(),
  });
};

export const Create = (data: any) => {
  return axios.post(API_URL + "/CPTCode/Create", data, {
    headers: authHeader(),
  });
};

export const Modify = (id: string, data: any) => {
  return axios.put(API_URL + `/CPTCode/update?id=${id}`, data, {
    headers: authHeader(),
  });
};

export const Delete = (id: number) => {
  return axios.delete(API_URL + `/CPTCode/${id}`, {
    headers: authHeader(),
  });
};
