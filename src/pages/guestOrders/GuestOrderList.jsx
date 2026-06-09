import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Button, Modal, Descriptions, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function GuestOrderList() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});

  const load = () => api.get('/admin/orders/guest', { params: filters }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [filters]);

  const updateStatus = async (id, field, val) => {
    await api.patch(`/admin/orders/${id}?type=guest`, { [field]: val });
    message.success('Updated'); load();
  };

  const cols = [
    { title: 'Order #', dataIndex: 'order_number', render: n => <strong>{n}</strong> },
    { title: 'Guest Name', dataIndex: 'name' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Total', dataIndex: 'total', render: t => `${t} KD` },
    { title: 'Pay Status', dataIndex: 'payment_status', render: s => <Tag color={s==='paid'?'green':s==='pending'?'orange':'red'}>{s}</Tag> },
    { title: 'Order Status', dataIndex: 'order_status', render: (s, r) => (
      <Select size="small" value={s} style={{width:130}}
        onChange={v => updateStatus(r.id,'order_status',v)}
        options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
    )},
    { title: 'Date', dataIndex: 'created_at', render: d => new Date(d).toLocaleDateString() },
    { title: '', render: (_, r) => <Button icon={<EyeOutlined />} size="small" onClick={() => setSelected(r)} /> },
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontWeight:800}}>Guest Orders</h2>
        <Select placeholder="Order Status" allowClear style={{width:160}} onChange={v => setFilters(f=>({...f,order_status:v}))}
          options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={`Guest Order ${selected?.order_number}`} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={560}>
        {selected && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Name">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.phone}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{selected.address}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">{selected.subtotal} KD</Descriptions.Item>
            <Descriptions.Item label="Total"><strong>{selected.total} KD</strong></Descriptions.Item>
            <Descriptions.Item label="Items" span={2}>
              {(selected.items||[]).map((it,i) => <div key={i}>{it.name} × {it.quantity} — {it.price} KD</div>)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
