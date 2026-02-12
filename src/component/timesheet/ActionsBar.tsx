import { Box, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export function ActionsBar(props: {
  onSubmit: () => void;
  saveDisabled: boolean;
}) {
  const { onSubmit, saveDisabled } = props;

  return (
    <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
      <Button variant="contained" endIcon={<SendIcon />} onClick={onSubmit} disabled={saveDisabled}>
        Submit
      </Button>
    </Box>
  );
}
