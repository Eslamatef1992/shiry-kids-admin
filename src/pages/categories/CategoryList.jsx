import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import BilingualField from '../../components/BilingualField';
import { useLang } from '../../contexts/LangContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function CategoryList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const { t } = useLang();

  const load = () => api.get('/categories').then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (vals) => {
    try {
      const fd = new FormData();
      Object.entries(vals).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (fileList[0]?.originFileObj) fd.append('image', fileList[0].originFileObj);

      if (editing) await api.put(`/categories/${editing.id}`, fd);
      else await api.post('/categories', fd);

      message.success(t('save'));
      setOpen(false);
      form.resetFields();
      setFileList([]);
      load();
    } catch (e) { message.error(e.response?.data?.message || 'Error'); }
  };

  const cols = [
    {
      title: t('image'), dataIndex: 'image', width: 70,
      render: img => img ? <img src={`${BASE}${img}`} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" /> : '—',
    },
    { title: t('nameEn'), dataIndex: 'name', render: v => <strong>{v}</strong> },
    { title: t('nameAr'), dataIndex: 'name_ar', render: v => <span dir="rtl">{v || '—'}</span> },
    { title: t('sort'), dataIndex: 'sort', width: 70 },
    {
      title: t('actions'), render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditing(r);
            form.setFieldsValue(r);
            setFileList(r.image ? [{ uid: '-1', name: 'image', status: 'done', url: `${BASE}${r.image}` }] : []);
            setOpen(true);
          }} />
          <Popconfirm title={t('delete') + '?'} onConfirm={() => api.delete(`/categories/${r.id}`).then(load)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 800 }}>{t('categories')}</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF383C' }}
          onClick={() => { setEditing(null); form.resetFields(); setFileList([]); setOpen(true); }}>
          Add Category
        </Button>
      </div>
      <Table dataSource={data} columns={cols} rowKey="id" />
      <Modal
        title={editing ? t('editCategory') : t('addCategory')}
        open={open} onCancel={() => setOpen(false)}
        onOk={() => form.submit()} width={640}
        okButtonProps={{ style: { background: '#FF383C' } }}
      >
        <Form form={form} layout="vertical" onFinish={save}>
          <BilingualField nameEn="name" nameAr="name_ar" {...{label: t("categoryName")}} required />
          <Form.Item label={t("image")}>
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('uploadImage')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="sort" label={t("sortOrder")}>
            <Input type="number" defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
