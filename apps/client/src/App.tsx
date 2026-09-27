import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TaxPayment from "@/pages/TaxPayment";
import TaxPaymentProxy from "@/pages/TaxPaymentProxy";
import TaxLookup from "@/pages/TaxLookup";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Identification from "@/pages/Identification";
import BankRegistration from "@/pages/BankRegistration";
import LinkAccount from "@/pages/LinkAccount";
import LinkAccountDetail from "@/pages/LinkAccountDetail";
import QrPage from "@/pages/QrPage";
import LoadingPage from "@/pages/LoadingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* App Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tax-payment" element={<TaxPayment />} />
            <Route path="/tax-payment-proxy" element={<TaxPaymentProxy />} />
            <Route path="/tax-lookup" element={<TaxLookup />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/identification" element={<Identification />} />
            <Route path="/bank-registration" element={<BankRegistration />} />
            <Route path="/link-account" element={<LinkAccount />} />
            <Route
              path="/link-account-detail"
              element={<LinkAccountDetail />}
            />
            <Route path="/qr" element={<QrPage />} />
          </Route>

          {/* Standalone Routes (no layout) */}
          <Route path="/loading" element={<LoadingPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
