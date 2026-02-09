import {
  RouterProvider
} from "react-router-dom";
import { router } from "./route/route-config.jsx";

function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App
