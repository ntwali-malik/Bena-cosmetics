import React, { useMemo } from 'react';

function InvoiceModal({ sale, onClose }) {
  const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(n || 0));
  const invoiceNo = useMemo(() => {
    if (sale?.invoiceNumber) return sale.invoiceNumber;
    const base = (sale?._id || sale?.id || '000000').toString().slice(-6).toUpperCase();
    const t = sale?.saleDate ? new Date(sale.saleDate) : new Date();
    return `INV-${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}-${base}`;
  }, [sale]);

  if (!sale) return null;

  const items = Array.isArray(sale.items) && sale.items.length > 0
    ? sale.items
    : (sale.product ? [{ product: sale.product, quantity: sale.quantity, unitPrice: sale.unitPrice, lineTotal: sale.totalPrice }] : []);
  const grand = (sale.totalAmount !== undefined && sale.totalAmount !== null)
    ? Number(sale.totalAmount)
    : items.reduce((s, it) => s + Number(it.lineTotal || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <div className="modal-card invoice-print">
        <div className="invoice-header">
          <div className="brand">
            <img src="/logo.png" alt="Bena Cosmetics" className="brand-logo" />
            <div className="brand-col">
              <h3 className="brand-name">Bena Cosmetics Ltd</h3>
              <div className="brand-tag muted">Natural and Organic Products</div>
              <div className="brand-contact muted">Remera, Kisimenti • 0788776218 • info@benacosmetics.rw</div>
            </div>
          </div>
          <div className="invoice-meta-right">
            <div className="inv-title">INVOICE</div>
            <div className="inv-line">
              <span className="muted">Invoice No:</span>
              <span>{invoiceNo}</span>
            </div>
            <div className="inv-line">
              <span className="muted">Date:</span>
              <span>{sale.saleDate ? new Date(sale.saleDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)}</span>
            </div>
          </div>
        </div>

        <div className="invoice-meta">
          <div>
            <div className="muted">Customer</div>
            <div>{sale.customerName || 'Walk-in'}</div>
          </div>
          <div>
            <div className="muted">Payment</div>
            <div>{sale.paymentMethod || 'cash'}</div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const name = it.product?.name || it.product || '';
              const q = Number(it.quantity || 0);
              const u = Number(it.unitPrice || 0);
              const lt = (it.lineTotal !== undefined && it.lineTotal !== null) ? Number(it.lineTotal) : q * u;
              return (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{q}</td>
                  <td>{fmt(u)}</td>
                  <td>{fmt(lt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="muted">Subtotal</div>
          <div>{fmt(grand)}</div>
        </div>
        <div className="invoice-totals">
          <div className="muted">Grand Total</div>
          <div className="grand">{fmt(grand)}</div>
        </div>

        <div className="invoice-footer">
          <div className="foot-left">
            <div className="muted">Thank you for your business!</div>
            <div className="muted">Payments are non-refundable after 7 days. Keep this invoice for your records.</div>
          </div>
          <div className="foot-right">
            <div className="muted">Bena Cosmetics Ltd</div>
            <div className="muted">Remera, Kisimenti • 0788776218</div>
          </div>
        </div>

        <div className="modal-actions no-print">
          <button className="admin-ghost" onClick={onClose}>Close</button>
          <button className="admin-primary" onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;


