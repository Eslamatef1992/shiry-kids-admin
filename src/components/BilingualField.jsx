import React from 'react';
import { Tabs, Form, Input } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
};

/**
 * BilingualField — renders EN/AR tabs for a text/textarea/richtext field.
 *
 * Props:
 *   nameEn      — form field name for English value (e.g. "name")
 *   nameAr      — form field name for Arabic value  (e.g. "name_ar")
 *   label       — label shown above the tabs
 *   required    — whether EN field is required
 *   textarea    — use Input.TextArea instead of Input
 *   richtext    — use a ReactQuill WYSIWYG editor (stores HTML) instead of Input
 *   rows        — rows for textarea (default 3)
 */
export default function BilingualField({
  nameEn, nameAr, label, required = false, textarea = false, richtext = false, rows = 3,
}) {
  const Field = textarea ? Input.TextArea : Input;
  const fieldProps = textarea ? { rows, autoSize: { minRows: rows } } : {};

  const renderField = (name, ar = false) => {
    if (richtext) {
      return (
        <Form.Item
          name={name}
          rules={!ar && required ? [{ required: true, message: `${label} (EN) is required` }] : []}
          style={{ marginBottom: 8 }}
          getValueFromEvent={(content) => content}
        >
          <ReactQuill
            theme="snow"
            modules={QUILL_MODULES}
            style={ar ? { direction: 'rtl', textAlign: 'right' } : undefined}
          />
        </Form.Item>
      );
    }
    return (
      <Form.Item
        name={name}
        rules={!ar && required ? [{ required: true, message: `${label} (EN) is required` }] : []}
        style={{ marginBottom: 8 }}
      >
        <Field
          placeholder={ar ? `أدخل ${label} بالعربية` : `Enter ${label} in English`}
          dir={ar ? 'rtl' : undefined}
          style={ar ? { textAlign: 'right' } : undefined}
          {...fieldProps}
        />
      </Form.Item>
    );
  };

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Tabs
        size="small"
        items={[
          { key: 'en', label: '🇬🇧 English', children: renderField(nameEn, false) },
          { key: 'ar', label: '🇸🇦 عربي', children: renderField(nameAr, true) },
        ]}
      />
    </Form.Item>
  );
}
