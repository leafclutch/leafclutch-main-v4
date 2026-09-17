/**
 * Blog body rendering.
 *
 * Posts are written in a deliberately small subset of Markdown so the admin
 * needs no editor library: "## " starts a heading, "- " starts a list item,
 * and blank lines separate paragraphs.
 */
export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export function parseBlogContent(content: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: 'list', items: list });
      list = [];
    }
  };

  content.split(/\n{2,}/).forEach(chunk => {
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        flushList();
        blocks.push({ kind: 'heading', text: line.slice(3).trim() });
      } else if (line.startsWith('- ')) {
        list.push(line.slice(2).trim());
      } else {
        flushList();
        blocks.push({ kind: 'paragraph', text: line });
      }
    });
    flushList();
  });

  flushList();
  return blocks;
}

/** Plain text, for meta descriptions and reading-time estimates. */
export function blogPlainText(content: string): string {
  return content
    .replace(/^##\s+/gm, '')
    .replace(/^-\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatBlogDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
