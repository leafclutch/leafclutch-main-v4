/**
 * Serialises structured data for embedding in a <script> tag.
 *
 * JSON.stringify leaves `<` untouched, so a value containing `</script>` ends
 * the tag early and whatever follows is parsed as markup. Most of this data
 * comes from the database, where titles and descriptions are edited through
 * the admin panel, so it is not trustworthy enough to inject raw.
 *
 * Escaping to \u sequences keeps the JSON valid and identical in meaning while
 * making it impossible to break out of the element. U+2028 and U+2029 are
 * escaped as well: they are legal in JSON but are line terminators in
 * JavaScript, which would otherwise be a syntax error.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
