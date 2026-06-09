import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';

export default function QRScannerLog() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => api.get('/qr/history', { params: { status, limit: 100 } }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [status]);

  const valid    = data.filter(d => d.status === 'valid').length;
  const used     = data.filter(d => d.status === 'used').length;
  const notFound = data.filter(d => d.status === 'not_found').length;

  const cols = [
    { title: 'QR Code', dataIndex: 'qr_code', render: c => <code style={{fontSize:12}}>{c}</code> },
    { title: 'Scanned By', render: r => r.admin?.name || '—' },
    { title: 'Status', dataIndex: 'status', render: s => (
      <Tag icon={s==='valid'?<CheckCircleOutlined />:s==='used'?<CloseCircleOutlined />:<QuestionCircleOutlined />}
        color={s==='valid'?'green':s==='used'?'red':'orange'}>{s.replace('_',' ')}</Tag>
    )},
    { title: 'Scanned At', dataIndex: 'created_at', render: d => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <h2 style={{fontWeight:800,marginBottom:16}}>QR Scanner Logs</h2>
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
