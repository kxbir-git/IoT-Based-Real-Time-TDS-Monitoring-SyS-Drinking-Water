export default function McButton({
  children,
  variant = 'stone',
  wide = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`mc-btn mc-btn-${variant} ${wide ? 'mc-btn-wide' : ''} ${className}`}
    >
      <span className="mc-btn-label">{children}</span>
    </button>
  );
}
