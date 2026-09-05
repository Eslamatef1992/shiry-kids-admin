import { useEffect, useState } from 'react';
import { useLang } from '../../contexts/LangContext';
import api from '../../api/axios';

export default function QrBatchPage() {
  const { t } = useLang();
  const [batches, setBatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ prefix: '', quantity: '' });
  const [vendorLogo, setVendorLogo]   = useState(null);
  const [shiryLogo, setShiryLogo]     = useState(null);
  const [saving, setSaving]           = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError]             = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qr-batches');
      setBatches(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (raw) => {
    const d = new Date(raw);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    if (!form.prefix.trim() || !form.quantity) return setError(t('allFieldsRequired', 'All fields required'));
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('prefix', form.prefix.trim());
      fd.append('quantity', parseInt(form.quantity));
      if (vendorLogo) fd.append('vendor_logo', vendorLogo);
      if (shiryLogo)  fd.append('shiry_logo',  shiryLogo);
      await api.post('/qr-batches', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      setForm({ prefix: '', quantity: '' });
      setVendorLogo(null);
      setShiryLogo(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating batch');
    } finally { setSaving(false); }
  };

  const handleDownload = async (batch) => {
    setDownloading(batch.id);
    try {
      const res = await api.get(`/qr-batches/${batch.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-batch-${batch.prefix}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete', 'Delete this batch?'))) return;
    await api.delete(`/qr-batches/${id}`);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => { setShowModal(true); setError(''); }}
          style={{ background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          + {t('addBatch')}
        </button>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t('makeQrCode')}</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{t('qrBatchSubtitle')}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? <p style={{ color: '#888' }}>{t('loading', 'Loading…')}</p> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, direction: 'rtl' }}>
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #eee' }}>
                {[t('actions'), t('dateCreated'), t('quantity'), t('serialPrefix'), '#'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>{t('noBatches')}</td></tr>
              )}
              {batches.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDownload(b)} disabled={downloading === b.id}
                      style={{ background: '#1a936f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginLeft: 8 }}>
                      {downloading === b.id ? '...' : `⬇ ${t('downloadZip')}`}
                    </button>
                    <button onClick={() => handleDelete(b.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      {t('delete')}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{formatDate(b.createdAt || b.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>{b.quantity}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{b.prefix}</td>
                  <td style={{ padding: '12px 16px', color: '#999' }}>{i + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 420, boxShadow: '0 8px 32px #0003', direction: 'rtl' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>{t('newQrBatch')}</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 13 }}>{t('newQrBatchHint')}</p>

            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>{t('serialStart')}</label>
              <input value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))}
                placeholder="e.g. ICE-C1"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', direction: 'ltr' }} />

              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>{t('quantity')}</label>
              <input type="number" min={1} max={500} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 50"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 8, boxSizing: 'border-box', direction: 'ltr' }} />
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#aaa' }}>{t('maxPerBatch')}</p>

              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>
                {t('vendorLogo', 'شعار المتجر (اختياري)')}
              </label>
              <input type="file" accept="image/*"
                onChange={e => setVendorLogo(e.target.files[0] || null)}
                style={{ width: '100%', marginBottom: 8, fontSize: 13 }} />
              {vendorLogo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: '#555' }}>
                  <img src={URL.createObjectURL(vendorLogo)} alt="vendor logo preview"
                    style={{ height: 48, objectFit: 'contain', borderRadius: 6, border: '1px solid #eee', background: '#f9f9f9' }} />
                  <span>{vendorLogo.name}</span>
                  <button type="button" onClick={() => setVendorLogo(null)}
                    style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              )}

              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, marginTop: 8 }}>
                {t('shiryLogo', 'شعار شيري (اختياري)')}
              </label>
              <input type="file" accept="image/*"
                onChange={e => setShiryLogo(e.target.files[0] || null)}
                style={{ width: '100%', marginBottom: 8, fontSize: 13 }} />
              {shiryLogo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, color: '#555' }}>
                  <img src={URL.createObjectURL(shiryLogo)} alt="shiry logo preview"
                    style={{ height: 48, objectFit: 'contain', borderRadius: 6, border: '1px solid #eee', background: '#f9f9f9' }} />
                  <span>{shiryLogo.name}</span>
                  <button type="button" onClick={() => setShiryLogo(null)}
                    style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              )}

              {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  {t('cancel')}
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? '...' : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
