import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

export default function ProductList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const { t } = useLang();

  const load = () => api.get('/products', { params }).then(r => setData(r.data.data));
  useEffect(() => { load(); api.get('/vendors').then(r => setVendors(r.data.data)); }, [params]);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, vals);
      else await api.post('/products', vals);
      message.success(t('save')); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('name'), dataIndex: 'name', render: (n, r) => <Space><img src={r.images?.[0]} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} alt="" />{n}</Space> },
    { title: t('vendor'), render: r => r.vendor?.name },
    { title: t('price'), dataIndex: 'price', render: p => `${p} KD` },
    { title: t('stock'), dataIndex: 'stock' },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'draft' ? 'orange' : 'red'}>{s}</Tag> },
    { title: t('featured'), dataIndex: 'featured', render: v => <Tag color={v ? 'gold' : 'default'}>{v ? t('yes') : t('no')}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({ ...r, sizes: r.sizes?.join(','), colors: r.colors?.join(',') });
            setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/products/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('products')}</h2>
        <Space>
          <Input.Search placeholder={t('search') + '...'} onSearch={v => setParams(p => ({ ...p, search: v }))} allowClear style={{ width: 200 }} />
          <Select placeholder={t('vendor')} allowClear style={{ width: 150 }} onChange={v => setParams(p => ({ ...p, vendor_id: v }))}
            options={vendors.map(v => ({ value: v.id, label: v.name }))} />
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
            onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
            {t('addProduct')}
          </Button>
        </Space>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? t('editProduct') : t('addProduct')}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={680}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="vendor_id" label={t('vendor')} rules={[{ required: true }]}>
            <Select options={vendors.map(v => ({ value: v.id, label: v.name }))} />
          </Form.Item>

          <BilingualField nameEn="name" nameAr="name_ar" label={t('productName')} required />
          <BilingualField nameEn="description" nameAr="description_ar" label={t('description')} textarea />

          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="price" label={`${t('price')} (KD)`} rules={[{ required: true }]}>
              <InputNumber min={0} step={0.001} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="original_price" label={`Original ${t('price')} (KD)`}>
              <InputNumber min={0} step={0.001} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="stock" label={t('stock')}>
              <InputNumber min={0} style={{ width: 100 }} />
            </Form.Item>
          </Space>

          <Form.Item name="sizes" label="Sizes (comma-separated, e.g. S,M,L)">
            <Input placeholder="S,M,L,XL" />
          </Form.Item>
          <Form.Item name="colors" label="Colors (comma-separated)">
            <Input placeholder="Red,Blue,Green" />
          </Form.Item>
          <Space>
            <Form.Item name="status" label={t('status')}>
              <Select style={{ width: 120 }} options={[
                { value: 'active', label: t('active') },
                { value: 'draft', label: 'Draft' },
                { value: 'inactive', label: t('inactive') },
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
