import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

export default function SeoList() {
  const { t } = useLang();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => api.get('/seo').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try { await api.post('/seo', vals); message.success('Saved'); setOpen(false); load(); }
    catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    { title: t('name'), dataIndex: 'page', render: p => <strong>/{p}</strong> },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    { title: 'Keywords', dataIndex: 'keywords', ellipsis: true },
    { title: 'Edit', render: (_, r) => (
      <Button icon={<EditOutlined />} size="small" onClick={() => { form.setFieldsValue(r); setOpen(true); }} />
    )},
  ];

  return (
    <div>
      <h2 style={{fontWeight:800,marginBottom:16}}>{t('seoPages')}</h2>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal title="Edit SEO" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okButtonProps={{style:{background:'#FF383C'}}}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="page" label="Page Key"><Input disabled /></Form.Item>
          <Form.Item name="title" label="Meta Title"><Input /></Form.Item>
          <Form.Item name="description" label="Meta Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="keywords" label="Keywords (comma-separated)"><Input /></Form.Item>
          <Form.Item name="og_image" label="OG Image URL"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
