import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders lists, emphasis and safe links', () => {
    const html = renderMarkdown('**Go** to the [wiki](https://example.org)\n\n1. one\n2. two');
    expect(html).toContain('<strong>Go</strong>');
    expect(html).toContain('<ol>');
    expect(html).toContain('href="https://example.org" target="_blank" rel="noopener noreferrer"');
  });

  it('shows raw HTML as text and drops unsafe links and images', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\nSee [x](javascript:alert(1)) and ![img](https://x/y.png)');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('href="#"');
    expect(html).not.toContain('<img');
  });
});
