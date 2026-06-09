import React from 'react';
import { Tabs, Form, Input } from 'antd';

/**
 * BilingualField — renders EN/AR tabs for a text/textarea field.
 *
 * Props:
 *   nameEn      — form field name for English value (e.g. "name")
 *   nameAr      — form field name for Arabic value  (e.g. "name_ar")
 *   label       — label shown above the tabs
 *   required    — whether EN field is required
 *   textarea    — use Input.TextArea instead of Input
 *   rows        — rows for textarea (default 3)
 */
export default function BilingualField({
  nameEn, nameAr, label, required = false, textarea = false, rows = 3,
}) {
  const Field = textarea ? Input.TextArea : Input;
  const fieldProps = textarea ? { rows, autoSize: { minRows: rows } } : {};

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Tabs
        size="small"
        items={[
          {
            key: 'en',
            label: '🇬🇧 English',
            children: (
              <Form.Item
                name={nameEn}
                rules={required ? [{ required: true, message: `${label} (EN) is required` }] : []}
                style={{ marginBottom: 8 }}
              >
                <Field placeholder={`Enter ${label} in English`} {...fieldProps} />
              </Form.Item>
            ),
          },
          {
            key: 'ar',
            label: '🇸🇦 عربي',
            children: (
              <Form.Item
                name={nameAr}
                style={{ marginBottom: 8 }}
              >
                <Field
                  placeholder={`أدخل ${label} بالعربية`}
                  dir="rtl"
                  style={{ textAlign: 'right' }}
                  {...fieldProps}
                />
              </Form.Item>
            ),
          },
        ]}
      />
    </Form.Item>
  );
}
