import * as Yup from "yup";
import {
  useState,
  forwardRef,
  useEffect,
  useCallback,
  FC,
  useContext,
  useRef,
  useMemo,
} from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Divider, Box, styled, Snackbar, MenuItem } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SnackbarOrigin } from "@mui/material/Snackbar";

import { MethodeType, IDefaultValuesProducts as IDefaultValues } from "~/types";
import { FormInput, FormProvider } from "@components/hook-form";
import { Create, Modify } from "~/repositories/notes.service";
import { Create as CreatePatientNote } from "~/repositories/patientsNotes.service";
import { AuthContext } from "~/contexts/authContext";
import { useParams } from "react-router";
import { getAllNoteTypes } from "~/repositories/noteType.service";
import { getAllNotePriorities } from "~/repositories/notePriority.service";
import FormSelect from "~/components/hook-form/RHSelectDropDown";
import {
  CancelButton,
  SaveButton,
  StyledLabel,
} from "~/pages/Customers/AddCustomers/AddForm";

enum InputType {
  TextField = "textField",
  Select = "select",
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface State extends SnackbarOrigin {
  open: boolean;
}

const StyledInput = styled(FormInput)(
  () => `
      && {
        margin-top: 0;
        background: #F9F9F9;
         textarea {
          height: 80px !important;
        }
      }
  `
);

const StyledSelect = styled(FormSelect)(
  () => `
      && {
        background: #F9F9F9;
        border: 1px solid #E3E3ED;
        border-radius: 10px;
        padding: 0px !important;
      }
  `
);

const FormInputList = [
  { name: "Note", field: "note", type: InputType.TextField },
  { name: "Type", field: "notetype", type: InputType.Select },
  { name: "Priority", field: "notepriorityid", type: InputType.Select },
];

const NoteForm: FC<any> = ({ notes, pagination, onClose, onFetchData }) => {
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "right",
  });

  const [noteType, setNoteType] = useState<any>([]);
  const [notePriority, setNotePriority] = useState<any>([]);

  const noteTypeService = useRef(getAllNoteTypes);
  const notePriorityService = useRef(getAllNotePriorities);

  const fetchNoteTypes = useCallback(
    async (pagination: any) => {
      await noteTypeService.current(pagination).then(
        (response: any) => {
          setNoteType(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [noteTypeService, setNoteType]
  );

  useEffect(() => {
    fetchNoteTypes({
      page: 0,
      limit: 50,
    });
  }, [fetchNoteTypes]);

  const fetchNotePriority = useCallback(
    async (pagination: any) => {
      await notePriorityService.current(pagination).then(
        (response: any) => {
          setNotePriority(response.data.data);
        },
        (error: any) => {
          console.log(error);
        }
      );
    },
    [notePriorityService, setNotePriority]
  );

  useEffect(() => {
    fetchNotePriority({
      page: 0,
      limit: 50,
    });
  }, [fetchNotePriority]);

  const { user } = useContext(AuthContext);

  const { id } = useParams();

  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  const handleOpen = useCallback(() => {
    setState({ ...state, open: true });
  }, [state]);

  const DEFAULT_VALUES: any = useMemo(() => {
    return {
      note: "",
    };
  }, []);

  const RegisterSchema = Yup.object().shape({
    note: Yup.string().required("Name is required"),
  });

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const resetAsyncForm = useCallback(
    async (note: IDefaultValues) => {
      reset(note);
    },
    [reset]
  );

  // console.log("notes", notes);

  useEffect(() => {
    if (notes) {
      resetAsyncForm(notes as unknown as IDefaultValues);
    } else {
      resetAsyncForm(DEFAULT_VALUES as unknown as IDefaultValues);
    }
  }, [notes, resetAsyncForm, DEFAULT_VALUES]);

  console.log("notes", notes);

  const onSubmit = useCallback(
    async (data: IDefaultValues) => {
      if (notes) {
        await Modify(notes.id, {
          ...data,
          createdBy: user.id,
        }).then(
          async () => {
            onClose();
            handleOpen();
            onFetchData(pagination);
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      } else {
        await Create({
          ...data,
          followupdate: new Date(),
          claimid: null,
        }).then(
          async response => {
            await CreatePatientNote({
              ...data,
              createdBy: user.id,
              patientid: id,
              noteid: response.data.result.id,
            }).then(
              async () => {
                onClose();
                handleOpen();
                onFetchData(pagination);
              },
              (error: any) => {
                console.log("error", error);
              }
            );
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    },
    [handleOpen, onFetchData, notes, user, id, pagination, onClose]
  );

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        key={vertical + horizontal}
      >
        <Alert severity="success">Saved!</Alert>
      </Snackbar>
      <FormProvider
        methods={methods as unknown as MethodeType}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ pb: 3 }} display="flex" flexDirection="column" gap="20px">
          {FormInputList.map((field, index) => (
            <Box key={index} display="flex !important" gap="59px">
              <StyledLabel>{field.name}</StyledLabel>
              {field.type === InputType.TextField ? (
                <StyledInput
                  key={index}
                  name={field.field}
                  multiline={field.name === "Note" || field.name === "Action"}
                  // label={field.name}
                  placeholder={`${field.name}...`}
                />
              ) : (
                <Box>
                  {field.name === "Type" ? (
                    <StyledSelect
                      // label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                      defaultValue={notes?.notetype}
                    >
                      {noteType.length > 0 &&
                        noteType?.map((type: any) => (
                          <MenuItem key={type?.id} value={type?.notetype}>
                            {type?.notetype}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  ) : (
                    <StyledSelect
                      // label={field.name}
                      name={field.field}
                      placeholder={`${field.name}...`}
                      defaultValue={notes && 2}
                    >
                      {notePriority.length > 0 &&
                        notePriority?.map((priority: any) => (
                          <MenuItem key={priority?.id} value={priority?.id}>
                            {priority?.priority}
                          </MenuItem>
                        ))}
                    </StyledSelect>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
        <Box>
          <Divider />
          <Box
            display="flex !important"
            justifyContent="end"
            p="18px 0"
            gap="15px"
          >
            <SaveButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Save
            </SaveButton>
            <CancelButton
              onClick={() => onClose()}
              size="large"
              type="reset"
              variant="contained"
            >
              Cancel
            </CancelButton>
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default NoteForm;
