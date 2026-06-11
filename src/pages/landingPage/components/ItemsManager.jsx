import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../api/axios';
import BilingualField from '../../../components/BilingualField';
import ImageUploadField, { BASE } from './ImageUploadField';

/**
 * ItemsManager — generic CRUD table for repeatable LandingItem rows
 * (how_to_use, partners, why_choose, download_badges, ...).
 *
 * Props:
 *   section        — LandingItem.section value (e.g. 'partners')
 *   addLabel       — button/modal title (e.g. 'Partner')
 *   imageLabel     — label for the image field (default 'Image')
 *   showTitle      — show bilingual title field
 *   showDescription— show bilingual description field
 *   showLink       — show a link field
 */
export default function ItemsManager({
  section, addLabel = 'Item', imageLabel = 'Image',
  showTitle = true, showDescription = false, showLink = false,
}) {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => api.get('/landing/items', { params: { section } }).then(r => setData(r.data.data));
  useEffect(() => { load(); }, [section]);

  const save = async (vals) => {
    try {
      const payload = { ...vals, section };
      if (editing) await api.put(`/landing/items/${editing.id}`, payload);
      else await api.post('/landing/items', payload);
      message.success('Saved');
      setOpen(false);
      form.resetFields();
      setEditing(null);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    {
      title: imageLabel, dataIndex: 'image', width: 100,
      render: img => img
        ? <img src={`${BASE}${img}`} style={{ width: 70, height: 50, objectFit: 'contain', borderRadius: 4, background: '#fafafa' }} alt="" />
        : '—',
    },
    ...(showTitle ? [
      { title: 'Title (EN)', dataIndex: 'title', render: v => v || '—' },
      { title: 'Title (AR)', dataIndex: 'title_ar', render: v => <span dir="rtl">{v || '—'}</span> },
    ] : []),
    ...(showDescription ? [
      { title: 'Description (EN)', dataIndex: 'description', ellipsis: true, render: v => v || '—' },
    ] : []),
    ...(showLink ? [
      { title: 'Link', dataIndex: 'link', render: v => v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : '—' },
    ] : []),
    { title: 'Sort', dataIndex: 'sort', width: 70 },
    {
      title: 'Status', dataIndex: 'status', width: 90,
      render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: 'Actions', width: 110, render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue(r);
            setOpen(true);
          }} />
          <Popconfirm title="Delete this item?" onConfirm={() => api.delete(`/landing/items/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ sort: 0, status: 'active' }); setOpen(true); }}>
          Add {addLabel}
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? `Edit ${addLabel}` : `Add ${addLabel}`}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={640}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="image" label={imageLabel}>
            <ImageUploadField />
          </Form.Item>
          {showTitle && <BilingualField nameEn="title" nameAr="title_ar" label="Title" />}
          {showDescription && <BilingualField nameEn="description" nameAr="description_ar" label="Description" textarea />}
          {showLink && (
            <Form.Item name="link" label="Link (optional)">
              <Input placeholder="https://..." />
            </Form.Item>
          )}
          <Form.Item name="status" label="Status" initialValue="active">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
          <Form.Item name="sort" label="Sort Order" initialValue={0}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
