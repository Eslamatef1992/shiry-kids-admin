import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import api from '../../../api/axios';
import BilingualField from '../../../components/BilingualField';
import ImageUploadField from './ImageUploadField';

/**
 * SectionForm — generic editor for a single LandingSection (key/content JSON).
 *
 * `fields` is an array of field descriptors:
 *   { type: 'bilingual', name, nameAr, label, textarea?, required? }
 *   { type: 'text',      name, label, placeholder? }
 *   { type: 'image',     name, label }
 */
export default function SectionForm({ sectionKey, fields }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    api.get('/landing/sections')
      .then(r => form.setFieldsValue(r.data.data?.[sectionKey] || {}))
      .finally(() => setFetching(false));
  }, [sectionKey]);

  const save = async (vals) => {
    setLoading(true);
    try {
      await api.put(`/landing/sections/${sectionKey}`, { content: vals });
      message.success('Saved');
    } catch (e) {
      message.error(e.response?.data?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ borderRadius: 12 }} loading={fetching}>
      <Form form={form} layout="vertical" onFinish={save}>
        {fields.map(f => {
          if (f.type === 'bilingual') {
            return (
              <BilingualField
                key={f.name}
                nameEn={f.name}
                nameAr={f.nameAr}
                label={f.label}
                textarea={f.textarea}
                required={f.required}
                rows={f.rows}
              />
            );
          }
          if (f.type === 'image') {
            return (
              <Form.Item key={f.name} name={f.name} label={f.label}>
                <ImageUploadField />
              </Form.Item>
            );
          }
          return (
            <Form.Item key={f.name} name={f.name} label={f.label} style={{ maxWidth: 480 }}>
              <Input placeholder={f.placeholder} />
            </Form.Item>
          );
        })}
        <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#FF383C' }}>
          Save
        </Button>
      </Form>
    </Card>
  );
}
