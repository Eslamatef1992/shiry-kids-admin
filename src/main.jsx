import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider theme={{ token: { colorPrimary: '#FF383C', borderRadius: 8 } }}>
    <App />
  </ConfigProvider>
);
