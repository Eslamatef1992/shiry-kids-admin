import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Button, Modal, Descriptions, message } from 'antd';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { printOrder } from '../../utils/printOrder';
import { useLang } from '../../contexts/LangContext';

const STATUS_COLOR = { processing:'blue', shipped:'orange', arrived:'green', cancelled:'red' };
const PAY_COLOR    = { paid:'green', pending:'orange', failed:'red', refunded:'purple' };

export default function OrderList() {
  const { t } = useLang();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({});

  const load = () => api.get('/admin/orders', { params: filters }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [filters]);

  const updateStatus = async (id, field, val) => {
    await api.patch(`/admin/orders/${id}`, { [field]: val });
    message.success('Updated'); load();
  };

  const cols = [
    { title: t('orderNumber'), dataIndex: 'order_number', render: n => <strong>{n}</strong> },
    { title: t('customer'), render: r => r.user?.name || '-' },
    { title: t('total'), dataIndex: 'total', render: t => `${t} KD` },
    { title: t('payment'), dataIndex: 'payment_method', render: m => m?.toUpperCase() },
    { title: 'Pay Status', dataIndex: 'payment_status', render: s => <Tag color={PAY_COLOR[s]}>{s}</Tag> },
    { title: t('orderStatus'), dataIndex: 'order_status', render: (s, r) => (
      <Select size="small" value={s} style={{width:130}}
        onChange={v => updateStatus(r.id,'order_status',v)}
        options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
    )},
    { title: 'Date', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '-' },
    { title: '', render: (_, r) => (
      <Space>
        <Button icon={<EyeOutlined />} size="small" onClick={() => setSelected(r)} />
        <Button icon={<PrinterOutlined />} size="small" onClick={() => printOrder(r)} />
      </Space>
    ) },
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontWeight:800}}>{t('orders')}</h2>
        <Space>
          <Select placeholder="Payment Status" allowClear style={{width:150}} onChange={v => setFilters(f=>({...f,payment_status:v}))}
            options={['paid','pending','failed','refunded'].map(x=>({value:x,label:x}))} />
          <Select placeholder="Order Status" allowClear style={{width:150}} onChange={v => setFilters(f=>({...f,order_status:v}))}
            options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
        </Space>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title={`Order ${selected?.order_number}`} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={600}>
        {selected && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Customer">{selected.user?.name}</Descriptions.Item>
            <Descriptions.Item label="Payment">{selected.payment_method?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">{selected.subtotal} KD</Descriptions.Item>
            <Descriptions.Item label="Discount">{selected.discount} KD</Descriptions.Item>
            <Descriptions.Item label="Delivery">{selected.delivery_fees} KD</Descriptions.Item>
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
