import { Chip } from "@mui/material";

interface StatusChipProps {
  value: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({ value }) => {
  return (
    <Chip
      label={value ? "Yes" : "No"}
      size="small"
      color={value ? "success" : "default"}
      variant={value ? "filled" : "outlined"}
      sx={{
        minWidth: 52,
        fontWeight: 600,
        borderRadius: "16px",
        fontSize: "10px",
      }}
    />
  );
};

export default StatusChip;
