import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function AdminList() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/admins').then(r => setData(r.data.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get('/roles').then(r => setRoles(r.data.data)).catch(() => {});
  }, []);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/admins/${editing.id}`, vals);
      else await api.post('/admins', vals);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const remove = async (id) => {
    await api.delete(`/admins/${id}`);
    message.success('Deleted'); load();
  };

  const cols = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', render: r => <Tag color="blue">{r.role?.name}</Tag> },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':'red'}>{s}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue({ ...r, password: '' }); setOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => remove(r.id)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontWeight:800 }}>Admins</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background:'#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Admin</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing ? 'Edit Admin' : 'New Admin'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okButtonProps={{ style: { background:'#FF383C' } }}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="Name" rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required:true, type:'email' }]}><Input /></Form.Item>
          <Form.Item name="password" label={editing ? 'New Password (leave blank to keep)' : 'Password'} rules={editing ? [] : [{ required:true, min:6 }]}><Input.Password /></Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required:true }]}>
            <Select options={roles.map(r => ({ value: r.id, label: r.name }))} />
          </Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
