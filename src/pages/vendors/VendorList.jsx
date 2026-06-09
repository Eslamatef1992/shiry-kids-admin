import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, Avatar, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

export default function VendorList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/vendors').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/vendors/${editing.id}`, vals);
      else await api.post('/vendors', vals);
      message.success(t('save')); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('vendors'), render: r => <Space><Avatar src={r.logo} icon={<ShopOutlined />} />{r.name}</Space> },
    { title: t('email'), dataIndex: 'email' },
    { title: t('phone'), dataIndex: 'phone' },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true); }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/vendors/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('vendors')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
          {t('add')} {t('vendors')}
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? `${t('edit')} ${t('vendors')}` : `${t('add')} ${t('vendors')}`}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <BilingualField nameEn="name" nameAr="name_ar" label={`${t('vendors')} ${t('name')}`} required />
          <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="phone" label={t('phone')}><Input /></Form.Item>
          <BilingualField nameEn="description" nameAr="description_ar" label={t('description')} textarea />
          <Form.Item name="status" label={t('status')}>
            <Select options={[
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
              { value: 'pending', label: 'Pending' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
