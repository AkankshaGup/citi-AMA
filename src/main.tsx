import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupAuthInterceptor } from "./config/axiosInstance.ts";
import { queryClient } from "./config/queryClient.ts";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'

setupAuthInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
