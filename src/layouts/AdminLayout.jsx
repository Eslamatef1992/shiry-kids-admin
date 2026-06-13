import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Tooltip, Input, Badge, ConfigProvider } from 'antd';
import {
  DashboardOutlined, UserOutlined, TeamOutlined, ShopOutlined,
  GiftOutlined, ShoppingCartOutlined, TagsOutlined, QrcodeOutlined,
  SettingOutlined, GlobalOutlined, FileTextOutlined, LogoutOutlined,
  SafetyOutlined, UsergroupAddOutlined, PercentageOutlined,
  AppstoreOutlined, PictureOutlined, BellOutlined, SearchOutlined,
  NotificationOutlined, LayoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';

const { Sider, Header, Content } = Layout;

const SIDER_BG = '#1A1A2E';
const PRIMARY = '#FF383C';

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
      { key: '/ads', icon: <BellOutlined />, label: 'Ads' },
      { key: '/notifications', icon: <NotificationOutlined />, label: 'Notifications' },
      { key: '/landing-page', icon: <LayoutOutlined />, label: 'Landing Page' },
    ]},
    { key: 'orders-section', label: t('orders'), type: 'group', children: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: t('orders') },
      { key: '/guest-orders', icon: <UsergroupAddOutlined />, label: t('guestOrders') },
    ]},
    { key: 'scanner-section', label: 'Mobile', type: 'group', children: [
      { key: '/qr-scanner', icon: <QrcodeOutlined />, label: t('qrScanner') },
      { key: '/qr-generator', icon: <QrcodeOutlined />, label: 'QR Generator' },
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
        style={{ background: SIDER_BG }}
        breakpoint="lg"
        collapsedWidth={60}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 20px 16px', direction: 'ltr',
        }}>
          <img src="/logo.png" alt="Shiry Kids" style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 800, lineHeight: 1.1 }}>Shiry Kids</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>
        <ConfigProvider theme={{ components: { Menu: {
          darkItemBg: SIDER_BG,
          darkItemSelectedBg: PRIMARY,
          darkItemSelectedColor: '#fff',
          darkItemHoverBg: 'rgba(255,56,60,0.15)',
          darkItemColor: 'rgba(255,255,255,0.65)',
          darkGroupTitleColor: 'rgba(255,255,255,0.35)',
          itemBorderRadius: 10,
          itemMarginInline: 12,
        } } }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, fontSize: 13, background: 'transparent' }}
          />
        </ConfigProvider>
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff', padding: '0 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            placeholder="Search anything.."
            style={{ maxWidth: 360, borderRadius: 10, background: '#f5f5f7' }}
            variant="filled"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

            <Badge count={0} size="small">
              <Button shape="circle" icon={<BellOutlined />} />
            </Badge>

            <Dropdown menu={userMenu}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar style={{ background: PRIMARY }}>{admin?.name?.[0]}</Avatar>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{admin?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: 24, background: '#f5f6fa' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
