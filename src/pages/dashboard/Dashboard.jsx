import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, DollarOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const cards = [
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: <ShoppingCartOutlined />, color: '#FF383C' },
    { title: "Today's Orders", value: stats.todayOrders || 0, icon: <ShoppingCartOutlined />, color: '#52c41a' },
    { title: 'Total Users', value: stats.totalUsers || 0, icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Total Vendors', value: stats.totalVendors || 0, icon: <ShopOutlined />, color: '#faad14' },
    { title: 'Products', value: stats.totalProducts || 0, icon: <ShopOutlined />, color: '#722ed1' },
    { title: 'Revenue (KD)', value: parseFloat(stats.revenue || 0).toFixed(3), icon: <DollarOutlined />, color: '#13c2c2' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontWeight: 800 }}>Dashboard</h2>
      <Row gutter={[16,16]}>
        {cards.map(c => (
          <Col key={c.title} xs={24} sm={12} lg={8}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title={c.title} value={c.value} prefix={React.cloneElement(c.icon, { style: { color: c.color } })} valueStyle={{ color: c.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
