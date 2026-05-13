import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ProposalsList from "./pages/ProposalsList";
import ProposalEditor from "./pages/ProposalEditor";
import ProposalPreview from "./pages/ProposalPreview";
import ProposalPdfPreview from "./pages/ProposalPdfPreview";
import ProposalAnalytics from "./pages/ProposalAnalytics";
import Notifications from "./pages/Notifications";
import Clients from "./pages/Clients";
import SharedProposal from "./pages/SharedProposal";
import Login from "./pages/Login";
import Signup from "./pages/AddUser";
import NotFound from "./pages/NotFound";
import UserList from "./pages/UserList";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import AddUser from "./pages/AddUser";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/share/:projectCategory/:token" element={<SharedProposal />} />
          
          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/proposals" element={<ProposalsList />} />
              <Route path="/proposals/new" element={<ProposalEditor />} />
              <Route path="/proposals/:id/edit" element={<ProposalEditor />} />
              <Route path="/proposals/:category/:id/preview" element={<ProposalPreview />} />
              <Route path="/proposals/:id/preview" element={<ProposalPreview />} />
              <Route path="/proposals/:category/:id/preview-pdf" element={<ProposalPdfPreview />} />
              <Route path="/proposals/:id/preview-pdf" element={<ProposalPdfPreview />} />
              {/* <Route path="/share/:shareId" element={<SharedProposal />} /> */}
              <Route path="/proposals/:id/analytics" element={<ProposalAnalytics />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/clients" element={<Clients />} />

              <Route path="/user-list" element={<UserList />} />
              <Route path="/user-list/create-user" element={<AddUser />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
