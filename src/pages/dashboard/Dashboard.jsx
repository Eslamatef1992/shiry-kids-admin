import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Avatar } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ShopOutlined, DollarOutlined,
  ArrowUpOutlined, GiftOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../api/axios';

const PRIMARY = '#FF383C';
const COLORS = {
  processing: '#6C5CE7',
  shipped: '#54A0FF',
  arrived: '#2ED573',
  cancelled: '#FF383C',
};
const STATUS_TAG = {
  processing: 'purple',
  shipped: 'blue',
  arrived: 'green',
  cancelled: 'red',
  paid: 'green',
  pending: 'gold',
  failed: 'red',
  refunded: 'default',
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders', { params: { page: 1, limit: 5 } }),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.data || {});
      setOrders(ordersRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Total Revenue',
      value: `KD ${parseFloat(stats.revenue || 0).toFixed(3)}`,
      icon: <DollarOutlined />,
      bg: '#FFEDEE', color: PRIMARY,
    },
    {
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString(),
      icon: <ShoppingCartOutlined />,
      bg: '#EEF1FF', color: '#6C5CE7',
    },
    {
      title: 'Total Customers',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: <UserOutlined />,
      bg: '#E8F8F0', color: '#2ED573',
    },
    {
      title: 'Total Products',
      value: (stats.totalProducts || 0).toLocaleString(),
      icon: <ShopOutlined />,
      bg: '#FFF6E5', color: '#FFA940',
    },
  ];

  const monthlyOrders = stats.monthlyOrders || [];

  const statusCounts = stats.orderStatusCounts || { processing: 0, shipped: 0, arrived: 0, cancelled: 0 };
  const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
  const pieData = [
    { name: 'Processing', key: 'processing', value: statusCounts.processing },
    { name: 'Shipped', key: 'shipped', value: statusCounts.shipped },
    { name: 'Arrived', key: 'arrived', value: statusCounts.arrived },
    { name: 'Cancelled', key: 'cancelled', value: statusCounts.cancelled },
  ];

  const orderColumns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number', render: (v) => <b>{v}</b> },
    {
      title: 'Customer', key: 'customer',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28} style={{ background: PRIMARY }}>{r.user?.name?.[0] || '?'}</Avatar>
          <span>{r.user?.name || 'Guest'}</span>
        </div>
      ),
    },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (v) => `KD ${parseFloat(v).toFixed(3)}` },
    {
      title: 'Payment', dataIndex: 'payment_status', key: 'payment_status',
      render: (v) => <Tag color={STATUS_TAG[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'order_status', key: 'order_status',
      render: (v) => <Tag color={STATUS_TAG[v] || 'default'}>{v}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 26, margin: 0 }}>Dashboard</h2>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]}>
        {cards.map(c => (
          <Col key={c.title} xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: c.color, marginBottom: 14,
              }}>
                {c.icon}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>{c.value}</div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>{c.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart + donut */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Statistics of Orders</h3>
              <p style={{ color: '#999', fontSize: 13, margin: '4px 0 0' }}>Order growth over the last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,56,60,0.06)' }} />
                <Bar dataKey="count" name="Orders" fill={PRIMARY} radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Order Status</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={200} height={200}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div style={{ marginTop: 8 }}>
              {pieData.map(p => (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[p.key], display: 'inline-block' }} />
                    <span style={{ fontSize: 13 }}>{p.name}</span>
                  </div>
                  <b style={{ fontSize: 13 }}>{Math.round((p.value / totalStatus) * 100)}%</b>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent orders */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Recent Orders</h3>
            </div>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
