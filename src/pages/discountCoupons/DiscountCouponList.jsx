import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Tag, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';

export default function DiscountCouponList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/discount-coupons').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      const payload = { ...vals, expiry_date: vals.expiry_date?.toISOString() };
      if (editing) await api.put(`/discount-coupons/${editing.id}`, payload);
      else await api.post('/discount-coupons', payload);
      message.success('Saved'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    form.setFieldsValue({ code: Array.from({length:8}, () => chars[Math.floor(Math.random()*chars.length)]).join('') });
  };

  const cols = [
    { title: 'Code', dataIndex: 'code', render: c => <Tag color="blue" style={{fontSize:14,fontWeight:700,letterSpacing:1}}>{c}</Tag> },
    { title: 'Type', dataIndex: 'type', render: t => <Tag>{t}</Tag> },
    { title: 'Value', render: r => r.type==='percentage' ? `${r.value}%` : `${r.value} KD` },
    { title: 'Min Order', dataIndex: 'min_order', render: v => `${v} KD` },
    { title: 'Uses', render: r => `${r.used_count} / ${r.max_uses || '∞'}` },
    { title: 'Expiry', dataIndex: 'expiry_date', render: d => d ? new Date(d).toLocaleDateString() : '—' },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':s==='expired'?'red':'orange'}>{s}</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => {
          setEditing(r); form.setFieldsValue({ ...r, expiry_date: r.expiry_date ? dayjs(r.expiry_date) : null }); setOpen(true);
        }} />
        <Popconfirm title="Delete?" onConfirm={() => api.delete(`/discount-coupons/${r.id}`).then(load)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontWeight:800}}>Discount Coupons</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{background:'#FF383C'}} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Coupon Code</Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={editing?'Edit Discount Coupon':'New Discount Coupon'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okButtonProps={{style:{background:'#FF383C'}}}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item label="Code" style={{marginBottom:0}}>
            <Space.Compact style={{width:'100%'}}>
              <Form.Item name="code" noStyle rules={[{required:true}]}><Input placeholder="SUMMER20" style={{textTransform:'uppercase'}} /></Form.Item>
              <Button icon={<CopyOutlined />} onClick={generateCode}>Generate</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{required:true}]} style={{marginTop:16}}>
            <Select options={[{value:'percentage',label:'Percentage %'},{value:'fixed',label:'Fixed KD'}]} />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{required:true}]}><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="min_order" label="Minimum Order (KD)"><InputNumber min={0} step={0.001} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="max_uses" label="Max Uses (leave empty for unlimited)"><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="expiry_date" label="Expiry Date"><DatePicker style={{width:'100%'}} /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
