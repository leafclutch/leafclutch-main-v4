'use client';

import { useMemo, useState } from 'react';
import {
  useAdmin,
  BLOG_CATEGORIES,
  estimateReadMinutes,
  type BlogPost,
  type NewBlogPost,
} from '@/app/context/AdminContext';
import { ConfirmDialog, Field, FieldGroup, ImageDropzone, Modal } from './shared';

const SITE = 'https://leafclutchtech.com.np';

/** Title -> URL slug, the same shape the public route expects. */
const slugify = (text: string) =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function BlogFormModal({ initial, onClose, onSave }: {
  initial?: BlogPost;
  onClose: () => void;
  onSave: (data: NewBlogPost) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState(initial?.author ?? 'Leafclutch Team');
  const [category, setCategory] = useState(initial?.category ?? 'Product');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? '');
  const [status, setStatus] = useState<'active' | 'draft'>(initial?.status ?? 'active');

  // Slug follows the title until the admin edits it by hand.
  const effectiveSlug = slugTouched ? slug : slugify(title);
  const preview = coverImage || imageUrl.trim();
  const readMinutes = estimateReadMinutes(content);

  const metaTitle = seoTitle || title;
  const metaDescription = seoDescription || excerpt;

  return (
    <Modal title={initial ? 'Edit Post' : 'New Post'} onClose={onClose} wide>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSave({
            title, slug: effectiveSlug || slugify(title), excerpt, content,
            coverImage: preview, author, category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            publishedAt, readMinutes, seoTitle, seoDescription, status,
          });
        }}
        className="space-y-4"
      >
        <Field label="Title *">
          <input required value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="HRestroSewa: Restaurant Management Software Built for Nepal" />
        </Field>

        <Field label="URL Slug" hint="Lowercase words separated by hyphens. Follows the title until you edit it.">
          <input
            value={effectiveSlug}
            onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            className="admin-input"
            placeholder="hrestrosewa-restaurant-management-nepal"
          />
        </Field>
        {/* Live URL preview so the admin sees the real address before saving. */}
        <p className="-mt-2 break-all rounded-lg bg-[#F1F5F9] px-3 py-2 text-[11px] font-semibold text-muted-foreground">
          {SITE}/blogs/<span className="text-accent">{effectiveSlug || 'your-post-url'}</span>
        </p>

        <Field label="Cover Image" hint="Upload one, or paste an image URL below">
          <ImageDropzone value={coverImage} onChange={setCoverImage} />
        </Field>
        {!coverImage && (
          <Field label="…or Image URL">
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="admin-input" placeholder="https://…/cover.jpg" />
          </Field>
        )}
        {preview && (
          <FieldGroup label="Image Preview">
            <img
              src={preview}
              alt=""
              className="aspect-16/9 w-full max-w-sm rounded-xl border border-border object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </FieldGroup>
        )}

        <Field label="Excerpt *" hint="One or two sentences. Used on the blog list and as the default meta description.">
          <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="admin-input resize-none" />
        </Field>

        <Field
          label="Content *"
          hint={`Blank line = new paragraph · "## " = heading · "- " = bullet. About ${readMinutes} min read.`}
        >
          <textarea required value={content} onChange={e => setContent(e.target.value)} rows={14} className="admin-input resize-y font-mono text-xs leading-relaxed" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Author">
            <input value={author} onChange={e => setAuthor(e.target.value)} className="admin-input" />
          </Field>
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className="admin-input">
              {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Published Date">
            <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="admin-input" />
          </Field>
        </div>

        <Field label="Tags" hint="Comma separated">
          <input value={tags} onChange={e => setTags(e.target.value)} className="admin-input" placeholder="HRestroSewa, Restaurant Software, Nepal" />
        </Field>

        {/* Search preview — what Google is likely to show. */}
        <FieldGroup label="Search Result Preview">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-[11px] text-[#5F6368]">{SITE}/blogs/{effectiveSlug || '…'}</p>
            <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab]">
              {metaTitle || 'Your post title'}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-[#4d5156]">
              {metaDescription || 'Your excerpt or SEO description appears here.'}
            </p>
            <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
              Title {metaTitle.length}/60 · Description {metaDescription.length}/160
              {metaTitle.length > 60 || metaDescription.length > 160 ? ' · may be truncated' : ''}
            </p>
          </div>
        </FieldGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO Title" hint="Defaults to the post title. Aim for under 60 characters.">
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="admin-input" />
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'draft')} className="admin-input">
              <option value="active">Published</option>
              <option value="draft">Draft — hidden</option>
            </select>
          </Field>
        </div>

        <Field label="SEO Description" hint="Defaults to the excerpt. Aim for under 160 characters.">
          <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} className="admin-input resize-none" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save Post' : 'Publish Post'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function BlogsPanel() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, reorderBlogPost } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; post?: BlogPost } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const sorted = useMemo(
    () => [...blogPosts].sort((a, b) => a.order - b.order),
    [blogPosts],
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Content</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Blogs</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Posts on the public blog. Each one gets its own URL, cover image and
            search-engine title and description.
          </p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
          + New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No posts yet.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((post, index) => (
              <div key={post.id} className="flex items-start gap-3 bg-[#F8FAFC] rounded-xl p-3">
                <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white text-sm font-bold text-muted-foreground">
                  {post.coverImage
                    ? <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                    : post.title.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{post.title}</p>
                  <p className="text-[11px] text-accent truncate">/blogs/{post.slug}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {post.status === 'draft' ? 'Draft · ' : ''}{post.category} · {post.publishedAt} · {post.readMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled={index === 0} onClick={() => reorderBlogPost(post.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                  <button type="button" disabled={index === sorted.length - 1} onClick={() => reorderBlogPost(post.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a href={`/blogs/${post.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent text-xs font-semibold">View</a>
                  <button type="button" onClick={() => setModal({ mode: 'edit', post })} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(post)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <BlogFormModal
          initial={modal.post}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.post) updateBlogPost(modal.post.id, data);
            else addBlogPost(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete post?"
          description={`"${deleteTarget.title}" will be removed from the blog.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteBlogPost(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
