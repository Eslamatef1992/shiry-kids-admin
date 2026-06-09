import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function ProductList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [params, setParams] = useState({ page:1, limit:20 });

  const load = () => api.get('/products', { params }).then(r => setData(r.data.data));
  useEffect(() => { load(); api.get('/vendors').then(r => setVendors(r.data.data)); }, [params]);

  const save = async (vals) => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, vals);
      else await api.post('/products', vals);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Name', dataIndex: 'name', render: (n, r) => <Space><img src={r.images?.[0]} style={{width:40,height:40,objectFit:'cover',borderRadius:6}} alt="" />{n}</Space> },
    { title: 'Vendor', render: r => r.vendor?.name },
    { title: 'Price', dataIndex: 'price', render: p => `${p} KD` },
    { title: 'Stock', dataIndex: 'stock' },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':s==='draft'?'orange':'red'}>{s}</Tag> },
    { title: 'Featured', dataIndex: 'featured', render: v => <Tag color={v?'gold':'default'}>{v?'Yes':'No'}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue({ ...r, sizes: r.sizes?.join(','), colors: r.colors?.join(',') }); setOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/products/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontWeight:800 }}>Products</h2>
        <Space>
          <Input.Search placeholder="Search..." onSearch={v => setParams(p => ({...p,search:v}))} allowClear style={{width:200}} />
          <Select placeholder="Vendor" allowClear style={{width:150}} onChange={v => setParams(p => ({...p,vendor_id:v}))}
            options={vendors.map(v => ({value:v.id, label:v.name}))} />
          <Button type="primary" icon={<PlusOutlined />} style={{background:'#FF383C'}} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Product</Button>
        </Space>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing?'Edit Product':'New Product'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width={640} okButtonProps={{style:{background:'#FF383C'}}}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="vendor_id" label="Vendor" rules={[{required:true}]}><Select options={vendors.map(v=>({value:v.id,label:v.name}))} /></Form.Item>
          <Form.Item name="name" label="Name" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Space style={{width:'100%'}} size="large">
            <Form.Item name="price" label="Price (KD)" rules={[{required:true}]}><InputNumber min={0} step={0.001} style={{width:140}} /></Form.Item>
            <Form.Item name="original_price" label="Original Price (KD)"><InputNumber min={0} step={0.001} style={{width:140}} /></Form.Item>
            <Form.Item name="stock" label="Stock"><InputNumber min={0} style={{width:100}} /></Form.Item>
          </Space>
          <Form.Item name="sizes" label="Sizes (comma-separated, e.g. S,M,L,XL)"><Input placeholder="S,M,L,XL" /></Form.Item>
          <Form.Item name="colors" label="Colors (comma-separated)"><Input placeholder="Red,Blue,Green" /></Form.Item>
          <Space>
            <Form.Item name="status" label="Status"><Select style={{width:120}} options={[{value:'active',label:'Active'},{value:'draft',label:'Draft'},{value:'inactive',label:'Inactive'}]} /></Form.Item>
            <Form.Item name="featured" label="Featured" valuePropName="checked"><Switch /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
