import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, DatePicker, Upload, message, Image, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, QrcodeOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function CouponList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
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

  const load = () => api.get('/coupons').then(r => setData(r.data.data));
  useEffect(() => { load(); api.get('/vendors').then(r => setVendors(r.data.data)); }, []);

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
          <Button icon={<QrcodeOutlined />} size="small" onClick={() => openQrModal(r)}>QR Codes</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({ ...r, expiry_date: r.expiry_date ? dayjs(r.expiry_date) : null });
            setFileList(r.image ? [{ uid: '-1', name: 'image', status: 'done', url: `${BASE}${r.image}` }] : []);
            setOpen(true);
          }} />
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
              <Button icon={<UploadOutlined />}>Upload Image</Button>
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
          <Space>
            <Form.Item name="status" label={t('status')}>
              <Select style={{ width: 120 }} options={[
                { value: 'active', label: t('active') },
                { value: 'inactive', label: t('inactive') },
                { value: 'expired', label: 'Expired' },
              ]} />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Select style={{ width: 160 }} allowClear placeholder="None" options={[
                { value: 'birthday', label: 'Birthday' },
                { value: 'mothers_day', label: "Mother's Day" },
              ]} />
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
                <Button icon={<UploadOutlined />}>Select QR Images</Button>
              </Upload>
              <Button type="primary" style={{ background: '#FF383C' }} loading={qrLoading}
                onClick={uploadQrCodes} disabled={qrUploadFiles.length === 0}>
                Upload {qrUploadFiles.length > 0 ? `(${qrUploadFiles.length})` : ''}
              </Button>
            </Space>

            {qrItems.length === 0 ? (
              <Empty description="No QR codes uploaded yet" />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {qrItems.map(item => (
                  <div key={item.id} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 8, width: 130, textAlign: 'center' }}>
                    <Image src={`${BASE}${item.image}`} width={110} height={110} style={{ objectFit: 'contain' }} />
                    <div style={{ marginTop: 6 }}>
                      <Tag color={item.status === 'unassigned' ? 'green' : item.status === 'assigned' ? 'orange' : 'default'}>
                        {item.status}
                      </Tag>
                    </div>
                    {item.status === 'unassigned' && (
                      <Popconfirm title={t('delete') + '?'} onConfirm={() => deleteQrCode(item.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger style={{ marginTop: 6 }} />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
