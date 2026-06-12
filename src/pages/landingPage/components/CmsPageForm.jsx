import React, { useEffect, useState } from 'react';
import { Form, Button, Card, message, Select } from 'antd';
import api from '../../../api/axios';
import BilingualField from '../../../components/BilingualField';

/**
 * CmsPageForm — edits a single CmsPage record (by slug), e.g. Privacy Policy
 * or Terms & Conditions. These pages are rendered on the public site at
 * /privacy-policy and /terms-conditions (illustrations/icons there are
 * static and not editable here — only the title/content text is).
 */
export default function CmsPageForm({ slug }) {
  const [form] = Form.useForm();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = () => {
    setFetching(true);
    api.get('/cms')
      .then(r => {
        const found = (r.data.data || []).find(p => p.slug === slug);
        setPage(found || null);
        if (found) form.setFieldsValue(found);
      })
      .finally(() => setFetching(false));
  };

  useEffect(() => { load(); }, [slug]);

  const save = async (vals) => {
    setLoading(true);
    try {
      if (page) {
        await api.put(`/cms/${page.id}`, vals);
      } else {
        await api.post('/cms', { ...vals, slug });
      }
      message.success('Saved');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ borderRadius: 12 }} loading={fetching}>
      <Form form={form} layout="vertical" onFinish={save} initialValues={{ status: 'published' }}>
        <BilingualField nameEn="title" nameAr="title_ar" label="Page Title" required />
        <BilingualField nameEn="content" nameAr="content_ar" label="Content" richtext />
        <Form.Item name="status" label="Status">
          <Select options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#FF383C' }}>
          Save
        </Button>
      </Form>
    </Card>
  );
}
