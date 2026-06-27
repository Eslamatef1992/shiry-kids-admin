import React, { useEffect, useState, useRef } from 'react';
import { Table, Tag, Select, Space, Button, Modal, Descriptions, message } from 'antd';
import { EyeOutlined, PrinterOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { printOrder } from '../../utils/printOrder';
import { useLang } from '../../contexts/LangContext';

const STATUS_COLOR = { processing:'blue', shipped:'orange', arrived:'green', cancelled:'red' };
const PAY_COLOR    = { paid:'green', pending:'orange', failed:'red', refunded:'purple' };

function getOrderType(items = []) {
  const hasCoupon  = items.some(i => i.type === 'coupon');
  const hasProduct = items.some(i => i.type === 'product');
  if (hasCoupon && hasProduct) return 'Mixed';
  if (hasCoupon)  return 'Coupon';
  if (hasProduct) return 'Product';
  return '—';
}

function getVendors(items = []) {
  const names = [...new Set(items.map(i => i.vendor_name || i.vendor?.name).filter(Boolean))];
  return names.length ? names.join(', ') : '—';
}

function exportExcel(data) {
  import('xlsx').then(XLSX => {
    const rows = data.map(r => ({
      'Order #':       r.order_number,
      'Customer':      r.user?.name || '—',
      'Phone':         r.user?.phone || '—',
      'Vendor':        getVendors(r.items),
      'Type':          getOrderType(r.items),
      'Total (KD)':    r.total,
      'Payment':       r.payment_method?.toUpperCase(),
      'Pay Status':    r.payment_status,
      'Order Status':  r.order_status,
      'Date':          r.createdAt ? new Date(r.createdAt).toLocaleString() : '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

function exportPDF(data) {
  import('jspdf').then(({ jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text('Orders', 14, 14);
      doc.autoTable({
        startY: 20,
        head: [['Order #','Customer','Phone','Vendor','Type','Total','Payment','Pay Status','Order Status','Date']],
        body: data.map(r => [
          r.order_number,
          r.user?.name || '—',
          r.user?.phone || '—',
          getVendors(r.items),
          getOrderType(r.items),
          `${r.total} KD`,
          r.payment_method?.toUpperCase(),
          r.payment_status,
          r.order_status,
          r.createdAt ? new Date(r.createdAt).toLocaleString() : '—',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [255, 56, 60] },
      });
      doc.save(`orders_${new Date().toISOString().slice(0,10)}.pdf`);
    });
  });
}

export default function OrderList() {
  const { t } = useLang();
  const [data, setData]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters]  = useState({});
  const [orderTypeFilter, setOrderTypeFilter] = useState('');

  const load = () => api.get('/admin/orders', { params: filters }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [filters]);

  const updateStatus = async (id, field, val) => {
    await api.patch(`/admin/orders/${id}`, { [field]: val });
    message.success('Updated'); load();
  };

  const filtered = orderTypeFilter
    ? data.filter(r => getOrderType(r.items) === orderTypeFilter)
    : data;

  const cols = [
    { title: t('orderNumber'), dataIndex: 'order_number', render: n => <strong>{n}</strong> },
    { title: t('customer'), render: r => (
      <span>
        <div style={{fontWeight:600}}>{r.user?.name || r.name || '—'}{r.is_guest ? <Tag color="default" style={{marginLeft:4,fontSize:10}}>Guest</Tag> : null}</div>
        <div style={{color:'#888',fontSize:12}}>{r.user?.phone || r.phone || ''}</div>
      </span>
    )},
    { title: 'Vendor', render: r => <span style={{fontSize:12}}>{getVendors(r.items)}</span> },
    { title: 'Type', render: r => {
      const type = getOrderType(r.items);
      const color = type === 'Coupon' ? 'purple' : type === 'Product' ? 'blue' : 'default';
      return <Tag color={color}>{type}</Tag>;
    }},
    { title: t('total'), dataIndex: 'total', render: v => `${v} KD` },
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
    )},
  ];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <h2 style={{fontWeight:800}}>{t('orders')}</h2>
        <Space wrap>
          <Select placeholder="Payment Status" allowClear style={{width:150}} onChange={v => setFilters(f=>({...f,payment_status:v||''}))}
            options={['paid','pending','failed','refunded'].map(x=>({value:x,label:x}))} />
          <Select placeholder="Order Status" allowClear style={{width:150}} onChange={v => setFilters(f=>({...f,order_status:v||''}))}
            options={['processing','shipped','arrived','cancelled'].map(x=>({value:x,label:x}))} />
          <Select placeholder="Order Type" allowClear style={{width:130}} onChange={v => setOrderTypeFilter(v||'')}
            options={['Coupon','Product','Mixed'].map(x=>({value:x,label:x}))} />
          <Button icon={<FileExcelOutlined />} style={{color:'#217346',borderColor:'#217346'}} onClick={() => exportExcel(filtered)}>
            Excel
          </Button>
          <Button icon={<FilePdfOutlined />} style={{color:'#FF383C',borderColor:'#FF383C'}} onClick={() => exportPDF(filtered)}>
            PDF
          </Button>
        </Space>
      </div>
      <Table dataSource={filtered} columns={cols} rowKey="id" />
      <Modal title={`Order ${selected?.order_number}`} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={600}>
        {selected && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Customer">{selected.user?.name}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.user?.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Payment">{selected.payment_method?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Type">{getOrderType(selected.items)}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">{selected.subtotal} KD</Descriptions.Item>
            <Descriptions.Item label="Discount">{selected.discount} KD</Descriptions.Item>
            <Descriptions.Item label="Delivery">{selected.delivery_fees} KD</Descriptions.Item>
            <Descriptions.Item label="Total"><strong>{selected.total} KD</strong></Descriptions.Item>
            <Descriptions.Item label="Items" span={2}>
              {(selected.items||[]).map((it,i) => (
                <div key={i}>{it.name} × {it.quantity} — {it.price} KD {it.vendor_name ? `(${it.vendor_name})` : ''}</div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
