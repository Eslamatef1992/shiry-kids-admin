import React from 'react';
import { Tabs } from 'antd';
import SectionForm from './components/SectionForm';
import ItemsManager from './components/ItemsManager';
import CmsPageForm from './components/CmsPageForm';
import { useLang } from '../../contexts/LangContext';

const HERO_FIELDS = [
  { type: 'bilingual', name: 'title', nameAr: 'title_ar', label: 'Hero Title', required: true },
  { type: 'bilingual', name: 'subtitle', nameAr: 'subtitle_ar', label: 'Hero Subtitle', textarea: true },
  { type: 'image', name: 'background_image', label: 'Background Image' },
  { type: 'bilingual', name: 'cta_primary_text', nameAr: 'cta_primary_text_ar', label: 'Primary Button Text' },
  { type: 'text', name: 'cta_primary_link', label: 'Primary Button Link', placeholder: 'https://... or app store link' },
  { type: 'bilingual', name: 'cta_secondary_text', nameAr: 'cta_secondary_text_ar', label: 'Secondary Button Text' },
  { type: 'text', name: 'cta_secondary_link', label: 'Secondary Button Link', placeholder: 'https://... or #section' },
];

const ABOUT_FIELDS = [
  { type: 'bilingual', name: 'title', nameAr: 'title_ar', label: 'Title', required: true },
  { type: 'bilingual', name: 'text', nameAr: 'text_ar', label: 'Description', textarea: true, rows: 5 },
  { type: 'image', name: 'image', label: 'Image' },
];

const ABOUT2_FIELDS = [
  { type: 'bilingual', name: 'title', nameAr: 'title_ar', label: 'Title', required: true },
  { type: 'bilingual', name: 'text', nameAr: 'text_ar', label: 'Description', textarea: true, rows: 5 },
];

const DOWNLOAD_FIELDS = [
  { type: 'bilingual', name: 'title', nameAr: 'title_ar', label: 'Title', required: true },
  { type: 'bilingual', name: 'subtitle', nameAr: 'subtitle_ar', label: 'Subtitle', textarea: true },
  { type: 'image', name: 'mockup_image', label: 'Phone Mockup Image' },
  { type: 'image', name: 'app_store_image', label: 'App Store Badge Image' },
  { type: 'text', name: 'app_store_link', label: 'App Store Link', placeholder: 'https://apps.apple.com/...' },
  { type: 'image', name: 'google_play_image', label: 'Google Play Badge Image' },
  { type: 'text', name: 'google_play_link', label: 'Google Play Link', placeholder: 'https://play.google.com/...' },
];

const FOOTER_FIELDS = [
  { type: 'bilingual', name: 'copyright', nameAr: 'copyright_ar', label: 'Copyright Text' },
  { type: 'text', name: 'facebook_link', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { type: 'text', name: 'instagram_link', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { type: 'text', name: 'twitter_link', label: 'Twitter / X URL', placeholder: 'https://x.com/...' },
  { type: 'text', name: 'tiktok_link', label: 'TikTok URL', placeholder: 'https://tiktok.com/...' },
  { type: 'text', name: 'youtube_link', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
];

export default function LandingPage() {
  const { t } = useLang();
  const items = [
    { key: 'hero', label: 'Hero', children: <SectionForm sectionKey="hero" fields={HERO_FIELDS} /> },
    { key: 'about', label: 'About', children: <SectionForm sectionKey="about" fields={ABOUT_FIELDS} /> },
    {
      key: 'about2', label: 'About (Gallery)', children: (
        <div>
          <SectionForm sectionKey="about2" fields={ABOUT2_FIELDS} />
          <h3 style={{ margin: '24px 0 12px', fontWeight: 700 }}>{t('galleryImages')}</h3>
          <ItemsManager section="about_gallery" addLabel="Image" imageLabel="Image" showTitle={false} />
        </div>
      ),
    },
    {
      key: 'how_to_use', label: 'How To Use', children: (
        <ItemsManager section="how_to_use" addLabel="Step" imageLabel="Screenshot" showTitle />
      ),
    },
    {
      key: 'partners', label: 'Our Partners', children: (
        <ItemsManager section="partners" addLabel="Partner" imageLabel="Logo" showTitle={false} showLink />
      ),
    },
    {
      key: 'why_choose', label: 'Why Choose Us', children: (
        <ItemsManager section="why_choose" addLabel="Feature" imageLabel="Icon" showTitle showDescription />
      ),
    },
    { key: 'download_app', label: 'Download App', children: <SectionForm sectionKey="download_app" fields={DOWNLOAD_FIELDS} /> },
    { key: 'footer', label: 'Footer & Social', children: <SectionForm sectionKey="footer" fields={FOOTER_FIELDS} /> },
    { key: 'privacy_policy', label: 'Privacy Policy', children: <CmsPageForm slug="privacy-policy" /> },
    { key: 'terms_conditions', label: 'Terms & Conditions', children: <CmsPageForm slug="terms-conditions" /> },
  ];

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{t('landingPage')}</h2>
      <Tabs items={items} type="card" />
    </div>
  );
}
