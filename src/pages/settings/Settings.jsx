import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Tabs, message, InputNumber } from 'antd';
import api from '../../api/axios';
import { useLang } from '../../contexts/LangContext';

export default function Settings() {
  const { t } = useLang();
  const [data, setData] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      const flat = Object.values(r.data.data).flat().reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
      setData(r.data.data);
      form.setFieldsValue(flat);
    });
  }, []);

  const save = async (vals) => {
    setLoading(true);
    try { await api.post('/settings', vals); message.success('Settings saved'); }
    catch { message.error('Error saving settings'); }
    finally { setLoading(false); }
  };

  const groups = Object.entries(data);

  const tabItems = groups.map(([group, settings]) => ({
    key: group,
    label: group.charAt(0).toUpperCase() + group.slice(1),
    children: (
      <Card style={{borderRadius:12}}>
        {settings.map(s => (
          <Form.Item key={s.key} name={s.key} label={s.label || s.key} style={{maxWidth:480}}>
            {s.type === 'number' ? <InputNumber style={{width:'100%'}} /> : <Input />}
          </Form.Item>
        ))}
      </Card>
    ),
  }));

  return (
    <div>
      <h2 style={{fontWeight:800,marginBottom:24}}>{t('settings')}</h2>
      <Form form={form} layout="vertical" onFinish={save}>
        <Tabs items={tabItems} />
        <Button type="primary" htmlType="submit" loading={loading} style={{background:'#FF383C',marginTop:16}}>{t('saveSettings')}</Button>
      </Form>
    </div>
  );
}
