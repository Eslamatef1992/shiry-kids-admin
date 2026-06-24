import React, { useState } from 'react';
import { Card, Upload, Button, message, Typography, Space, Alert } from 'antd';
import { UploadOutlined, QrcodeOutlined, InboxOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

const { Title, Paragraph, Text } = Typography;

export default function QrGenerator() {
  const { t } = useLang();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (fileList.length === 0) return message.warning('Select an Excel/CSV file first');
    const file = fileList[0].originFileObj;
    const fd = new FormData();
    fd.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/qr-codes/generate', fd, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-codes.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('QR codes generated — check your downloads');
    } catch (e) {
      // The error response is also a blob — read it to surface the real message
      let msg = 'Failed to generate QR codes';
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          msg = JSON.parse(text)?.message || msg;
        } catch {}
      } else {
        msg = e.response?.data?.message || msg;
      }
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 16 }}>{t('qrGenerator')}</h2>
      <Card style={{ borderRadius: 12, maxWidth: 640 }}>
        <Title level={5} style={{ marginTop: 0 }}>{t('generateQrSpreadsheet')}</Title>
        <Paragraph type="secondary">
          Upload an Excel (.xlsx/.xls) or CSV file with one code or link per row in the first column
          (e.g. serial numbers like <Text code>f9b434c57e</Text> or full scan links like{' '}
          <Text code>https://pokiddokw.com/qr/scan.php?code=...</Text>). A QR image will be generated
          for each row and downloaded as a ZIP file, ready to upload in a coupon's
          "Manage QR Codes" section.
        </Paragraph>

        <Upload.Dragger
          accept=".xlsx,.xls,.csv"
          multiple={false}
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
          onRemove={() => setFileList([])}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag an Excel/CSV file here</p>
        </Upload.Dragger>

        <Space style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<QrcodeOutlined />}
            loading={loading}
            disabled={fileList.length === 0}
            onClick={generate}
          >
            Generate & Download ZIP
          </Button>
        </Space>

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message="After downloading, go to Coupons → select a coupon → Manage QR Codes to upload the generated images."
        />
      </Card>
    </div>
  );
}
