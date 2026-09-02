import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function QrBatchPage() {
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ prefix: '', quantity: '' });
  const [saving, setSaving]     = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qr-batches');
      setBatches(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    if (!form.prefix.trim() || !form.quantity) return setError('All fields required');
    setSaving(true);
    try {
      await api.post('/qr-batches', { prefix: form.prefix.trim(), quantity: parseInt(form.quantity) });
      setShowModal(false);
      setForm({ prefix: '', quantity: '' });
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
    if (!window.confirm('Delete this batch?')) return;
    await api.delete(`/qr-batches/${id}`);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Make QR Code</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>Generate branded QR code batches by serial prefix</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }}
          style={{ background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          + Add Batch
        </button>
      </div>

      {/* Table */}
      {loading ? <p style={{ color: '#888' }}>Loading…</p> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #eee' }}>
                {['#', 'Serial Prefix', 'Quantity', 'Date Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No batches yet. Click "Add Batch" to create one.</td></tr>
              )}
              {batches.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', color: '#999' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{b.prefix}</td>
                  <td style={{ padding: '12px 16px' }}>{b.quantity}</td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>
                    {new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDownload(b)} disabled={downloading === b.id}
                      style={{ background: '#1a936f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginRight: 8 }}>
                      {downloading === b.id ? 'Generating…' : '⬇ Download ZIP'}
                    </button>
                    <button onClick={() => handleDelete(b.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 420, boxShadow: '0 8px 32px #0003' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>New QR Code Batch</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 13 }}>Enter a serial prefix and quantity. The system generates serials automatically (e.g. C1 → C1, C2, C3…)</p>

            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Serial Start</label>
              <input value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))}
                placeholder="e.g. ICE-C1"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>Quantity</label>
              <input type="number" min={1} max={500} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 50"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#aaa' }}>Max 500 per batch</p>

              {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
