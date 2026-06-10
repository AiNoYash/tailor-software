import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage/LoginPage';
import CustomerPage from './pages/CustomerPage/CustomerPage';
import AddOrder from './pages/CustomerPage/subpages/AddOrder';
import SearchOrder from './pages/CustomerPage/subpages/SearchOrder';
import OrderReport from './pages/CustomerPage/subpages/OrderReport';
import WorkersPage from './pages/WorkersPage/WorkersPage';
import WorkersList from './pages/WorkersPage/subpages/WorkersList';
import AddWork from './pages/WorkersPage/subpages/AddWork';
import Withdrawal from './pages/WorkersPage/subpages/Withdrawal';
import Report from './pages/WorkersPage/subpages/Report';
import ExpensesPage from './pages/ExpensesPage/ExpensesPage';
import AddExpense from './pages/ExpensesPage/subpages/AddExpense';
import ExpenseReport from './pages/ExpensesPage/subpages/ExpenseReport';
import './App.css';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.user?.role);

    // Determine default page after login based on role
    const defaultPath = isAuthenticated ? '/customer' : '/login';

    return (
        <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to={defaultPath} replace />} />

            {/* Login (no layout) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Customer — accessible to admin + worker */}
            <Route
                path="/customer"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CustomerPage />
                        </Layout>
                    </ProtectedRoute>
                }
            >
                <Route index element={<AddOrder />} />
                <Route path="search" element={<SearchOrder />} />
                <Route path="report" element={<OrderReport />} />
            </Route>

            {/* Workers — admin only, has sub-pages */}
            <Route
                path="/workers"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <WorkersPage />
                        </Layout>
                    </ProtectedRoute>
                }
            >
                <Route index element={<WorkersList />} />
                <Route path="add-work" element={<AddWork />} />
                <Route path="withdrawal" element={<Withdrawal />} />
                <Route path="report" element={<Report />} />
            </Route>

            {/* Expenses — admin only */}
            <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ExpensesPage />
                        </Layout>
                    </ProtectedRoute>
                }
            >
                <Route index element={<AddExpense />} />
                <Route path="report" element={<ExpenseReport />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
