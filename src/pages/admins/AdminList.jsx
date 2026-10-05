import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

export default function AdminList() {
  const { t } = useLang();
  const [data, setData]       = useState([]);
  const [roles, setRoles]     = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [form] = Form.useForm();

  // Determine if the currently selected role has scan_qr permission
  const selectedRole   = roles.find(r => r.id === selectedRoleId);
  const isScannerRole  = selectedRole?.permissions?.includes('scan_qr') || selectedRole?.permissions?.includes('*');

  const load = () => api.get('/admins').then(r => setData(r.data.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get('/roles').then(r => setRoles(r.data.data)).catch(() => {});
    api.get('/vendors').then(r => setVendors(r.data.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setSelectedRoleId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setSelectedRoleId(r.role_id);
    form.setFieldsValue({ ...r, password: '', vendor_id: r.vendor_id || undefined });
    setOpen(true);
  };

  const save = async (vals) => {
    try {
      // If not a scanner role, clear vendor_id
      if (!isScannerRole) vals.vendor_id = null;
      if (editing) await api.put(`/admins/${editing.id}`, vals);
      else         await api.post('/admins', vals);
      message.success('Saved');
      setOpen(false);
      form.resetFields();
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const remove = async (id) => {
    await api.delete(`/admins/${id}`);
    message.success('Deleted');
    load();
  };

  const cols = [
    { title: t('name'),   dataIndex: 'name',  key: 'name' },
    { title: t('email'),  dataIndex: 'email', key: 'email' },
    { title: 'Role',   render: r => <Tag color="blue">{r.role?.name || '—'}</Tag> },
    { title: 'Vendor', render: r => r.vendor ? <Tag color="purple">{r.vendor.name}</Tag> : <span style={{ color: '#ccc' }}>—</span> },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Popconfirm title="Delete?" onConfirm={() => remove(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('admins')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }} onClick={openCreate}>
          {t('addAdmin')}
        </Button>
      </div>

      <Table dataSource={data} columns={cols} rowKey="id" />

      <Modal
        title={editing ? 'Edit Admin' : 'New Admin'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? 'New Password (leave blank to keep)' : 'Password'}
            rules={editing ? [] : [{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
            <Select
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              onChange={val => { setSelectedRoleId(val); if (!isScannerRole) form.setFieldValue('vendor_id', undefined); }}
            />
          </Form.Item>

          {/* Vendor selector — only visible for scanner roles */}
          {isScannerRole && (
            <Form.Item
              name="vendor_id"
              label="Assign to Vendor"
              tooltip="This scanner will only be able to scan coupons from the selected vendor"
            >
              <Select
                allowClear
                placeholder="Select vendor (optional)"
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
              />
            </Form.Item>
          )}

          <Form.Item name="status" label="Status">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
