function RichTextContent({ html, className = '' }) {
  return (
    <div
      className={`rich-update-content whitespace-pre-wrap text-sm leading-6 text-gray-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: html || 'No update description available.' }}
    />
  )
}

export default RichTextContent
