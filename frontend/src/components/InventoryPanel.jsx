export default function InventoryPanel({ title, subtitle, children, wide = false }) {
  return (
    <section className={`inv-panel ${wide ? 'inv-panel-wide' : ''}`}>
      {(title || subtitle) && (
        <header className="inv-panel-head">
          {title && <h2 className="inv-panel-title">{title}</h2>}
          {subtitle && <p className="inv-panel-sub">{subtitle}</p>}
        </header>
      )}
      <div className="inv-panel-body">{children}</div>
    </section>
  );
}
