import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

const ALL_PERMS = ['*','read','write','delete','scan_qr','manage_users','manage_orders','manage_products','manage_coupons','manage_settings'];

export default function RoleList() {
  const { t } = useLang();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/roles').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/roles/${editing.id}`, vals);
      else await api.post('/roles', vals);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Role Name', dataIndex: 'name', key: 'name', render: n => <strong>{n}</strong> },
    { title: 'Permissions', dataIndex: 'permissions', render: p => (p||[]).map(x => <Tag key={x} color={x==='*'?'red':'blue'}>{x}</Tag>) },
    { title: t('actions'), render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/roles/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontWeight:800 }}>{t('roles')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background:'#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>{t('addRole')}</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing ? 'Edit Role' : 'New Role'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okButtonProps={{ style:{background:'#FF383C'} }}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="Role Name" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="permissions" label="Permissions"><Select mode="multiple" options={ALL_PERMS.map(p => ({value:p, label:p}))} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
