import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Button, Modal, Descriptions, message, Spin, Divider, Input } from 'antd';
import { EyeOutlined, PrinterOutlined, QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { printOrder } from '../../utils/printOrder';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
const STATUS_TAG = { unassigned: 'default', assigned: 'blue', used: 'green' };

export default function GuestOrderList() {
  const { t } = useLang();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const load = (page = 1, pageSize = 20) => {
    api.get('/admin/orders/guest', { params: { ...filters, page, limit: pageSize } })
      .then(r => {
        setData(r.data.data);
        const meta = r.data.meta;
        if (meta) setPagination(p => ({ ...p, current: page, pageSize, total: meta.total }));
      });
  };
  useEffect(() => { load(1, pagination.pageSize); }, [filters]);

  const updateStatus = async (id, field, val) => {
    await api.patch(`/admin/orders/${id}?type=guest`, { [field]: val });
    message.success('Updated'); load();
  };

  const openDetail = async (row) => {
    setSelected(row);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/orders/${row.id}`, { params: { type: 'guest_order' } });
      setSelected(res.data.data);
    } catch (_) {} finally {
      setDetailLoading(false);
    }
  };

  const cols = [
    { title: t('orderNumber'), dataIndex: 'order_number', render: n => <strong>{n}</strong> },
    { title: 'Guest Name', dataIndex: 'name' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Vendor',
      render: (_, r) => {
        const vendors = [...new Set((r.items || []).map(i => i.vendor_name).filter(Boolean))];
        return vendors.length ? vendors.join(', ') : '-';
      },
    },
    { title: t('total'), dataIndex: 'total', render: t => `${t} KD` },
    { title: 'Pay Status', dataIndex: 'payment_status', render: s => <Tag color={s==='paid'?'green':s==='pending'?'orange':'red'}>{s}</Tag> },
    { title: t('orderStatus'), dataIndex: 'order_status', render: (s, r) => (
      <Select size="small" value={s} style={{width:130}}
        onChange={v => updateStatus(r.id,'order_status',v)}
        options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
    )},
    { title: 'Date', dataIndex: 'createdAt', render: d => d ? new Date(d).toLocaleString() : '-' },
    { title: '', render: (_, r) => (
      <Space>
        <Button icon={<EyeOutlined />} size="small" onClick={() => openDetail(r)} />
        <Button icon={<PrinterOutlined />} size="small" onClick={() => printOrder(r, { guest: true })} />
      </Space>
    ) },
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <h2 style={{fontWeight:800}}>{t('guestOrders')}</h2>
        <Space wrap>
          <Input.Search
            placeholder="Search by phone or name"
            allowClear
            style={{width:220}}
            prefix={<SearchOutlined />}
            onSearch={v => { setFilters(f=>({...f, search: v||''})); load(1, pagination.pageSize); }}
            onChange={e => !e.target.value && setFilters(f=>({...f, search:''}))}
          />
          <Select placeholder="Order Status" allowClear style={{width:160}} onChange={v => setFilters(f=>({...f,order_status:v}))}
            options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={cols}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} orders`,
          onChange: (page, pageSize) => load(page, pageSize),
        }}
      />
      <Modal title={`Guest Order ${selected?.order_number}`} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={680}>
        {selected && (
          <Spin spinning={detailLoading}>
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

            {(selected.coupon_qr_codes?.length > 0) && (
              <>
                <Divider orientation="left"><QrcodeOutlined /> Assigned Coupons ({selected.coupon_qr_codes.length})</Divider>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {selected.coupon_qr_codes.map((qr, i) => (
                    <div key={qr.id} style={{ textAlign: 'center', border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, width: 150 }}>
                      <img
                        src={`${BASE}${qr.image}`}
                        alt={`QR ${i+1}`}
                        style={{ width: 100, height: 100, objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: 11, marginTop: 4, color: '#555', fontWeight: 600 }}>{qr.coupon?.title || `Coupon #${qr.coupon_id}`}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{qr.code || '—'}</div>
                      <Tag color={STATUS_TAG[qr.status]} style={{ marginTop: 4, fontSize: 10 }}>{qr.status}</Tag>
                      {qr.scanned_at && (
                        <div style={{ fontSize: 10, color: '#52c41a', marginTop: 4 }}>
                          ✓ {new Date(qr.scanned_at).toLocaleString()}
                        </div>
                      )}
                      {qr.scanned_by && (
                        <div style={{ fontSize: 10, color: '#1890ff' }}>By: {qr.scanned_by}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Spin>
        )}
      </Modal>
    </div>
  );
}
