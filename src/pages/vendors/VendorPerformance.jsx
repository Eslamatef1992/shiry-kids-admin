import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Avatar, Spin, Empty, Typography, Statistic, Row, Col, Progress, Tooltip,
} from 'antd';
import { ShopOutlined, QrcodeOutlined, CheckCircleOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../../api/axios';

const { Text } = Typography;
const BASE = (import.meta.env.VITE_API_URL || 'https://back.shirykids.com/api/v1').replace('/api/v1', '');
const COLORS = ['#FF383C','#1890ff','#52c41a','#fa8c16','#722ed1','#13c2c2','#eb2f96','#faad14'];

export default function VendorPerformance() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/vendor-performance')
      .then(r => setData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalRevenue = data.reduce((s, v) => s + v.totalRevenue, 0);
  const totalScanned = data.reduce((s, v) => s + v.totalScanned, 0);
  const totalSold    = data.reduce((s, v) => s + v.totalSold,    0);

  const chartData = data.map(v => ({
    name:    v.name.length > 14 ? v.name.slice(0,14) + '…' : v.name,
    Revenue: parseFloat(v.totalRevenue.toFixed(3)),
    Scanned: v.totalScanned,
  }));

  const columns = [
    {
      title: 'Vendor',
      render: (_, r) => (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {r.logo
            ? <img src={`${BASE}${r.logo}`} alt={r.name} style={{ width:36, height:36, borderRadius:8, objectFit:'cover' }} />
            : <Avatar size={36} style={{ background:'#FF383C', borderRadius:8 }}>{r.name?.[0]}</Avatar>
          }
          <div>
            <div style={{ fontWeight:700 }}>{r.name}</div>
            <Tag color={r.status === 'active' ? 'green' : 'orange'} style={{ fontSize:10, marginTop:2 }}>{r.status}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Coupons',
      dataIndex: 'totalCoupons',
      align: 'center',
      sorter: (a,b) => a.totalCoupons - b.totalCoupons,
      render: v => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Sold',
      dataIndex: 'totalSold',
      align: 'center',
      sorter: (a,b) => a.totalSold - b.totalSold,
      render: v => <Tag color="orange">{v}</Tag>,
    },
    {
      title: 'Scanned',
      dataIndex: 'totalScanned',
      align: 'center',
      sorter: (a,b) => a.totalScanned - b.totalScanned,
      render: v => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      align: 'right',
      sorter: (a,b) => a.totalRevenue - b.totalRevenue,
      defaultSortOrder: 'descend',
      render: v => <span style={{ fontWeight:700, color:'#52c41a' }}>KD {parseFloat(v).toFixed(3)}</span>,
    },
    {
      title: 'Scanners',
      dataIndex: 'scannerCount',
      align: 'center',
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: 'Revenue Share',
      render: (_, r) => {
        const pct = totalRevenue > 0 ? Math.round((r.totalRevenue / totalRevenue) * 100) : 0;
        return (
          <Tooltip title={`${pct}% of total revenue`}>
            <Progress percent={pct} size="small" strokeColor="#FF383C" showInfo={false} style={{ minWidth: 80 }} />
          </Tooltip>
        );
      },
    },
  ];

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:400 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <>
      {/* Summary cards */}
      <Row gutter={[16,16]} style={{ marginBottom:24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius:12 }}>
            <Statistic title="Total Revenue (All Vendors)" value={totalRevenue.toFixed(3)} suffix="KD"
              prefix={<DollarOutlined style={{ color:'#52c41a' }} />} valueStyle={{ color:'#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius:12 }}>
            <Statistic title="Total Sold" value={totalSold}
              prefix={<ShopOutlined style={{ color:'#fa8c16' }} />} valueStyle={{ color:'#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius:12 }}>
            <Statistic title="Total Scanned" value={totalScanned}
              prefix={<QrcodeOutlined style={{ color:'#1890ff' }} />} valueStyle={{ color:'#1890ff' }} />
          </Card>
        </Col>
      </Row>

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <Card bordered={false} style={{ borderRadius:12, marginBottom:24 }}
          title={<span style={{ fontWeight:700 }}>Revenue by Vendor (KD)</span>}
          extra={<ReloadOutlined onClick={load} style={{ cursor:'pointer', color:'#999' }} />}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top:5, right:16, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <RTooltip />
              <Bar dataKey="Revenue" radius={[4,4,0,0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Vendor table */}
      <Card bordered={false} style={{ borderRadius:12 }}
        title={<span style={{ fontWeight:700 }}>Vendor Performance Breakdown</span>}
        extra={<ReloadOutlined onClick={load} style={{ cursor:'pointer', color:'#999' }} />}
      >
        {data.length
          ? <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
          : <Empty description="No vendor data yet" />
        }
      </Card>
    </>
  );
}
