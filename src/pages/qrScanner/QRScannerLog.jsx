import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

export default function QRScannerLog() {
  const { t } = useLang();
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => api.get('/qr/history', { params: { status, limit: 100 } }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [status]);

  const valid    = data.filter(d => d.status === 'valid').length;
  const used     = data.filter(d => d.status === 'used').length;
  const notFound = data.filter(d => d.status === 'not_found').length;

  const cols = [
    { title: 'QR Code', dataIndex: 'qr_code', width: 220, render: (c, r) => {
      if (r.coupon_title) {
        return <span style={{fontSize:12}}>
          <strong>🎟 {r.coupon_title}</strong><br/>
          <span style={{color:'#999',fontSize:11}}>{c}</span>
        </span>;
      }
      try {
        const obj = JSON.parse(c);
        return <span style={{fontSize:12}}>
          <strong>Booking #{obj.bookingNumber}</strong><br/>
          <span style={{color:'#999',fontSize:11}}>Slot {obj.slotId} · {obj.slotTime} · ×{obj.amount}</span>
        </span>;
      } catch { return <code style={{fontSize:12}}>{c}</code>; }
    }},
    { title: 'Customer', render: r => {
      const u = r.user_info;
      if (!u) return <span style={{color:'#ccc'}}>—</span>;
      return <span style={{fontSize:12}}>
        <strong>{u.name || '—'}</strong><br/>
        <span style={{color:'#666'}}>{u.email || ''}</span><br/>
        <span style={{color:'#888',fontWeight:600}}>{u.phone || ''}</span>
      </span>;
    }},
    { title: 'Order #', render: r => r.order_number ? <code style={{fontSize:12}}>{r.order_number}</code> : '—' },
    { title: 'Payment Date', render: r => {
      const d = r.payment_date;
      if (!d) return '—';
      const date = new Date(d.includes('T') ? d : d.replace(' ', 'T') + 'Z');
      return isNaN(date) ? d : date.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    }},
    { title: 'Scanned By', render: r => r.admin?.name || '—' },
    { title: 'Status', dataIndex: 'status', render: s => (
      <Tag icon={s==='valid'?<CheckCircleOutlined />:s==='used'?<CloseCircleOutlined />:<QuestionCircleOutlined />}
        color={s==='valid'?'green':s==='used'?'red':'orange'}>{s.replace('_',' ')}</Tag>
    )},
    { title: 'Scanned At', dataIndex: 'created_at', render: d => {
      if (!d) return '—';
      const date = new Date(d.includes('T') ? d : d.replace(' ', 'T') + 'Z');
      return isNaN(date) ? d : date.toLocaleString();
    }},
  ];

  return (
    <div>
      <h2 style={{fontWeight:800,marginBottom:16}}>{t('qrScannerLogs')}</h2>
      <Row gutter={16} style={{marginBottom:20}}>
        {[
          {title:'Valid Scans',value:valid,color:'#52c41a'},
          {title:'Already Used',value:used,color:'#FF383C'},
          {title:'Not Found',value:notFound,color:'#faad14'},
        ].map(s => (
          <Col key={s.title} span={8}>
            <Card style={{borderRadius:12}}><Statistic title={s.title} value={s.value} valueStyle={{color:s.color,fontWeight:700}} /></Card>
          </Col>
        ))}
      </Row>
      <div style={{marginBottom:12}}>
        <Select placeholder="Filter by status" allowClear style={{width:180}} onChange={v => setStatus(v||'')}
          options={['valid','used','not_found'].map(x=>({value:x,label:x.replace('_',' ')}))} />
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
    </div>
  );
}
