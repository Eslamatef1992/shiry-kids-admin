import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, Upload, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function ProductList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const { t } = useLang();

  const load = () => api.get('/products', { params }).then(r => setData(r.data.data));
  useEffect(() => {
    load();
    api.get('/vendors').then(r => setVendors(r.data.data));
    api.get('/categories').then(r => setCategories(r.data.data));
  }, [params]);

  const save = async (vals) => {
    try {
      const { variants, ...rest } = vals;
      const fd = new FormData();
      Object.entries(rest).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      fd.append('variants', JSON.stringify(variants || []));
      fileList.forEach(f => { if (f.originFileObj) fd.append('images', f.originFileObj); });

      if (editing) await api.put(`/products/${editing.id}`, fd);
      else await api.post('/products', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('name'), dataIndex: 'name', render: (n, r) => <Space><img src={r.images?.[0] ? `${BASE}${r.images[0]}` : undefined} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, background: '#f0f0f0' }} alt="" />{n}</Space> },
    { title: t('vendor'), render: r => r.vendor?.name },
    { title: t('category'), render: r => r.category?.name || '—' },
    { title: t('price'), dataIndex: 'price', render: p => `${p} KD` },
    { title: t('stock'), dataIndex: 'stock' },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'draft' ? 'orange' : 'red'}>{s}</Tag> },
    {
      title: 'Tags', render: r => (
        <Space size={4} wrap>
          {r.is_new_arrival && <Tag color="blue">{t('newArrival')}</Tag>}
          {r.featured && <Tag color="gold">{t('bestSeller')}</Tag>}
          {r.is_weekly_offer && <Tag color="purple">{t('weeklyOffer')}</Tag>}
        </Space>
      )
    },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue({
              ...r,
              sizes: r.sizes?.join(','),
              colors: r.colors?.join(','),
              variants: (r.variants || []).map(v => ({ ...v })),
            });
            setFileList((r.images || []).map((img, i) => ({ uid: `-${i + 1}`, name: `image-${i + 1}`, status: 'done', url: `${BASE}${img}` })));
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
            onClick={() => { setEditing(null); form.resetFields(); setFileList([]); setOpen(true); }}>
            {t('addProduct')}
          </Button>
        </Space>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? t('editProduct') : t('addProduct')}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={760}
        okButtonProps={{ style: { background: '#FF383C' } }}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="vendor_id" label={t('vendor')} rules={[{ required: true }]} style={{ minWidth: 200 }}>
              <Select options={vendors.map(v => ({ value: v.id, label: v.name }))} />
            </Form.Item>
            <Form.Item name="category_id" label="Category" style={{ minWidth: 200 }}>
              <Select allowClear options={categories.map(c => ({ value: c.id, label: c.name }))} />
            </Form.Item>
          </Space>

          <BilingualField nameEn="name" nameAr="name_ar" label={t('productName')} required />
          <BilingualField nameEn="description" nameAr="description_ar" label={t('description')} textarea />

          <Form.Item label="Product Images">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl)}
              listType="picture-card"
              multiple
            >
              <div><UploadOutlined /><div style={{ marginTop: 8 }}>{t('upload')}</div></div>
            </Upload>
          </Form.Item>

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
          </Space>

          <Divider orientation="left" plain>Home Page Sections</Divider>
          <Space size="large">
            <Form.Item name="is_new_arrival" label="New Arrivals" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="featured" label="Best Seller" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="is_weekly_offer" label="Weekly Offers" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <Divider orientation="left" plain>Variants</Divider>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" wrap style={{ marginBottom: 4 }}>
                    <Form.Item {...restField} name={[name, 'id']} hidden><Input /></Form.Item>
                    <Form.Item {...restField} name={[name, 'size']}>
                      <Input placeholder="Size" style={{ width: 90 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'color']}>
                      <Input placeholder="Color" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'sku']}>
                      <Input placeholder="SKU" style={{ width: 110 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'price']}>
                      <InputNumber min={0} step={0.001} placeholder="Price (KD)" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'stock']}>
                      <InputNumber min={0} placeholder="Stock" style={{ width: 90 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({})} block>
                    Add Variant
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
