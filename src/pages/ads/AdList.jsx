import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function AdList() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { t } = useLang();

  const linkType = Form.useWatch('link_type', form);

  const load = () => api.get('/ads').then(r => setData(r.data.data));
  useEffect(() => {
    load();
    api.get('/products', { params: { limit: 100 } }).then(r => {
      const rows = r.data.data?.rows || r.data.data || [];
      setProducts(rows);
    });
    api.get('/coupons').then(r => setCoupons(r.data.data || []));
  }, []);

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (fileList[0]?.originFileObj) fd.append('image', fileList[0].originFileObj);

      if (editing) await api.put(`/ads/${editing.id}`, fd);
      else await api.post('/ads', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const linkLabel = (r) => {
    if (r.link_type === 'product') return r.product ? `Product: ${r.product.name}` : '—';
    if (r.link_type === 'coupon') return r.coupon ? `Coupon: ${r.coupon.title}` : '—';
    if (r.link_type === 'external') return r.external_link || '—';
    return '—';
  };

  const cols = [
    {
      title: 'Image', dataIndex: 'image', width: 100,
      render: img => img
        ? <img src={`${BASE}${img}`} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" />
        : '—',
    },
    { title: 'Title (EN)', dataIndex: 'title', render: v => v || '—' },
    { title: 'Title (AR)', dataIndex: 'title_ar', render: v => <span dir="rtl">{v || '—'}</span> },
    {
      title: 'Linked To', render: (_, r) => (
        <Space>
          <Tag color={r.link_type === 'none' ? 'default' : 'blue'}>{r.link_type}</Tag>
          <span>{linkLabel(r)}</span>
        </Space>
      )
    },
    { title: 'Sort', dataIndex: 'sort', width: 60 },
    {
      title: t('status'), dataIndex: 'status',
      render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({
              title: r.title,
              title_ar: r.title_ar,
              link_type: r.link_type,
              product_id: r.product_id,
              coupon_id: r.coupon_id,
              external_link: r.external_link,
              status: r.status,
              sort: r.sort,
            });
            setFileList(r.image ? [{ uid: '-1', name: 'image', status: 'done', url: `${BASE}${r.image}` }] : []);
            setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/ads/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>Ads</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ link_type: 'none', status: 'active', sort: 0 }); setFileList([]); setOpen(true); }}>
          Add Ad
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? 'Edit Ad' : 'Add Ad'}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={680}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <BilingualField nameEn="title" nameAr="title_ar" label="Ad Title (optional)" />
          <Form.Item label="Image" required>
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="link_type" label="Link To" initialValue="none">
            <Select options={[
              { value: 'none', label: 'None' },
              { value: 'product', label: 'Product' },
              { value: 'coupon', label: 'Coupon' },
              { value: 'external', label: 'External Link' },
            ]} />
          </Form.Item>

          {linkType === 'product' && (
            <Form.Item name="product_id" label="Select Product">
              <Select
                showSearch
                placeholder="Search product..."
                optionFilterProp="label"
                options={products.map(p => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
          )}

          {linkType === 'coupon' && (
            <Form.Item name="coupon_id" label="Select Coupon">
              <Select
                showSearch
                placeholder="Search coupon..."
                optionFilterProp="label"
                options={coupons.map(c => ({ value: c.id, label: c.title }))}
              />
            </Form.Item>
          )}

          {linkType === 'external' && (
            <Form.Item name="external_link" label="External Link">
              <Input placeholder="https://..." />
            </Form.Item>
          )}

          <Form.Item name="status" label={t('status')} initialValue="active">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
          <Form.Item name="sort" label="Sort Order">
            <Input type="number" defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
