import { sanitizeSvg } from './sanitize-svg';

describe('sanitizeSvg', () => {
  it('returns null for markup that is not an SVG document', () => {
    expect(sanitizeSvg('<div>nope</div>')).toBeNull();
  });

  it('returns null for malformed XML', () => {
    expect(sanitizeSvg('<svg><path d="M0 0"')).toBeNull();
  });

  it('preserves benign vector markup', () => {
    const result = sanitizeSvg('<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="red"/></svg>');

    expect(result).toContain('viewBox="0 0 24 24"');
    expect(result).toContain('d="M0 0h24v24H0z"');
    expect(result).toContain('fill="red"');
  });

  it('strips <script> elements', () => {
    const result = sanitizeSvg('<svg><script>alert(1)</script><path d="M0 0"/></svg>');

    expect(result).not.toContain('script');
    expect(result).toContain('d="M0 0"');
  });

  it('strips <foreignObject> elements', () => {
    const result = sanitizeSvg('<svg><foreignObject><b>hi</b></foreignObject></svg>');

    expect(result).not.toContain('foreignObject');
  });

  it('strips event handler attributes at any depth', () => {
    const result = sanitizeSvg('<svg onload="alert(1)"><g><path onclick="alert(2)" d="M0 0"/></g></svg>');

    expect(result).not.toContain('onload');
    expect(result).not.toContain('onclick');
    expect(result).toContain('d="M0 0"');
  });

  it('strips javascript: values', () => {
    const result = sanitizeSvg('<svg><a href="javascript:alert(1)"><path d="M0 0"/></a></svg>');

    expect(result).not.toContain('javascript:');
  });

  it('keeps same-document fragment references', () => {
    const result = sanitizeSvg('<svg><use href="#icon"/></svg>');

    expect(result).toContain('href="#icon"');
  });

  it('strips references that leave the document', () => {
    const result = sanitizeSvg('<svg><use href="https://evil.example/x.svg#icon"/></svg>');

    expect(result).not.toContain('evil.example');
  });
});
