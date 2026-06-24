import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Space, Popconfirm, Tag, Avatar, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function VendorList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/vendors').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (fileList[0]?.originFileObj) fd.append('logo', fileList[0].originFileObj);

      if (editing) await api.put(`/vendors/${editing.id}`, fd);
      else await api.post('/vendors', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('vendors'), render: r => <Space><Avatar src={r.logo ? `${BASE}${r.logo}` : undefined} icon={<ShopOutlined />} />{r.name}</Space> },
    { title: t('status'), dataIndex: 'status', render: s => <Tag color={s === 'active' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s}</Tag> },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue(r);
            setFileList(r.logo ? [{ uid: '-1', name: 'logo', status: 'done', url: `${BASE}${r.logo}` }] : []);
            setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/vendors/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('vendors')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setFileList([]); setOpen(true); }}>
          {t('add')} {t('vendors')}
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? `${t('edit')} ${t('vendors')}` : `${t('add')} ${t('vendors')}`}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <BilingualField nameEn="name" nameAr="name_ar" label={`${t('vendors')} ${t('name')}`} required />
          <Form.Item label="Logo">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('uploadLogo')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="status" label={t('status')}>
            <Select options={[
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
              { value: 'pending', label: 'Pending' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
