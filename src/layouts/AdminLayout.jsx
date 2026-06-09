import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Tooltip } from 'antd';
import {
  DashboardOutlined, UserOutlined, TeamOutlined, ShopOutlined,
  GiftOutlined, ShoppingCartOutlined, TagsOutlined, QrcodeOutlined,
  SettingOutlined, GlobalOutlined, FileTextOutlined, LogoutOutlined,
  SafetyOutlined, UsergroupAddOutlined, PercentageOutlined,
  AppstoreOutlined, PictureOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';

const { Sider, Header, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const { t, lang, toggle, isRtl } = useLang();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: 'admin-section', label: t('admins'), type: 'group', children: [
      { key: '/admins', icon: <SafetyOutlined />, label: t('admins') },
      { key: '/roles', icon: <TeamOutlined />, label: t('roles') },
    ]},
    { key: 'users-section', label: t('users'), type: 'group', children: [
      { key: '/users', icon: <UserOutlined />, label: t('users') },
      { key: '/vendors', icon: <ShopOutlined />, label: t('vendors') },
    ]},
    { key: 'catalog-section', label: t('products'), type: 'group', children: [
      { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
      { key: '/products', icon: <ShopOutlined />, label: t('products') },
      { key: '/coupons', icon: <GiftOutlined />, label: t('coupons') },
      { key: '/discount-coupons', icon: <PercentageOutlined />, label: t('discountCoupons') },
    ]},
    { key: 'content-section', label: 'Content', type: 'group', children: [
      { key: '/banners', icon: <PictureOutlined />, label: 'Banners' },
    ]},
    { key: 'orders-section', label: t('orders'), type: 'group', children: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: t('orders') },
      { key: '/guest-orders', icon: <UsergroupAddOutlined />, label: t('guestOrders') },
    ]},
    { key: 'scanner-section', label: 'Mobile', type: 'group', children: [
      { key: '/qr-scanner', icon: <QrcodeOutlined />, label: t('qrScanner') },
    ]},
    { key: 'system-section', label: 'System', type: 'group', children: [
      { key: '/settings', icon: <SettingOutlined />, label: t('settings') },
      { key: '/seo', icon: <GlobalOutlined />, label: t('seo') },
      { key: '/cms', icon: <FileTextOutlined />, label: t('cms') },
    ]},
  ];

  const userMenu = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: t('logout'), danger: true }],
    onClick: ({ key }) => { if (key === 'logout') { logout(); navigate('/login'); } },
  };

  return (
    <Layout style={{ minHeight: '100vh' }} direction={isRtl ? 'rtl' : 'ltr'}>
      <Sider
        width={240}
        style={{ background: '#fff', borderRight: isRtl ? 'none' : '1px solid #f0f0f0', borderLeft: isRtl ? '1px solid #f0f0f0' : 'none' }}
        breakpoint="lg"
        collapsedWidth={60}
      >
        <div className="logo" style={{ direction: 'ltr' }}>🎀 Shiry Kids</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, fontSize: 13 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff', padding: '0 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', gap: 16,
          borderBottom: '1px solid #f0f0f0',
        }}>
          {/* Language toggle */}
          <Tooltip title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}>
            <Button
              onClick={toggle}
              style={{ fontWeight: 700, minWidth: 48 }}
              size="small"
            >
              {lang === 'en' ? 'ع' : 'EN'}
            </Button>
          </Tooltip>

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
