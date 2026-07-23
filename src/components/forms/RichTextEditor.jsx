import { createElement, useEffect, useRef } from 'react'
import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Pilcrow, Quote } from 'lucide-react'

const actions = [
  { label: 'Paragraph', icon: Pilcrow, command: 'formatBlock', value: 'p' },
  { label: 'Heading', icon: Heading2, command: 'formatBlock', value: 'h2' },
  { label: 'Subheading', icon: Heading3, command: 'formatBlock', value: 'h3' },
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Bullet list', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
  { label: 'Quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
]

function RichTextEditor({ value, onChange, required = false }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function applyFormat(event, command, commandValue) {
    event.preventDefault()
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-green-700 focus-within:ring-4 focus-within:ring-green-100">
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {actions.map(({ label, icon, command, value: commandValue }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => applyFormat(event, command, commandValue)}
            className="inline-flex h-7 w-7 items-center justify-center text-gray-600 transition hover:bg-white hover:text-green-800"
          >
            {createElement(icon, { size: 13 })}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-required={required}
        data-placeholder="Describe what happened, the progress made, and supporting details..."
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="rich-update-editor min-h-36 px-3.5 py-3 text-sm leading-6 text-gray-700 outline-none"
      />
    </div>
  )
}

export default RichTextEditor
