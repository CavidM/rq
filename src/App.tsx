import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import { AppLayout } from './shared/components/layouts/AppLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import './App.css';

// Create a client configured for workshop demos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // uncomment below 2 lines together: https://tanstack.com/query/latest/docs/framework/react/guides/network-mode#network-mode-always
      // networkMode: 'always', // Always attempt requests, even when offline
      // refetchOnReconnect: true,

      retry: 0, // Retry failed requests 0 times
      // retryDelay: 2000,

      // stateTime is the time before a query is considered stale
      // staleTime: 5 * 60 * 1000, // 5 minutes

      // gc is the time before a query is garbage collected
      // gcTime: 10 * 60 * 1000, // 10 minutes
    },
    // mutations: {
      // networkMode: 'always', // Always attempt mutations, even when offline
    // },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </AppLayout>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
