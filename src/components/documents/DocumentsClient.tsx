'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '@/app/actions/documents'
import { DOC_CATEGORY_LABELS, formatDate, formatFileSize, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import type { Document, DocumentCategory, User } from '@/lib/types'

const CATEGORIES = Object.keys(DOC_CATEGORY_LABELS) as DocumentCategory[]
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

interface Props {
  documents: (Document & { signedUrl: string | null })[]
  currentUser: User
  searchQuery?: string
  activeCategory?: string
}

export default function DocumentsClient({ documents, currentUser, searchQuery, activeCategory }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState(searchQuery ?? '')
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>(
    (activeCategory as DocumentCategory) ?? 'all'
  )
  const [dragging, setDragging] = useState(false)
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'budgets' as DocumentCategory, year: new Date().getFullYear(), status: '' })
  const [file, setFile] = useState<File | null>(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const isBoard = currentUser.role === 'board' || currentUser.role === 'admin'

  const filtered = documents.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    router.push(`/documents?${params.toString()}`)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast('Please select a file', 'error')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', uploadForm.name || file.name)
    fd.append('category', uploadForm.category)
    fd.append('year', String(uploadForm.year))
    if (uploadForm.status) fd.append('status', uploadForm.status)

    startTransition(async () => {
      const result = await uploadDocument(fd)
      if (result.error) toast(result.error, 'error')
      else {
        toast('Document uploaded successfully!')
        setShowUpload(false)
        setFile(null)
        router.refresh()
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark tracking-tight">📁 Financial Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Official financial reports, budgets, audits, and tax records</p>
        </div>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus-navy w-44"
            />
            <button type="submit" className="px-3.5 py-2 border border-navy text-navy text-sm font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors">
              🔍
            </button>
          </form>
          {isBoard && (
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors"
            >
              + Upload
            </button>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && isBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-card w-full max-w-md shadow-modal">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-900">Upload Document</span>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-gray-900 text-xl">×</button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  dragging ? 'border-navy bg-blue-50' : 'border-gray-300 hover:border-navy'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.xlsx,.docx,.csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <p className="text-sm font-semibold text-navy">📄 {file.name} ({formatFileSize(file.size)})</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Drag & drop or click to select</p>
                    <p className="text-xs text-gray-400">PDF, Excel, Word, CSV</p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Document Name</label>
                <input
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={file?.name ?? 'Enter document name'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value as DocumentCategory }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{DOC_CATEGORY_LABELS[c].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                  <select
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm((f) => ({ ...f, year: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy"
                  >
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status Tag (optional)</label>
                <select
                  value={uploadForm.status}
                  onChange={(e) => setUploadForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy"
                >
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="updated">Updated</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={pending || !file} className="flex-1 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-50 transition-colors">
                  {pending ? 'Uploading…' : 'Upload Document'}
                </button>
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Folder grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {CATEGORIES.map((cat) => {
          const count = documents.filter((d) => d.category === cat).length
          const { label, icon } = DOC_CATEGORY_LABELS[cat]
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat === selectedCategory ? 'all' : cat)
              }}
              className={cn(
                'bg-white border rounded-card p-5 text-center cursor-pointer transition-all',
                selectedCategory === cat
                  ? 'border-navy shadow-panel -translate-y-0.5'
                  : 'border-gray-200 hover:border-navy hover:shadow-panel hover:-translate-y-0.5'
              )}
            >
              <div className="text-4xl mb-2.5">{icon}</div>
              <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
              <div className="text-xs text-gray-500">{count} document{count !== 1 ? 's' : ''}</div>
            </button>
          )
        })}
      </div>

      {/* Document table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Documents' : DOC_CATEGORY_LABELS[selectedCategory as DocumentCategory]?.label}
          </span>
          <span className="text-sm text-gray-500">Sorted by date, newest first</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Name', 'Category', 'Year', 'Uploaded', 'Size', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No documents found.</td></tr>
              )}
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="mr-2">{DOC_CATEGORY_LABELS[doc.category]?.icon}</span>
                    <a
                      href={doc.signedUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy font-medium hover:underline text-sm"
                    >
                      {doc.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{DOC_CATEGORY_LABELS[doc.category]?.label}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{doc.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3">
                    {doc.status === 'new' && <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">New</span>}
                    {doc.status === 'updated' && <span className="bg-yellow-100 text-yellow-700 text-[11px] font-bold px-2 py-0.5 rounded-full">Updated</span>}
                  </td>
                  <td className="px-4 py-3">
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} download className="text-xs text-navy hover:underline">↓ Download</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
