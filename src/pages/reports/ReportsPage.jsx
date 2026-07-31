import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Row, Col, Table, Tabs, Select, Input, DatePicker,
  Button, Space, Tag, Statistic, Empty, Spin, Typography,
} from 'antd';
import {
  DownloadOutlined, SearchOutlined, ReloadOutlined,
  ShoppingOutlined, DollarOutlined, UserOutlined, FileTextOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

function exportCsv(rows) {
  const headers = ['Assigned Date', 'Coupon', 'Price (KD)', 'Customer Name', 'Customer Phone', 'Order Number', 'Order Type', 'Status'];
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.assigned_at ? dayjs(r.assigned_at).format('YYYY-MM-DD HH:mm') : '',
      `"${r.coupon_title || ''}"`,
      r.coupon_price || 0,
      `"${r.customer_name || ''}"`,
      r.customer_phone || '',
      r.order_number || '',
      r.order_type || '',
      r.status || '',
    ].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-report-${dayjs().format('YYYY-MM-DD')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [coupons, setCoupons] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState(null);
  const [couponId, setCouponId] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/coupons').then(r => setCoupons(r.data.data));
    fetchReport();
  }, []);

  const fetchReport = useCallback(() => {
    setLoading(true);
    const params = {};
    if (dateRange?.[0]) params.from = dateRange[0].format('YYYY-MM-DD');
    if (dateRange?.[1]) params.to   = dateRange[1].format('YYYY-MM-DD');
    if (couponId)   params.coupon_id  = couponId;
    if (orderType)  params.order_type = orderType;
    if (search.trim()) params.search  = search.trim();

    api.get('/admin/reports/sales', { params })
      .then(r => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateRange, couponId, orderType, search]);

  const summary = report?.summary || {};

  // ── By Coupon columns ────────────────────────────────────────────────────
  const couponCols = [
    { title: 'Coupon', dataIndex: 'title', render: v => <strong>{v}</strong> },
    { title: 'Unit Price', dataIndex: 'price', render: v => `${v} KD` },
    { title: 'Sold', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
    { title: 'Revenue', dataIndex: 'revenue', render: v => <Tag color="green">{v} KD</Tag>, sorter: (a, b) => a.revenue - b.revenue },
  ];

  // ── By Date columns ──────────────────────────────────────────────────────
  const dateCols = [
    { title: 'Date', dataIndex: 'date', render: v => <strong>{v}</strong>, sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: 'Sold', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
    { title: 'Revenue', dataIndex: 'revenue', render: v => <Tag color="blue">{v} KD</Tag>, sorter: (a, b) => a.revenue - b.revenue },
  ];

  // ── By Customer columns ──────────────────────────────────────────────────
  const customerCols = [
    { title: 'Name', dataIndex: 'customer_name', render: v => v || '—' },
    { title: 'Phone', dataIndex: 'customer_phone', render: v => v || '—' },
    { title: 'Purchased', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
    { title: 'Total Spent', dataIndex: 'revenue', render: v => <Tag color="purple">{v} KD</Tag>, sorter: (a, b) => a.revenue - b.revenue },
  ];

  // ── Detailed columns ─────────────────────────────────────────────────────
  const detailCols = [
    { title: 'Date', dataIndex: 'assigned_at', render: v => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—', sorter: (a, b) => new Date(a.assigned_at) - new Date(b.assigned_at) },
    { title: 'Coupon', dataIndex: 'coupon_title' },
    { title: 'Price', dataIndex: 'coupon_price', render: v => `${v} KD` },
    { title: 'Customer', dataIndex: 'customer_name', render: (v, r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{v || '—'}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{r.customer_phone}</div>
      </div>
    )},
    { title: 'Order #', dataIndex: 'order_number', render: v => <code style={{ fontSize: 11 }}>{v}</code> },
    { title: 'Type', dataIndex: 'order_type', render: v => <Tag color={v === 'order' ? 'blue' : 'orange'}>{v === 'order' ? 'Registered' : 'Guest'}</Tag> },
    { title: 'Status', dataIndex: 'status', render: v => <Tag color={v === 'used' ? 'default' : 'orange'}>{v}</Tag> },
  ];

  const tabs = [
    {
      key: 'by_coupon',
      label: 'By Coupon',
      children: (
        <Table
          dataSource={report?.by_coupon || []}
          columns={couponCols}
          rowKey="coupon_id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          summary={pageData => {
            const total = pageData.reduce((s, r) => s + r.revenue, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}><strong>{pageData.reduce((s,r)=>s+r.count,0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><Tag color="green"><strong>{total.toFixed(3)} KD</strong></Tag></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      ),
    },
    {
      key: 'by_date',
      label: 'By Date',
      children: (
        <Table
          dataSource={report?.by_date || []}
          columns={dateCols}
          rowKey="date"
          pagination={{ pageSize: 31, showSizeChanger: true }}
          summary={pageData => {
            const total = pageData.reduce((s, r) => s + r.revenue, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><strong>{pageData.reduce((s,r)=>s+r.count,0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><Tag color="blue"><strong>{total.toFixed(3)} KD</strong></Tag></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      ),
    },
    {
      key: 'by_vendor',
      label: 'By Vendor',
      children: (
        <Table
          dataSource={report?.by_vendor || []}
          columns={[
            { title: 'Vendor', dataIndex: 'vendor_name', render: v => <strong>{v}</strong> },
            { title: 'Sold', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
            { title: 'Revenue', dataIndex: 'revenue', render: v => <Tag color="cyan">{v} KD</Tag>, sorter: (a, b) => a.revenue - b.revenue },
          ]}
          rowKey="vendor_id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          summary={pageData => {
            const total = pageData.reduce((s, r) => s + r.revenue, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><strong>{pageData.reduce((s,r)=>s+r.count,0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><Tag color="cyan"><strong>{total.toFixed(3)} KD</strong></Tag></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      ),
    },
    {
      key: 'by_customer',
      label: 'By Customer',
      children: (
        <Table
          dataSource={report?.by_customer || []}
          columns={customerCols}
          rowKey="customer_phone"
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      ),
    },
    {
      key: 'detailed',
      label: `All Records (${report?.rows?.length || 0})`,
      children: (
        <Table
          dataSource={report?.rows || []}
          columns={detailCols}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['20','50','100'] }}
          size="small"
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Sales Reports</Title>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportCsv(report?.rows || [])}
          disabled={!report?.rows?.length}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={v => setDateRange(v)}
            placeholder={['From date', 'To date']}
            format="DD/MM/YYYY"
            allowClear
          />
          <Select
            placeholder="All coupons"
            allowClear
            value={couponId}
            onChange={v => setCouponId(v)}
            style={{ minWidth: 200 }}
            showSearch
            filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
            options={coupons.map(c => ({ value: c.id, label: c.title }))}
          />
          <Select
            placeholder="Order type"
            allowClear
            value={orderType}
            onChange={v => setOrderType(v)}
            style={{ width: 150 }}
            options={[
              { value: 'order', label: 'Registered' },
              { value: 'guest_order', label: 'Guest' },
            ]}
          />
          <Input
            placeholder="Search customer / phone / order #"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Button type="primary" style={{ background: '#FF383C' }} icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
            Apply
          </Button>
        </Space>
      </Card>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Total Sold', value: summary.total_sold ?? '—', icon: <ShoppingOutlined />, color: '#FF383C' },
          { title: 'Total Revenue', value: summary.total_revenue != null ? `${summary.total_revenue} KD` : '—', icon: <DollarOutlined />, color: '#52c41a' },
          { title: 'Unique Customers', value: summary.unique_customers ?? '—', icon: <UserOutlined />, color: '#1677ff' },
          { title: 'Unique Orders', value: summary.unique_orders ?? '—', icon: <FileTextOutlined />, color: '#722ed1' },
        ].map(card => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card bordered={false} style={{ borderRadius: 12, borderTop: `3px solid ${card.color}` }}>
              <Statistic
                title={<span style={{ color: '#666', fontSize: 13 }}>{card.title}</span>}
                value={card.value}
                prefix={React.cloneElement(card.icon, { style: { color: card.color, marginRight: 4 } })}
                valueStyle={{ fontSize: 24, fontWeight: 800 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Report Tabs */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Spin spinning={loading}>
          {!report ? (
            <Empty description="Apply filters to load report" style={{ padding: 60 }} />
          ) : (
            <Tabs defaultActiveKey="by_coupon" items={tabs} />
          )}
        </Spin>
      </Card>
    </div>
  );
}
