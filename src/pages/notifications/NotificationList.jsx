import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Upload, message, Card, Tag, Space } from 'antd';
import { SendOutlined, UploadOutlined, BellOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function NotificationList() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [sending, setSending] = useState(false);
  const [form] = Form.useForm();
  const { t } = useLang();

  const linkType = Form.useWatch('link_type', form);

  const load = () => api.get('/notifications').then(r => {
    const rows = r.data.data?.rows || r.data.data || [];
    setData(rows);
  });

  useEffect(() => {
    load();
    api.get('/products', { params: { limit: 100 } }).then(r => {
      const rows = r.data.data?.rows || r.data.data || [];
      setProducts(rows);
    });
    api.get('/coupons').then(r => setCoupons(r.data.data || []));
  }, []);

  const send = async (vals) => {
    setSending(true);
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fd.append(k, v); });
      if (fileList[0]?.originFileObj) fd.append('image', fileList[0].originFileObj);

      const res = await api.post('/notifications/send', fd);
      message.success(res.data.message || 'Notification sent');
      form.resetFields();
      form.setFieldsValue({ link_type: 'none' });
      setFileList([]);
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Error sending notification');
    } finally {
      setSending(false);
    }
  };

  const linkLabel = (r) => {
    if (r.link_type === 'product') {
      const p = products.find(x => String(x.id) === String(r.link_target));
      return p ? `Product: ${p.name}` : `Product #${r.link_target}`;
    }
    if (r.link_type === 'coupon') {
      const c = coupons.find(x => String(x.id) === String(r.link_target));
      return c ? `Coupon: ${c.title}` : `Coupon #${r.link_target}`;
    }
    if (r.link_type === 'external') return r.link_target || '—';
    return '—';
  };

  const cols = [
    {
      title: 'Image', dataIndex: 'image', width: 90,
      render: img => img
        ? <img src={`${BASE}${img}`} style={{ width: 70, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" />
        : '—',
    },
    { title: t('name'), dataIndex: 'title' },
    { title: 'Body', dataIndex: 'body', ellipsis: true },
    {
      title: 'Linked To', render: (_, r) => (
        <Space>
          <Tag color={r.link_type === 'none' ? 'default' : 'blue'}>{r.link_type}</Tag>
          <span>{linkLabel(r)}</span>
        </Space>
      )
    },
    {
      title: 'Recipients / Sent', render: (_, r) => `${r.sent_count || 0} / ${r.recipients || 0}`,
    },
    {
      title: 'Sent At', dataIndex: 'created_at',
      render: v => v ? new Date(v).toLocaleString() : '—',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}><BellOutlined /> Notifications</h2>
      </div>

      <Card title="Send Push Notification" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={send}>
          <BilingualField nameEn="title" nameAr="title_ar" label="Title" required />
          <BilingualField nameEn="body" nameAr="body_ar" label="Message" textarea required />

          <Form.Item label="Image (optional)">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('uploadImage')}</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="link_type" label="On Tap, Open" initialValue="none">
            <Select options={[
              { value: 'none', label: 'Nothing' },
              { value: 'product', label: 'Product' },
              { value: 'coupon', label: 'Coupon' },
              { value: 'external', label: 'External Link' },
            ]} />
          </Form.Item>

          {linkType === 'product' && (
            <Form.Item name="link_target" label="Select Product">
              <Select
                showSearch
                placeholder="Search product..."
                optionFilterProp="label"
                options={products.map(p => ({ value: String(p.id), label: p.name }))}
              />
            </Form.Item>
          )}

          {linkType === 'coupon' && (
            <Form.Item name="link_target" label="Select Coupon">
              <Select
                showSearch
                placeholder="Search coupon..."
                optionFilterProp="label"
                options={coupons.map(c => ({ value: String(c.id), label: c.title }))}
              />
            </Form.Item>
          )}

          {linkType === 'external' && (
            <Form.Item name="link_target" label="External Link">
              <Input placeholder="https://..." />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending}
            style={{ background: '#FF383C' }}>
            Send to All Users
          </Button>
        </Form>
      </Card>

      <Card title="History">
        <Table dataSource={data} columns={cols} rowKey="id" />
      </Card>
    </div>
  );
}
