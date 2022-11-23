import axios from "axios";
import { API_URL } from "~/config/axios";

const PATIENTS = [
  {
    patientnumber: "(+3) 000-006-7868",
    firstname: "Pauly",
    middlename: "NULL",
    lastname: "Williams",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "2022-11-07T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "MA",
    zip: "test 2",
    id: 4,
  },
  {
    patientnumber: "mo00001",
    firstname: "Roderick",
    middlename: "T.",
    lastname: "Williams",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1983-08-08T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "MA",
    zip: "test 1",
    id: 5,
  },
  {
    patientnumber: "mo00003",
    firstname: "Lenny",
    middlename: "NULL",
    lastname: "Harris",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1997-11-21T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "test 1",
    zip: "test 1",
    id: 6,
  },
  {
    patientnumber: "mo00004",
    firstname: "Quincy",
    middlename: "NULL",
    lastname: "Harris",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "2000-04-20T00:00:00",
    address1: "test 1",
    address2: "test 1 2 3",
    city: "test 1",
    state: "test 1",
    zip: "test 1",
    id: 7,
  },
  {
    patientnumber: "mo00004",
    firstname: "Timothy",
    middlename: "D.",
    lastname: "Harris",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1990-11-23T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "test 1",
    zip: "test 1",
    id: 8,
  },
  {
    patientnumber: "mo00005",
    firstname: "Corinthians",
    middlename: "NULL",
    lastname: "Horton",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1981-08-12T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "test 1",
    zip: "test 1",
    id: 9,
  },
  {
    patientnumber: "mo00006",
    firstname: "Willie",
    middlename: "E.",
    lastname: "Huff",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1986-10-21T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "test 1",
    zip: "test 1",
    id: 10,
  },
  {
    patientnumber: "38738993",
    firstname: "Abd Elfatteh",
    middlename: "M.",
    lastname: "Yahyaoui",
    suffix: "test",
    dateofbirth: "1964-01-22T00:00:00",
    address1: "14, Imam Abou Hanifa, Apr. B5",
    city: "La Marsa",
    state: "mourouj",
    zip: "2078",
    id: 12,
  },
  {
    patientnumber: "38738993",
    firstname: "Devon",
    middlename: "NULL",
    lastname: "Leach",
    dateofbirth: "1992-11-05T00:00:00",
    city: "marsa",
    state: "mourouj",
    id: 14,
  },
  {
    patientnumber: "38738993",
    firstname: "Abd Elfatteh",
    middlename: "G.",
    lastname: "Yahyaoui",
    dateofbirth: "1983-09-16T00:00:00",
    city: "La Marsa",
    state: "test 1",
    id: 15,
  },
  {
    patientnumber: "38738993",
    firstname: "Ricky",
    middlename: "NULL",
    lastname: "Lewis",
    dateofbirth: "1981-06-11T00:00:00",
    city: "test",
    state: "test 1",
    id: 16,
  },
  {
    patientnumber: "38738993",
    firstname: "Myriam",
    middlename: "C.",
    lastname: "Morrison",
    dateofbirth: "1954-10-22T00:00:00",
    city: "test 1",
    state: "mourouj",
    id: 17,
  },
  {
    patientnumber: "38738993",
    firstname: "Latasha",
    middlename: "N.",
    lastname: "Oswalt",
    dateofbirth: "1983-05-07T00:00:00",
    city: "test",
    state: "mourouj",
    id: 18,
  },
  {
    patientnumber: "38738993",
    firstname: "Cara",
    middlename: "NULL",
    lastname: "Rand",
    dateofbirth: "1984-12-20T00:00:00",
    city: "test",
    state: "mourouj",
    id: 19,
  },
  {
    patientnumber: "38738993",
    firstname: "Britney",
    middlename: "T",
    lastname: "Wolfe",
    dateofbirth: "1990-06-26T00:00:00",
    city: "test",
    state: "mourouj",
    id: 20,
  },
];

const ONE_PATIENT = [
  {
    patientnumber: "mo00001",
    firstname: "Roderick",
    middlename: "T.",
    lastname: "Williams",
    suffix: "test 1",
    ssn: "test 1",
    dateofbirth: "1983-08-08T00:00:00",
    address1: "test 1",
    address2: "test 1",
    city: "test 1",
    state: "MA",
    zip: "test 1",
    id: 5,
  },
];

export const getAllPatient = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return PATIENTS;
};

export const Get = (id: string) => {
  return ONE_PATIENT;
};

export const Create = (data: any) => {
  return axios.post(API_URL + "/Patient/Create", data);
};

export const Modify = (id: string, data: any) => {
  return axios.put(API_URL + `/Patient/update?id=${id}`, data);
};

export const Delete = (id: number) => {
  return axios.delete(API_URL + `/Patient/${id}`);
};
