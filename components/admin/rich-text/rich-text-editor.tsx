import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Table as TableIcon,
  Trash2,
  ImageIcon,
  Loader2,
  Globe,
  Upload,
  ChevronDown,
  Plus,
  Check,
  ListOrdered
} from 'lucide-react'
import { Button, Input, Tooltip, Dropdown } from 'antd'
import { cn } from '@/lib/utils'

interface MenuBarProps {
  editor: Editor | null
  onMediaUpload?: (file: File) => Promise<string>
  showMediaUpload?: boolean
}

const ToolbarButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode; 
  title?: string 
}) => (
  <Tooltip title={title} mouseEnterDelay={0.5}>
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200",
        "hover:bg-slate-100 text-slate-600",
        active && "bg-primary text-white hover:bg-primary/90 shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  </Tooltip>
)

const MenuBar: React.FC<MenuBarProps> = ({ editor, onMediaUpload, showMediaUpload = false }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false)
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const imageMenuRef = useRef<HTMLDivElement>(null)
  const linkMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setIsImageMenuOpen(false)
      }
      if (linkMenuRef.current && !linkMenuRef.current.contains(event.target as Node)) {
        setIsLinkMenuOpen(false)
      }
    }
    if (isImageMenuOpen || isLinkMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isImageMenuOpen, isLinkMenuOpen])

  if (!editor) return null

  const handleLinkSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkMenuOpen(false)
    }
  }

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run()
    setIsLinkMenuOpen(false)
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0]
        setIsImageMenuOpen(false)
        if (onMediaUpload) {
          setIsUploading(true)
          try {
            const url = await onMediaUpload(file)
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          } catch (error) {
            console.error('Image upload failed:', error)
          } finally {
            setIsUploading(false)
          }
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              editor.chain().focus().setImage({ src: e.target.result as string }).run()
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }
    input.click()
  }

  const handleImageUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setIsImageMenuOpen(false)
    }
  }



  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Basic Formatting */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const Icon = { 1: Heading1, 2: Heading2, 3: Heading3, 4: Heading4, 5: Heading5, 6: Heading6 }[level as 1|2|3|4|5|6]
          return (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run()}
              active={editor.isActive('heading', { level })}
              title={`Heading ${level}`}
            >
              <Icon className="h-4 w-4" />
            </ToolbarButton>
          )
        })}
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Links & Tables */}
      <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
        <div className="relative" ref={linkMenuRef}>
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                setLinkUrl(editor.getAttributes('link').href || '')
              }
              setIsLinkMenuOpen(!isLinkMenuOpen)
            }}
            active={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          {isLinkMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-200">
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                      autoFocus
                      className="h-9 text-sm"
                    />
                    <Button
                      type="primary"
                      onClick={() => handleLinkSubmit()}
                      className="h-9 w-9 p-0 flex items-center justify-center shrink-0"
                      disabled={!linkUrl}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {editor.isActive('link') && (
                  <Button
                    type="text"
                    danger
                    onClick={handleRemoveLink}
                    className="w-full justify-start h-8 text-[11px] font-bold"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Remove Link
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'insertTable',
                label: 'Insert Table (3x3)',
                icon: <TableIcon className="h-3.5 w-3.5" />,
                onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
              },
              { type: 'divider' },
              {
                key: 'addRowBefore',
                label: 'Add Row Before',
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().addRowBefore().run(),
              },
              {
                key: 'addRowAfter',
                label: 'Add Row After',
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().addRowAfter().run(),
              },
              {
                key: 'deleteRow',
                label: 'Delete Row',
                danger: true,
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().deleteRow().run(),
              },
              { type: 'divider' },
              {
                key: 'addColumnBefore',
                label: 'Add Column Before',
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().addColumnBefore().run(),
              },
              {
                key: 'addColumnAfter',
                label: 'Add Column After',
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().addColumnAfter().run(),
              },
              {
                key: 'deleteColumn',
                label: 'Delete Column',
                danger: true,
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().deleteColumn().run(),
              },
              { type: 'divider' },
              {
                key: 'deleteTable',
                label: 'Delete Entire Table',
                danger: true,
                disabled: !editor.isActive('table'),
                onClick: () => editor.chain().focus().deleteTable().run(),
              },
            ],
          }}
        >
          <div className="flex">
            <ToolbarButton
              onClick={() => {}}
              active={editor.isActive('table')}
              title="Table Controls"
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </Dropdown>
      </div>

      {showMediaUpload && (
        <div className="relative" ref={imageMenuRef}>
          <button
            type="button"
            onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
            disabled={isUploading}
            className={cn(
              "h-8 px-3 flex items-center gap-2 transition-all rounded-lg border text-sm font-semibold",
              isImageMenuOpen 
                ? "border-primary bg-primary/5 text-primary" 
                : "border-slate-200 hover:border-primary hover:text-primary text-slate-600"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                <span>Media</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isImageMenuOpen && "rotate-180")} />
              </>
            )}
          </button>

          {isImageMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-200">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload</label>
                  <Button
                    onClick={handleImageUpload}
                    className="w-full h-12 border-dashed flex flex-col items-center justify-center gap-1 group"
                  >
                    <Upload className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-primary">Select Files</span>
                  </Button>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Media URL</label>
                  <div className="flex gap-2">
                    <Input
                      prefix={<Globe className="h-3.5 w-3.5 text-slate-300" />}
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleImageUrlSubmit()}
                      className="h-9 text-sm"
                    />
                    <Button
                      type="primary"
                      onClick={() => handleImageUrlSubmit()}
                      className="h-9 w-9 p-0 flex items-center justify-center shrink-0"
                      disabled={!imageUrl}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface AppRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onMediaUpload?: (file: File) => Promise<string>
  placeholder?: string
  showMediaUpload?: boolean
  height?: string
}

