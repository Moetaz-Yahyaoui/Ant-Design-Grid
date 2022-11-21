import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "~/config/axios";

export const getAllPatVisitOther = ({
  page,
  limit,
  searchField,
  searchValue,
}: {
  page?: number;
  limit?: number;
  searchField?: string;
  searchValue?: number;
}) => {
  return axios.post(
    API_URL + "/PatVisitOther/search",
    {
      searchField,
      searchValue,
      pageSize: limit,
      pageNumber: page,
    },
    { headers: authHeader() }
  );
};

export const Get = (id: string) => {
  return axios.get(API_URL + `/PatVisitOther/${id}`, {
    headers: authHeader(),
  });
};

export const Create = (data: any) => {
  return axios.post(API_URL + "/PatVisitOther/Create", data, {
    headers: authHeader(),
  });
};

export const Modify = (id: string, data: any) => {
  return axios.put(API_URL + `/PatVisitOther/update?id=${id}`, data, {
    headers: authHeader(),
  });
};

export const Delete = (id: number) => {
  return axios.delete(API_URL + `/PatVisitOther/${id}`, {
    headers: authHeader(),
  });
};
