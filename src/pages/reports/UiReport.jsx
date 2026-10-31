import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Tag, Table, DatePicker, Select, Button,
  Spin, Empty, Badge, Drawer, Typography, Space, Statistic, Input,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SearchOutlined, ShoppingOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

const FILTER_OPTIONS = [
  { value: '',             label: 'All' },
  { value: 'sold',         label: 'Sold (Not Scanned)' },
  { value: 'scanned',      label: 'Scanned' },
  { value: 'sold_scanned', label: 'Sold & Scanned' },
];

export default function UiReport() {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // coupon card clicked
  const [detail, setDetail]     = useState([]);
  const [detailLoad, setDetailLoad] = useState(false);
  const [dateRange, setDateRange]   = useState([null, null]);
  const [filter, setFilter]         = useState('');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    api.get('/admin/reports/ui-coupons')
      .then(r => setCoupons(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = (coupon, range = dateRange, f = filter) => {
    setSelected(coupon);
    setDetailLoad(true);
    const params = { filter: f };
    if (range[0]) params.from = range[0].format('YYYY-MM-DD');
    if (range[1]) params.to   = range[1].format('YYYY-MM-DD');
    api.get(`/admin/reports/ui-coupons/${coupon.id}`, { params })
      .then(r => setDetail(r.data.data || []))
      .finally(() => setDetailLoad(false));
  };

  const onDateChange = (dates) => {
    setDateRange(dates || [null, null]);
    if (selected) loadDetail(selected, dates || [null, null], filter);
  };

  const onFilterChange = (v) => {
    setFilter(v);
    if (selected) loadDetail(selected, dateRange, v);
  };

  const filteredDetail = search
    ? detail.filter(r =>
        r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.customer_phone?.toLowerCase().includes(search.toLowerCase()) ||
        r.order_number?.toLowerCase().includes(search.toLowerCase())
      )
    : detail;

  const cols = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      render: v => <strong style={{ fontSize: 12 }}>{v}</strong>,
    },
    {
      title: 'Customer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.customer_name || '—'}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.customer_phone || '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Purchase Date',
      dataIndex: 'assigned_at',
      render: v => v ? new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
    },
    {
      title: 'Status',
      render: (_, r) => r.scanned_at
        ? <Tag icon={<CheckCircleOutlined />} color="green">Scanned</Tag>
        : <Tag icon={<ClockCircleOutlined />} color="orange">Not Scanned</Tag>,
    },
    {
      title: 'Scanned By',
      render: (_, r) => r.scanned_by
        ? <Tag color="blue">{r.scanned_by}</Tag>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Scanned At',
      dataIndex: 'scanned_at',
      render: v => v ? new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
    },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        {selected && (
          <Button icon={<ArrowLeftOutlined />} onClick={() => setSelected(null)} />
        )}
        <h2 style={{ fontWeight: 800, margin: 0 }}>
          {selected ? `${selected.title} — Purchases` : 'UI Report'}
        </h2>
        {selected && (
          <Tag color="purple">{filteredDetail.length} records</Tag>
        )}
      </div>

      {!selected ? (
        /* ── Coupon Cards Grid ─────────────────────────────────────────────── */
        <>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Click a coupon to see all purchases and scan status
          </Text>
          {coupons.length === 0
            ? <Empty description="No coupons found" />
            : (
              <Row gutter={[16, 16]}>
                {coupons.map(c => (
                  <Col key={c.id} xs={12} sm={8} md={6} lg={4}>
                    <Card
                      hoverable
                      onClick={() => loadDetail(c)}
                      bodyStyle={{ padding: 0 }}
                      style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                      cover={
                        <div style={{ position: 'relative' }}>
                          <img
                            src={c.image ? `${BASE}${c.image}` : ''}
                            alt={c.title}
                            style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: '#f5f5f5' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <div style={{
                            position: 'absolute', top: 6, right: 6,
                            background: '#FF383C', color: '#fff',
                            borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                          }}>
                            {parseFloat(c.price || 0).toFixed(3)} KD
                          </div>
                        </div>
                      }
                    >
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#222' }}
                          title={c.title}>
                          {c.title?.length > 20 ? c.title.slice(0, 20) + '…' : c.title}
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>{c.vendor_name || '—'}</Text>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                            <ShoppingOutlined /> {c.total_sold} Sold
                          </Tag>
                          <Tag color="green" style={{ fontSize: 10, margin: 0 }}>
                            <CheckCircleOutlined /> {c.total_scanned} Scanned
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          }
        </>
      ) : (
        /* ── Detail View ───────────────────────────────────────────────────── */
        <>
          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Card size="small" style={{ borderRadius: 10, minWidth: 110 }}>
                <Statistic title="Total Sold" value={detail.length} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col>
              <Card size="small" style={{ borderRadius: 10, minWidth: 110 }}>
                <Statistic title="Scanned" value={detail.filter(r => r.scanned_at).length} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col>
              <Card size="small" style={{ borderRadius: 10, minWidth: 110 }}>
                <Statistic title="Not Scanned" value={detail.filter(r => !r.scanned_at).length} valueStyle={{ color: '#fa8c16' }} />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Space wrap style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={onDateChange}
              allowClear
              format="YYYY-MM-DD"
              placeholder={['From', 'To']}
            />
            <Select
              value={filter}
              onChange={onFilterChange}
              style={{ width: 180 }}
              options={FILTER_OPTIONS}
            />
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search customer / order"
              allowClear
              style={{ width: 220 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Space>

          <Spin spinning={detailLoad}>
            <Table
              dataSource={filteredDetail}
              columns={cols}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 20, showTotal: t => `${t} records` }}
              rowClassName={r => r.scanned_at ? 'scanned-row' : ''}
            />
          </Spin>
        </>
      )}
    </div>
  );
}
