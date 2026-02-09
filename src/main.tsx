import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {setupAuthInterceptor } from "./api/axiosInstance.ts";
import App from './App.tsx'

setupAuthInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
