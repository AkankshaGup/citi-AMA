import {
  RouterProvider
} from "react-router-dom";
import { router } from "./route/route-config.jsx";
import { theme } from "./theme/muiTheme.ts";
import { ThemeProvider, CssBaseline } from "@mui/material";

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  )
}

export default App
