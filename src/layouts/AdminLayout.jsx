import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined, UserOutlined, TeamOutlined, ShopOutlined,
  GiftOutlined, ShoppingCartOutlined, TagsOutlined, QrcodeOutlined,
  SettingOutlined, GlobalOutlined, FileTextOutlined, LogoutOutlined,
  SafetyOutlined, UsergroupAddOutlined, PercentageOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'admin-section', label: 'Administration', type: 'group', children: [
    { key: '/admins', icon: <SafetyOutlined />, label: 'Admins' },
    { key: '/roles', icon: <TeamOutlined />, label: 'Roles' },
  ]},
  { key: 'users-section', label: 'Users', type: 'group', children: [
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/vendors', icon: <ShopOutlined />, label: 'Vendors' },
  ]},
  { key: 'catalog-section', label: 'Catalog', type: 'group', children: [
    { key: '/products', icon: <ShopOutlined />, label: 'Products' },
    { key: '/coupons', icon: <GiftOutlined />, label: 'Coupons' },
    { key: '/discount-coupons', icon: <PercentageOutlined />, label: 'Discount Coupons' },
  ]},
  { key: 'orders-section', label: 'Orders', type: 'group', children: [
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/guest-orders', icon: <UsergroupAddOutlined />, label: 'Guest Orders' },
  ]},
  { key: 'scanner-section', label: 'Mobile', type: 'group', children: [
    { key: '/qr-scanner', icon: <QrcodeOutlined />, label: 'QR Scanner Logs' },
  ]},
  { key: 'system-section', label: 'System', type: 'group', children: [
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: '/seo', icon: <GlobalOutlined />, label: 'SEO' },
    { key: '/cms', icon: <FileTextOutlined />, label: 'CMS Pages' },
  ]},
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();

  const userMenu = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true }],
    onClick: ({ key }) => { if (key === 'logout') { logout(); navigate('/login'); } },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }} breakpoint="lg" collapsedWidth={60}>
        <div className="logo">🎀 Shiry Kids</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, fontSize: 13 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #f0f0f0' }}>
          <Dropdown menu={userMenu}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#FF383C' }}>{admin?.name?.[0]}</Avatar>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{admin?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
