import { FC, ReactNode } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { TextField, TextFieldProps, MenuItem } from "@mui/material";

type IRHFTextField = {
  name: string;
  children: ReactNode;
} & TextFieldProps;

const FormSelect: FC<IRHFTextField> = ({ name, children, ...other }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          select
          {...field}
          size="small"
          fullWidth
          value={
            typeof field.value === "number" && field.value === 0
              ? ""
              : field.value
          }
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {children}
        </TextField>
      )}
    />
  );
};

export default FormSelect;
