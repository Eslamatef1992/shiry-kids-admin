import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, DatePicker, Upload, message, Image, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, QrcodeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function CouponList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [couponCategories, setCouponCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { t } = useLang();

  // QR codes management
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCoupon, setQrCoupon] = useState(null);
  const [qrItems, setQrItems] = useState([]);
  const [qrSummary, setQrSummary] = useState(null);
  const [qrUploadFiles, setQrUploadFiles] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSearch, setQrSearch] = useState('');
  const [qrDateRange, setQrDateRange] = useState(null);

  // Upload history modal
  const [histOpen, setHistOpen] = useState(false);
  const [histCoupon, setHistCoupon] = useState(null);
  const [histItems, setHistItems] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histDate, setHistDate] = useState(null);
  const [histStatus, setHistStatus] = useState(null);

  const getItemDate = (item) => item.created_at || item.createdAt || null;

  const openHistModal = (coupon) => {
    setHistCoupon(coupon);
    setHistDate(null);
    setHistStatus(null);
    setHistOpen(true);
    setHistLoading(true);
    api.get(`/coupons/${coupon.id}/qr-codes`)
      .then(r => {
        const items = [...r.data.data].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
        setHistItems(items);
      })
      .catch(e => message.error(e.response?.data?.message || 'Error'))
      .finally(() => setHistLoading(false));
  };

  const load = () => api.get('/coupons').then(r => setData(r.data.data));
  useEffect(() => {
    load();
    api.get('/vendors').then(r => setVendors(r.data.data));
    api.get('/coupon-categories').then(r => setCouponCategories(r.data.data)).catch(() => {});
  }, []);

  const loadQrCodes = (couponId) => {
    setQrLoading(true);
    return api.get(`/coupons/${couponId}/qr-codes`)
      .then(r => { setQrItems(r.data.data); setQrSummary(r.data.summary); })
      .catch(e => message.error(e.response?.data?.message || 'Error'))
      .finally(() => setQrLoading(false));
  };

  const openQrModal = (coupon) => {
    setQrCoupon(coupon);
    setQrUploadFiles([]);
    setQrSearch('');
    setQrDateRange(null);
    setQrOpen(true);
    loadQrCodes(coupon.id);
  };

  const uploadQrCodes = async () => {
    if (qrUploadFiles.length === 0) return message.warning('Select at least one QR image');
    const fd = new FormData();
    qrUploadFiles.forEach(f => { if (f.originFileObj) fd.append('qr_codes', f.originFileObj); });
    setQrLoading(true);
    try {
      await api.post(`/coupons/${qrCoupon.id}/qr-codes`, fd);
      message.success(t('save'));
      setQrUploadFiles([]);
      await loadQrCodes(qrCoupon.id);
    } catch (e) {
      message.error(e.response?.data?.message || 'Error');
    } finally {
      setQrLoading(false);
    }
  };

  const deleteQrCode = async (qrId) => {
    try {
      await api.delete(`/coupons/${qrCoupon.id}/qr-codes/${qrId}`);
      message.success(t('delete'));
      await loadQrCodes(qrCoupon.id);
    } catch (e) {
      message.error(e.response?.data?.message || 'Error');
    }
  };

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (k === 'expiry_date') { fd.append(k, v.toISOString()); return; }
        fd.append(k, v);
      });
      if (fileList[0]?.originFileObj) fd.append('image', fileList[0].originFileObj);

      if (editing) await api.put(`/coupons/${editing.id}`, fd);
      else await api.post('/coupons', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('name'), dataIndex: 'title', render: (n, r) => <Space><img src={r.image ? `${BASE}${r.image}` : undefined} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, background: '#f0f0f0' }} alt="" />{n}</Space> },
    { title: t('vendor'), render: r => r.vendor?.name },
    { title: t('price'), dataIndex: 'price', render: p => `${p} KD` },
    { title: 'Original', dataIndex: 'original_price', render: p => p ? `${p} KD` : '—' },
    { title: 'Discount', dataIndex: 'discount_percent', render: v => `${v}%` },
    { title: 'Quantity', dataIndex: 'coupon_count' },
    { title: 'Category', dataIndex: 'category', render: c => c ? <Tag>{c === 'birthday' ? 'Birthday' : c === 'mothers_day' ? "Mother's Day" : c}</Tag> : '—' },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'expired' ? 'red' : 'orange'}>{s}</Tag> },
    { title: 'Best Seller', dataIndex: 'featured', render: v => <Tag color={v ? 'gold' : 'default'}>{v ? t('yes') : t('no')}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<QrcodeOutlined />} size="small" onClick={() => openQrModal(r)}>{t('qrCodes')}</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({ ...r, expiry_date: r.expiry_date ? dayjs(r.expiry_date) : null });
            setFileList(r.image ? [{ uid: '-1', name: 'image', status: 'done', url: `${BASE}${r.image}` }] : []);
            setOpen(true);
          }} />
          <Button icon={<ClockCircleOutlined />} size="small" onClick={() => openHistModal(r)} title="Upload history" />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/coupons/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('coupons')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setFileList([]); setOpen(true); }}>
          {t('add')} {t('coupons')}
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? `${t('edit')} ${t('coupons')}` : `${t('add')} ${t('coupons')}`}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={680}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="vendor_id" label={t('vendor')} rules={[{ required: true }]}>
            <Select options={vendors.map(v => ({ value: v.id, label: v.name }))} />
          </Form.Item>

          <BilingualField nameEn="title" nameAr="title_ar" label="Title" required />
          <BilingualField nameEn="description" nameAr="description_ar" label={t('description')} textarea rows={2} />
          <BilingualField nameEn="terms_and_conditions" nameAr="terms_and_conditions_ar" label="Terms & Conditions" textarea rows={3} />

          <Form.Item label="Coupon Image">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('uploadImage')}</Button>
            </Upload>
          </Form.Item>

          <Space wrap>
            <Form.Item name="price" label={`${t('price')} (KD)`} rules={[{ required: true }]}>
              <InputNumber min={0} step={0.001} style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="original_price" label="Original (KD)">
              <InputNumber min={0} step={0.001} style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="discount_percent" label="Discount %">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="coupon_count" label="Quantity">
              <InputNumber min={1} style={{ width: 80 }} />
            </Form.Item>
          </Space>
          <div style={{ marginTop: -12, marginBottom: 12, color: '#999', fontSize: 12 }}>
            Tip: "Discount %" is what's shown to customers. Make sure Original = Price ÷ (1 - Discount/100) so the displayed price and discount match.
          </div>
          <Form.Item name="expiry_date" label="Expiry Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Space wrap>
            <Form.Item name="lat" label="Latitude">
              <InputNumber style={{ width: 180 }} step={0.0000001} placeholder="e.g. 29.3759" />
            </Form.Item>
            <Form.Item name="lng" label="Longitude">
              <InputNumber style={{ width: 180 }} step={0.0000001} placeholder="e.g. 47.9774" />
            </Form.Item>
          </Space>

          <Space>
            <Form.Item name="status" label={t('status')}>
              <Select style={{ width: 120 }} options={[
                { value: 'active', label: t('active') },
                { value: 'inactive', label: t('inactive') },
                { value: 'expired', label: 'Expired' },
              ]} />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Select style={{ width: 160 }} allowClear placeholder="None"
                options={couponCategories.map(c => ({ value: c.slug, label: c.name }))} />
            </Form.Item>
            <Form.Item name="featured" label="Best Seller Coupon" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* QR Codes management modal */}
      <Modal
        title={`QR Codes — ${qrCoupon?.title || ''}`}
        open={qrOpen}
        onCancel={() => setQrOpen(false)}
        footer={null}
        width={720}
      >
        {qrCoupon && (
          <>
            <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
              Coupon quantity: <b>{qrCoupon.coupon_count}</b>.
              {' '}Upload one QR code image per unit (e.g. {qrCoupon.coupon_count} images for a quantity of {qrCoupon.coupon_count}).
              Each purchase is assigned the next unused QR code, in upload order.
            </div>

            {qrSummary && (
              <Space style={{ marginBottom: 16 }}>
                <Tag color="blue">Total: {qrSummary.total}</Tag>
                <Tag color="green">Available: {qrSummary.unassigned}</Tag>
                <Tag color="orange">Assigned: {qrSummary.assigned}</Tag>
                <Tag color="default">Used: {qrSummary.used}</Tag>
              </Space>
            )}

            <Space style={{ marginBottom: 16 }} wrap>
              <Upload
                multiple
                fileList={qrUploadFiles}
                beforeUpload={() => false}
                onChange={({ fileList: fl }) => setQrUploadFiles(fl)}
                listType="picture"
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>{t('selectQrImages')}</Button>
              </Upload>
              <Button type="primary" style={{ background: '#FF383C' }} loading={qrLoading}
                onClick={uploadQrCodes} disabled={qrUploadFiles.length === 0}>
                Upload {qrUploadFiles.length > 0 ? `(${qrUploadFiles.length})` : ''}
              </Button>
            </Space>

            <Space wrap style={{ marginBottom: 16 }}>
              <Input.Search
                placeholder="Search by phone or name..."
                allowClear
                value={qrSearch}
                onChange={e => setQrSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <DatePicker
                value={qrDateRange}
                onChange={v => setQrDateRange(v)}
                placeholder="Filter by date"
                allowClear
              />
            </Space>

            {qrItems.length === 0 ? (
              <Empty description="No QR codes uploaded yet" />
            ) : (() => {
              const q = qrSearch.trim().toLowerCase();
              let filtered = qrItems;
              // When a date is selected, show only assigned QR codes for that day
              if (qrDateRange) {
                const from = qrDateRange.startOf('day');
                const to = qrDateRange.endOf('day');
                filtered = filtered.filter(i => {
                  if (i.status === 'unassigned') return false;
                  const d = i.assigned_at ? dayjs(i.assigned_at) : null;
                  return d && !d.isBefore(from) && !d.isAfter(to);
                });
              }
              if (q) filtered = filtered.filter(i =>
                i.customer_phone?.toLowerCase().includes(q) ||
                i.customer_name?.toLowerCase().includes(q) ||
                i.order_number?.toLowerCase().includes(q)
              );
              if (filtered.length === 0) return <Empty description={qrDateRange ? `No assigned QR codes on ${qrDateRange.format('DD/MM/YYYY')}` : 'No results'} />;
              return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {filtered.map(item => (
                  <div key={item.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 8, width: 150, textAlign: 'center' }}>
                    <Image src={`${BASE}${item.image}`} width={120} height={120} style={{ objectFit: 'contain' }} />
                    <div style={{ marginTop: 6 }}>
                      <Tag color={item.status === 'unassigned' ? 'green' : item.status === 'assigned' ? 'orange' : 'blue'}>
                        {item.status}
                      </Tag>
                    </div>
                    {item.customer_name && (
                      <div style={{ marginTop: 5, fontSize: 11, color: '#333', fontWeight: 600, lineHeight: 1.4 }}>
                        {item.customer_name}
                      </div>
                    )}
                    {item.customer_phone && (
                      <div style={{ fontSize: 11, color: '#888', direction: 'ltr' }}>
                        {item.customer_phone}
                      </div>
                    )}
                    {item.assigned_at && (
                      <div style={{ fontSize: 10, color: '#1677ff', marginTop: 4, fontWeight: 500 }}>
                        {dayjs(item.assigned_at).format('DD/MM/YYYY HH:mm')}
                      </div>
                    )}
                    {item.order_number && (
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                        {item.order_number}
                      </div>
                    )}
                    {item.status === 'unassigned' && (
                      <Popconfirm title={t('delete') + '?'} onConfirm={() => deleteQrCode(item.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger style={{ marginTop: 6 }} />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
              );
            })()}
          </>
        )}
      </Modal>

      {/* Upload History Modal */}
      <Modal
        title={<span><ClockCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />Upload History — {histCoupon?.title}</span>}
        open={histOpen}
        onCancel={() => setHistOpen(false)}
        footer={null}
        width={720}
      >
        <Space style={{ marginBottom: 16 }}>
          <DatePicker
            value={histDate}
            onChange={v => setHistDate(v)}
            placeholder="Filter by upload date"
            allowClear
            style={{ width: 180 }}
            format="DD/MM/YYYY"
          />
          <Select
            value={histStatus}
            onChange={v => setHistStatus(v)}
            placeholder="All statuses"
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 'assigned', label: 'Assigned' },
              { value: 'unassigned', label: 'Unassigned' },
              { value: 'used', label: 'Used' },
            ]}
          />
        </Space>
        {histLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
        ) : histItems.length === 0 ? (
          <Empty description="No QR codes uploaded yet" />
        ) : (() => {
          // Filter by selected date and/or status
          let filtered = histItems;
          if (histDate) filtered = filtered.filter(item => {
            const d = getItemDate(item);
            return d && dayjs(d).format('DD/MM/YYYY') === histDate.format('DD/MM/YYYY');
          });
          if (histStatus) filtered = filtered.filter(item => item.status === histStatus);

          if (filtered.length === 0) return <Empty description="No results for the selected filters" />;

          // Group by upload date
          const groups = {};
          filtered.forEach(item => {
            const d = getItemDate(item);
            const dateKey = d ? dayjs(d).format('DD/MM/YYYY') : 'Unknown date';
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
          });

          return Object.entries(groups).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <div style={{
                fontWeight: 700, fontSize: 13, color: '#1677ff',
                borderBottom: '1px solid #e8f0fe', paddingBottom: 6, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <ClockCircleOutlined />
                {date}
                <Tag color="blue" style={{ marginLeft: 4 }}>{items.length} uploaded</Tag>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {items.map(item => {
                  const d = getItemDate(item);
                  return (
                    <div key={item.id} style={{
                      border: '1px solid #f0f0f0', borderRadius: 8, padding: 8,
                      width: 130, textAlign: 'center', background: '#fafafa',
                    }}>
                      <Image src={`${BASE}${item.image}`} width={100} height={100} style={{ objectFit: 'contain' }} />
                      <div style={{ marginTop: 6 }}>
                        <Tag color={item.status === 'unassigned' ? 'green' : item.status === 'assigned' ? 'orange' : 'blue'} style={{ fontSize: 10 }}>
                          {item.status}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                        {d ? dayjs(d).format('HH:mm') : '—'}
                      </div>
                      {item.customer_name && (
                        <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginTop: 2 }}>
                          {item.customer_name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </Modal>
    </div>
  );
}
