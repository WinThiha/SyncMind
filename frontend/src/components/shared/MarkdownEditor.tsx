'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Eye, Edit2 } from 'lucide-react';
import Markdown from './Markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 5, label }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const textBefore = value.substring(0, start);
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      // Match bullet lists (- or *)
      const bulletMatch = currentLine.match(/^(\s*[-*]\s+)/);
      // Match numbered lists (1. 2. etc)
      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);

      if (bulletMatch) {
        const marker = bulletMatch[1];
        // If the line only contains the marker, clear it (end list)
        if (currentLine.trim() === '-' || currentLine.trim() === '*') {
          e.preventDefault();
          const newText = value.substring(0, start - marker.length) + '\n' + value.substring(start);
          onChange(newText);
        } else {
          // Continue list
          e.preventDefault();
          const newText = value.substring(0, start) + '\n' + marker + value.substring(start);
          onChange(newText);
          setTimeout(() => {
            textarea.setSelectionRange(start + marker.length + 1, start + marker.length + 1);
          }, 0);
        }
      } else if (numberMatch) {
        const indent = numberMatch[1];
        const lastNum = parseInt(numberMatch[2]);
        const nextMarker = `${indent}${lastNum + 1}. `;
        
        // If line is just "1. ", clear it
        if (currentLine.trim() === `${lastNum}.`) {
          e.preventDefault();
          const toRemove = currentLine.length;
          const newText = value.substring(0, start - toRemove) + '\n' + value.substring(start);
          onChange(newText);
        } else {
          // Continue numbered list
          e.preventDefault();
          const newText = value.substring(0, start) + '\n' + nextMarker + value.substring(start);
          onChange(newText);
          setTimeout(() => {
            textarea.setSelectionRange(start + nextMarker.length + 1, start + nextMarker.length + 1);
          }, 0);
        }
      }
    }
  };

  return (
    <div className="w-full border border-border-glow rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-brand-primary/20 focus-within:border-border-glow">
      {label && <label className="sr-only">{label}</label>}
      
      {/* Tabs and Toolbar */}
      <div className="flex items-center justify-between bg-foreground/5 border-b border-border-glow px-2">
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 border-b-2 transition ${
              mode === 'write' ? 'border-border-glow text-brand-primary' : 'border-transparent text-foreground/60 hover:text-foreground'
            }`}
          >
            <Edit2 size={14} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 border-b-2 transition ${
              mode === 'preview' ? 'border-border-glow text-brand-primary' : 'border-transparent text-foreground/60 hover:text-foreground'
            }`}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        </div>

        {mode === 'write' && (
          <div className="flex space-x-1 py-1">
            <button type="button" onClick={() => insertText('**', '**')} title="Bold" className="p-1.5 text-foreground/60 hover:bg-foreground/10 rounded transition"><Bold size={16} /></button>
            <button type="button" onClick={() => insertText('_', '_')} title="Italic" className="p-1.5 text-foreground/60 hover:bg-foreground/10 rounded transition"><Italic size={16} /></button>
            <button type="button" onClick={() => insertText('\n- ', '')} title="Bullet List" className="p-1.5 text-foreground/60 hover:bg-foreground/10 rounded transition"><List size={16} /></button>
            <button type="button" onClick={() => insertText('\n1. ', '')} title="Numbered List" className="p-1.5 text-foreground/60 hover:bg-foreground/10 rounded transition"><ListOrdered size={16} /></button>
            <button type="button" onClick={() => insertText('[', '](url)')} title="Link" className="p-1.5 text-foreground/60 hover:bg-foreground/10 rounded transition"><LinkIcon size={16} /></button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative">
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className="block w-full border-0 p-3 text-foreground placeholder:text-foreground/40 focus:ring-0 sm:text-sm resize-y bg-transparent"
          />
        ) : (
          <div className="p-3 bg-transparent min-h-[120px] overflow-auto">
            {value ? (
              <Markdown content={value} />
            ) : (
              <span className="text-foreground/40 italic text-sm">Nothing to preview</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
