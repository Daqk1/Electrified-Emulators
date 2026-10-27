import { useId } from 'react';

export function Grid() {
  const id = useId().replace(/:/g, '');
  const minor = `grid-minor-${id}`;
  const major = `grid-major-${id}`;
  return <g data-layer="grid">
    <defs>
      <pattern id={minor} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
      </pattern>
      <pattern id={major} width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill={`url(#${minor})`} />
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.2" />
      </pattern>
    </defs>
    <rect x="-10000" y="-10000" width="20000" height="20000" fill={`url(#${major})`} />
  </g>;
}
