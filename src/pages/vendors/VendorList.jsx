import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, Avatar, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function VendorList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/vendors').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k,v]) => v !== undefined && fd.append(k, v));
      if (editing) await api.put(`/vendors/${editing.id}`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      else await api.post('/vendors', fd, { headers:{'Content-Type':'multipart/form-data'} });
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Vendor', render: r => <Space><Avatar src={r.logo} icon={<ShopOutlined />} />{r.name}</Space> },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':s==='pending'?'orange':'red'}>{s}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/vendors/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontWeight:800 }}>Vendors</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background:'#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Vendor</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing ? 'Edit Vendor' : 'New Vendor'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okButtonProps={{ style:{background:'#FF383C'} }}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="Vendor Name" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{required:true,type:'email'}]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'pending',label:'Pending'}]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
