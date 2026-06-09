import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, Switch, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';

export default function CouponList() {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/coupons').then(r => setData(r.data.data));
  useEffect(() => { load(); api.get('/vendors').then(r => setVendors(r.data.data)); }, []);

  const save = async (vals) => {
    try {
      const payload = { ...vals, expiry_date: vals.expiry_date?.toISOString() };
      if (editing) await api.put(`/coupons/${editing.id}`, payload);
      else await api.post('/coupons', payload);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: 'Title', dataIndex: 'title', render: (n,r) => <Space><img src={r.image} style={{width:40,height:40,objectFit:'cover',borderRadius:6}} alt="" />{n}</Space> },
    { title: 'Vendor', render: r => r.vendor?.name },
    { title: 'Price', dataIndex: 'price', render: p => `${p} KD` },
    { title: 'Discount', dataIndex: 'discount_percent', render: v => `${v}%` },
    { title: 'Count', dataIndex: 'coupon_count' },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':s==='expired'?'red':'orange'}>{s}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => {
          setEditing(r);
          form.setFieldsValue({ ...r, expiry_date: r.expiry_date ? dayjs(r.expiry_date) : null });
          setOpen(true);
        }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/coupons/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontWeight:800}}>Coupons</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{background:'#FF383C'}} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Coupon</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing?'Edit Coupon':'New Coupon'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width={600} okButtonProps={{style:{background:'#FF383C'}}}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="vendor_id" label="Vendor" rules={[{required:true}]}><Select options={vendors.map(v=>({value:v.id,label:v.name}))} /></Form.Item>
          <Form.Item name="title" label="Title" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Space>
            <Form.Item name="price" label="Price (KD)" rules={[{required:true}]}><InputNumber min={0} step={0.001} style={{width:130}} /></Form.Item>
            <Form.Item name="original_price" label="Original (KD)"><InputNumber min={0} step={0.001} style={{width:130}} /></Form.Item>
            <Form.Item name="discount_percent" label="Discount %"><InputNumber min={0} max={100} style={{width:100}} /></Form.Item>
            <Form.Item name="coupon_count" label="Count"><InputNumber min={1} style={{width:80}} /></Form.Item>
          </Space>
          <Form.Item name="expiry_date" label="Expiry Date"><DatePicker style={{width:'100%'}} /></Form.Item>
          <Space>
            <Form.Item name="status" label="Status"><Select style={{width:120}} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'expired',label:'Expired'}]} /></Form.Item>
            <Form.Item name="featured" label="Featured" valuePropName="checked"><Switch /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
