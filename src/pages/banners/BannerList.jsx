import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function BannerList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/banners').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (fileList[0]?.originFileObj) fd.append('image', fileList[0].originFileObj);

      if (editing) await api.put(`/banners/${editing.id}`, fd);
      else await api.post('/banners', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    {
      title: 'Image', dataIndex: 'image', width: 100,
      render: img => img
        ? <img src={`${BASE}${img}`} style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" />
        : '—',
    },
    { title: 'Title (EN)', dataIndex: 'title', render: v => v || '—' },
    { title: 'Title (AR)', dataIndex: 'title_ar', render: v => <span dir="rtl">{v || '—'}</span> },
    { title: 'Link', dataIndex: 'link', render: v => v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : '—' },
    { title: 'Sort', dataIndex: 'sort', width: 60 },
    {
      title: t('status'), dataIndex: 'status',
      render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue(r);
            setFileList(r.image ? [{ uid: '-1', name: 'image', status: 'done', url: `${BASE}${r.image}` }] : []);
            setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/banners/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('banners')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setFileList([]); setOpen(true); }}>
          Add Banner
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? 'Edit Banner' : 'Add Banner'}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={680}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <BilingualField nameEn="title" nameAr="title_ar" label="Banner Title" />
          <Form.Item label="Image" required>
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('uploadImage')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="link" label="Link (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="status" label={t('status')} initialValue="active">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
          <Form.Item name="sort" label="Sort Order">
            <Input type="number" defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
