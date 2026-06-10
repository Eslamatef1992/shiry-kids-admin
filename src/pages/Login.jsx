import React, { useEffect, useRef } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const logoRef = useRef(null);

  // Logo bounce-in animation on mount
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: 'scale(0.4) translateY(-20px)' },
        { opacity: 1, transform: 'scale(1.08) translateY(0px)' },
        { opacity: 1, transform: 'scale(1) translateY(0px)' },
      ],
      { duration: 700, easing: 'cubic-bezier(0.34,1.56,0.64,1)', fill: 'forwards' }
    );
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch {
      message.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            ref={logoRef}
            src="/logo.png"
            alt="Shiry Kids"
            style={{ width: 110, marginBottom: 12, opacity: 0 }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#FF383C', margin: 0 }}>
            Shiry Kids Admin
          </h1>
          <p style={{ color: '#888', marginTop: 6, fontSize: 13 }}>
            Sign in to your dashboard
          </p>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@sherykids.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ background: '#FF383C', height: 48, fontWeight: 700, borderColor: '#FF383C' }}
          >
            Sign In
          </Button>
        </Form>
      </Card>

      {/* Powered by */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#aaa' }}>Powered by </span>
        <a
          href="https://teknulugy.com"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#FF383C',
            textDecoration: 'none',
            borderBottom: '1.5px solid #FF383C',
            paddingBottom: 1,
          }}
        >
          teknulugy
        </a>
      </div>
    </div>
  );
}
