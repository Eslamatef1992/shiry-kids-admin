import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function CmsList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/cms').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/cms/${editing.id}`, vals);
      else await api.post('/cms', vals);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Title', dataIndex: 'title', render: (t, r) => <strong>{t}</strong> },
    { title: 'Slug', dataIndex: 'slug', render: s => <code>/{s}</code> },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='published'?'green':'orange'}>{s}</Tag> },
    { title: 'Updated', dataIndex: 'updated_at', render: d => new Date(d).toLocaleDateString() },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/cms/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontWeight:800}}>CMS Pages</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{background:'#FF383C'}} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Page</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing?'Edit Page':'New Page'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width={720} okButtonProps={{style:{background:'#FF383C'}}}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="title" label="Page Title" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug (URL key)" rules={[{required:true}]}><Input placeholder="about-us" /></Form.Item>
          <Form.Item name="content" label="Content"><Input.TextArea rows={10} placeholder="HTML or plain text content..." /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{value:'published',label:'Published'},{value:'draft',label:'Draft'}]} /></Form.Item>
          <Form.Item name="sort" label="Sort Order"><Input type="number" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