export const AppRichTextEditor = ({
  value,
  onChange,
  onMediaUpload,
  placeholder = 'Write something...',
  showMediaUpload = true,
  height = '400px'
}: AppRichTextEditorProps) => {
  const lastExternalValue = useRef<string>(value || '')

  const handleUpdate = useCallback(({ editor }: { editor: Editor }) => {
    const html = editor.getHTML()
    lastExternalValue.current = html
    onChange(html)
  }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      ImageResize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: handleUpdate,
  })

  // Only sync content from outside when the value truly changed externally
  useEffect(() => {
    if (editor && value !== undefined && value !== lastExternalValue.current) {
      lastExternalValue.current = value
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div className={cn(
      "border border-slate-200 rounded-xl bg-white flex flex-col transition-all duration-300 shadow-sm overflow-hidden",
      "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5"
    )}>
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-100 bg-slate-50/30">
        <MenuBar editor={editor} onMediaUpload={onMediaUpload} showMediaUpload={showMediaUpload} />
      </div>
      <div
        className="overflow-y-auto slim-scrollbar cursor-text"
        style={{ minHeight: '200px', height: height }}
        onClick={(e) => {
          if (!editor) return
          
          // If the user is selecting text, do not shift focus or clear selection
          const selection = window.getSelection()
          if (selection && !selection.isCollapsed) return
          
          const target = e.target as HTMLElement
          const isOutsideEditor = !target.closest('.ProseMirror')
          
          if (isOutsideEditor) {
            editor.chain().focus('end').run()
          }
        }}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "p-6 min-h-full text-slate-700 text-[15px] leading-relaxed outline-none prose-custom",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
            // Headings
            "[&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-6",
            "[&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-4",
            "[&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-3",
            "[&_.ProseMirror_h4]:text-lg [&_.ProseMirror_h4]:font-bold [&_.ProseMirror_h4]:mb-2",
            "[&_.ProseMirror_h5]:text-base [&_.ProseMirror_h5]:font-bold [&_.ProseMirror_h5]:mb-2",
            "[&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-bold [&_.ProseMirror_h6]:mb-2",
            // Lists
            "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-4",
            "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-4",
            // Tables
            "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:my-6",
            "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-slate-200 [&_.ProseMirror_td]:p-2",
            "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-slate-200 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-slate-50",
            // Links & Images
            "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
            "[&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:shadow-md [&_.ProseMirror_img]:mx-auto"
          )}
        />
      </div>
    </div>
  )
}