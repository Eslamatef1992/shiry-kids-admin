import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Space, Tag, Button, Popconfirm, message } from 'antd';
import api from '../../api/axios';

export default function UserList() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = () => api.get('/users', { params: { search, status } }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [search, status]);

  const updateStatus = async (id, s) => {
    await api.put(`/users/${id}`, { status: s });
    message.success('Updated'); load();
  };

  const cols = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':s==='banned'?'red':'orange'}>{s}</Tag> },
    { title: 'Joined', dataIndex: 'created_at', render: d => new Date(d).toLocaleDateString() },
    { title: 'Actions', render: (_, r) => (
      <Space>
        {r.status !== 'banned' && <Button size="small" danger onClick={() => updateStatus(r.id,'banned')}>Ban</Button>}
        {r.status === 'banned' && <Button size="small" onClick={() => updateStatus(r.id,'active')}>Unban</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontWeight:800 }}>Users</h2>
        <Space>
          <Input.Search placeholder="Search..." onSearch={setSearch} allowClear style={{ width:200 }} />
          <Select placeholder="Status" allowClear style={{ width:120 }} onChange={setStatus}
            options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'banned',label:'Banned'}]} />
        </Space>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
    </div>
  );
}
