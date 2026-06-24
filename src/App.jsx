import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { canAccess } from './utils/permissions';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AdminList from './pages/admins/AdminList';
import RoleList from './pages/roles/RoleList';
import UserList from './pages/users/UserList';
import VendorList from './pages/vendors/VendorList';
import ProductList from './pages/products/ProductList';
import CouponList from './pages/coupons/CouponList';
import CouponCategoryList from './pages/coupons/CouponCategoryList';
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

// Blocks access to a route's element unless the logged-in admin's role
// permissions allow the current path (see src/utils/permissions.js).
// Mirrors the backend's per-route permission guards.
const RequirePermission = ({ children }) => {
  const { admin } = useAuth();
  const location = useLocation();
  if (!canAccess(admin, location.pathname)) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontWeight: 800 }}>Access Denied</h2>
        <p style={{ color: '#999' }}>You don't have permission to view this page.</p>
      </div>
    );
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><AdminLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="admins" element={<RequirePermission><AdminList /></RequirePermission>} />
            <Route path="roles" element={<RequirePermission><RoleList /></RequirePermission>} />
            <Route path="users" element={<RequirePermission><UserList /></RequirePermission>} />
            <Route path="vendors" element={<RequirePermission><VendorList /></RequirePermission>} />
            <Route path="categories" element={<RequirePermission><CategoryList /></RequirePermission>} />
            <Route path="banners" element={<RequirePermission><BannerList /></RequirePermission>} />
            <Route path="ads" element={<RequirePermission><AdList /></RequirePermission>} />
            <Route path="products" element={<RequirePermission><ProductList /></RequirePermission>} />
            <Route path="coupons" element={<RequirePermission><CouponList /></RequirePermission>} />
            <Route path="coupon-categories" element={<RequirePermission><CouponCategoryList /></RequirePermission>} />
            <Route path="orders" element={<RequirePermission><OrderList /></RequirePermission>} />
            <Route path="guest-orders" element={<RequirePermission><GuestOrderList /></RequirePermission>} />
            <Route path="discount-coupons" element={<RequirePermission><DiscountCouponList /></RequirePermission>} />
            <Route path="qr-scanner" element={<RequirePermission><QRScannerLog /></RequirePermission>} />
            <Route path="qr-generator" element={<RequirePermission><QrGenerator /></RequirePermission>} />
            <Route path="settings" element={<RequirePermission><Settings /></RequirePermission>} />
            <Route path="seo" element={<RequirePermission><SeoList /></RequirePermission>} />
            <Route path="cms" element={<RequirePermission><CmsList /></RequirePermission>} />
            <Route path="notifications" element={<RequirePermission><NotificationList /></RequirePermission>} />
            <Route path="landing-page" element={<RequirePermission><LandingPage /></RequirePermission>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
