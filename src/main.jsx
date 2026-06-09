import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import App from './App';

import { LangProvider, useLang } from './contexts/LangContext';
import './index.css';

function Root() {
  const { lang, isRtl } = useLang();
  return (
    <ConfigProvider
      locale={lang === 'ar' ? arEG : enUS}
      direction={isRtl ? 'rtl' : 'ltr'}
      theme={{ token: { colorPrimary: '#FF383C', borderRadius: 8 } }}
    >
      <App />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <Root />
  </LangProvider>
);
