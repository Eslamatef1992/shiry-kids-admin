import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AdminList from './pages/admins/AdminList';
import RoleList from './pages/roles/RoleList';
import UserList from './pages/users/UserList';
import VendorList from './pages/vendors/VendorList';
import ProductList from './pages/products/ProductList';
import CouponList from './pages/coupons/CouponList';
import OrderList from './pages/orders/OrderList';
import GuestOrderList from './pages/guestOrders/GuestOrderList';
import DiscountCouponList from './pages/discountCoupons/DiscountCouponList';
import QRScannerLog from './pages/qrScanner/QRScannerLog';
import Settings from './pages/settings/Settings';
import SeoList from './pages/seo/SeoList';
import CmsList from './pages/cms/CmsList';
import CategoryList from './pages/categories/CategoryList';
import BannerList from './pages/banners/BannerList';
import AdList from './pages/ads/AdList';
import NotificationList from './pages/notifications/NotificationList';
import LandingPage from './pages/landingPage/LandingPage';
import QrGenerator from './pages/qrGenerator/QrGenerator';

const Protected = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="admins" element={<AdminList />} />
            <Route path="roles" element={<RoleList />} />
            <Route path="users" element={<UserList />} />
            <Route path="vendors" element={<VendorList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="ads" element={<AdList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="coupons" element={<CouponList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="guest-orders" element={<GuestOrderList />} />
            <Route path="discount-coupons" element={<DiscountCouponList />} />
            <Route path="qr-scanner" element={<QRScannerLog />} />
            <Route path="qr-generator" element={<QrGenerator />} />
            <Route path="settings" element={<Settings />} />
            <Route path="seo" element={<SeoList />} />
            <Route path="cms" element={<CmsList />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="landing-page" element={<LandingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
