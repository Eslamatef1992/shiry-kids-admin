import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import api from '../../../api/axios';

const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

/**
 * ImageUploadField — Form.Item-compatible image uploader.
 * Uploads the file to /landing/upload and stores the returned URL string
 * as the form field's value. Pass `value`/`onChange` via Form.Item `name`.
 */
export default function ImageUploadField({ value, onChange, width = 160, height = 100 }) {
  const [loading, setLoading] = useState(false);

  const customRequest = async ({ file, onSuccess, onError }) => {
    const fd = new FormData();
    fd.append('file', file);
    setLoading(true);
    try {
      const { data } = await api.post('/landing/upload', fd);
      onChange?.(data.data.url);
      onSuccess?.(data);
    } catch (e) {
      message.error('Upload failed');
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      listType="picture-card"
      showUploadList={false}
      customRequest={customRequest}
      accept="image/*,.svg"
    >
      {value ? (
        <img src={`${BASE}${value}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
    </Upload>
  );
}

export { BASE };
