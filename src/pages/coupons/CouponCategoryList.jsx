import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

export default function CouponCategoryList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/coupon-categories').then(r => setData(r.data.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/coupon-categories/${editing.id}`, vals);
      else await api.post('/coupon-categories', vals);
      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Icon', dataIndex: 'icon', width: 60, render: v => <span style={{ fontSize: 24 }}>{v || '🏷️'}</span> },
    { title: t('nameEn'), dataIndex: 'name', render: v => <strong>{v}</strong> },
    { title: t('nameAr'), dataIndex: 'name_ar', render: v => <span dir="rtl">{v || '—'}</span> },
    { title: 'Slug', dataIndex: 'slug', render: v => <code>{v}</code> },
    { title: t('sort'), dataIndex: 'sort', width: 80 },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r); form.setFieldsValue(r); setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/coupon-categories/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>Coupon Categories</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
          Add Category
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? 'Edit Coupon Category' : 'Add Coupon Category'}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="Name (EN)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name_ar" label="Name (AR)">
            <Input dir="rtl" />
          </Form.Item>
          <Form.Item name="icon" label="Icon (emoji)" extra="Paste an emoji, e.g. 🎂 🎁 ✈️ 🎉">
            <Input placeholder="🏷️" style={{ fontSize: 20 }} />
          </Form.Item>
          <Form.Item name="slug" label="Slug (e.g. birthday)">
            <Input placeholder="Auto-generated if empty" />
          </Form.Item>
          <Form.Item name="sort" label="Sort Order">
            <InputNumber style={{ width: '100%' }} defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
