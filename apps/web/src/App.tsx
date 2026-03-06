import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ImportCsvPage from "./pages/ImportCsvPage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/import" element={<ImportCsvPage />} />
    </Routes>
  );
};

export default App;

