import { Marked } from 'marked';

/**
 * Markdown from the assistant to HTML. Raw HTML inside the answer is shown as text, never as markup; the result
 * then goes through Angular's sanitizer when bound with [innerHTML]. Links open in a new tab.
 */
const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      const safe = /^https?:\/\//i.test(href) ? href : '#';
      return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

export function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false });
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
