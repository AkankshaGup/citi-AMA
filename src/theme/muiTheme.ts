import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: "ProximaNova-Semibold, Arial, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "ProximaNova-Semibold, Arial, sans-serif",
        },
      },
    },
  },
});
