// PoolPay · Dashboard shell — shared Lucide icon wrapper
// Loads lucide UMD (window.lucide). Each icon's data is at window.lucide.icons[Name]
// In lucide@0.x UMD, icons are arrays shaped like [tag, attrs, children?] or
// an object { default: [[tag, attrs], ...] }. We try multiple shapes.

function Lu({ name, size = 16, sw = 1.75, className = '', style = {}, ...rest }) {
  const L = window.lucide;
  let children = null;

  if (L && L.icons) {
    const raw = L.icons[name];
    if (Array.isArray(raw)) {
      // raw is top-level [tag, attrs, children?]
      if (typeof raw[0] === 'string' && raw[2] && Array.isArray(raw[2])) {
        children = raw[2];
      } else if (Array.isArray(raw[0])) {
        children = raw;
      }
    } else if (raw && Array.isArray(raw.default)) {
      const d = raw.default;
      if (typeof d[0] === 'string' && Array.isArray(d[2])) {
        children = d[2];
      } else {
        children = d;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`lu ${className}`}
      style={style}
      {...rest}
    >
      {children && children.map((c, i) => {
        if (!Array.isArray(c)) return null;
        const [tag, attrs] = c;
        return React.createElement(tag, { key: i, ...(attrs || {}) });
      })}
    </svg>
  );
}

window.Lu = Lu;
