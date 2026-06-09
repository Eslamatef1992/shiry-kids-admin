import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

export default function CouponList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/coupons').then(r => setData(r.data.data));
  useEffect(() => { load(); api.get('/vendors').then(r => setVendors(r.data.data)); }, []);

  const save = async (vals) => {
    try {
      const payload = { ...vals, expiry_date: vals.expiry_date?.toISOString() };
      if (editing) await api.put(`/coupons/${editing.id}`, payload);
      else await api.post('/coupons', payload);
      message.success(t('save')); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('name'), dataIndex: 'title', render: (n, r) => <Space><img src={r.image} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} alt="" />{n}</Space> },
    { title: t('vendor'), render: r => r.vendor?.name },
    { title: t('price'), dataIndex: 'price', render: p => `${p} KD` },
    { title: 'Discount', dataIndex: 'discount_percent', render: v => `${v}%` },
    { title: 'Count', dataIndex: 'coupon_count' },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'expired' ? 'red' : 'orange'}>{s}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({ ...r, expiry_date: r.expiry_date ? dayjs(r.expiry_date) : null });
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
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
          {t('add')} {t('coupons')}
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? `${t('edit')} ${t('coupons')}` : `${t('add')} ${t('coupons')}`}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={640}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="vendor_id" label={t('vendor')} rules={[{ required: true }]}>
            <Select options={vendors.map(v => ({ value: v.id, label: v.name }))} />
          </Form.Item>

          <BilingualField nameEn="title" nameAr="title_ar" label="Title" required />
          <BilingualField nameEn="description" nameAr="description_ar" label={t('description')} textarea rows={2} />

          <Space>
            <Form.Item name="price" label={`${t('price')} (KD)`} rules={[{ required: true }]}>
              <InputNumber min={0} step={0.001} style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="original_price" label="Original (KD)">
              <InputNumber min={0} step={0.001} style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="discount_percent" label="Discount %">
              <InputNumber min={0} max={100} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="coupon_count" label="Count">
              <InputNumber min={1} style={{ width: 80 }} />
            </Form.Item>
          </Space>
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
            <Form.Item name="featured" label={t('featured')} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
