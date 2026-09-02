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
  Check,
  ListOrdered,
  UploadCloud,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { Input, Tooltip, Dropdown } from 'antd'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AdminImageUpload } from "@/components/admin/forms/admin-image-upload"
import { AdminModal } from "@/components/admin/ui/admin-modal"
import { MediaService } from "@/lib/services/admin-service"

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
        "h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer",
        "hover:bg-slate-100 text-slate-600",
        active && "bg-primary text-white hover:bg-primary/90 shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  </Tooltip>
)

const MenuBar: React.FC<MenuBarProps> = ({ editor, showMediaUpload = true }) => {
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false)
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkMenuRef = useRef<HTMLDivElement>(null)
  const imageMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkMenuRef.current && !linkMenuRef.current.contains(event.target as Node)) {
        setIsLinkMenuOpen(false)
      }
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setIsImageMenuOpen(false)
      }
    }
    if (isLinkMenuOpen || isImageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLinkMenuOpen, isImageMenuOpen])

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

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const res = await MediaService.uploadFile(file)
      if (res.success && res.data?.url) {
        const publicUrl = res.data.url
        editor.chain().focus().setImage({ src: publicUrl }).run()
        setIsImageMenuOpen(false)
        toast.success(`Image "${file.name}" uploaded & inserted into content!`)
      } else {
        toast.error(res?.message || "Failed to upload image.")
      }
    } catch (err: any) {
      console.error("Direct rich text upload error:", err)
      toast.error(err?.message || "Failed to upload image.")
    } finally {
      setIsUploading(false)
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

      {/* Links, Tables & Images */}
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
                    <button
                      type="button"
                      onClick={() => handleLinkSubmit()}
                      className="h-9 w-9 p-0 flex items-center justify-center shrink-0 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                      disabled={!linkUrl}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="w-full text-left h-8 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-md px-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Link</span>
                  </button>
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

        {showMediaUpload && (
          <ToolbarButton
            onClick={() => setIsLibraryModalOpen(true)}
            active={editor.isActive('image') || isLibraryModalOpen}
            title={editor.isActive('image') ? "Edit or Replace Selected Image" : "Insert Image from Gallery"}
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Media Library Selection Modal */}
      {isLibraryModalOpen && (
        <AdminModal
          isOpen={isLibraryModalOpen}
          onClose={() => setIsLibraryModalOpen(false)}
          title={editor.isActive('image') ? "Edit or Replace Image" : "Insert Image into Content"}
          description="Upload a new photo or select an existing asset from your Media Gallery."
          maxWidth="2xl"
        >
          <div className="py-2">
            <AdminImageUpload
              label=""
              value={editor.isActive('image') ? (editor.getAttributes('image').src || '') : ''}
              onChange={(url) => {
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run()
                  toast.success("Image inserted into content!")
                } else if (editor.isActive('image')) {
                  editor.chain().focus().deleteSelection().run()
                  toast.info("Image removed from content.")
                }
                setIsLibraryModalOpen(false)
              }}
            />
          </div>
        </AdminModal>
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