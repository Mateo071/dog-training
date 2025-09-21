import React, { useRef, useEffect, useState, useCallback } from 'react';

const RichTextEditor = ({ value = '', onChange, placeholder = '', required = false }) => {
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  // Execute formatting commands
  const executeCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Toolbar button component
  const ToolbarButton = ({ onClick, title, children, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-blue ${
        isActive ? 'bg-brand-blue text-white' : 'bg-white text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  // Check if a command is currently active
  const isCommandActive = useCallback((command) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  // Handle key shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        default:
          break;
      }
    }
  }, [executeCommand]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    executeCommand('insertText', text);
  }, [executeCommand]);

  return (
    <div className="rich-text-editor border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 rounded-t-md">
        {/* Headings */}
        <div className="flex border border-gray-300 rounded">
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', '<h1>')}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', '<h2>')}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', '<h3>')}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('formatBlock', '<p>')}
            title="Paragraph"
          >
            P
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text formatting */}
        <div className="flex border border-gray-300 rounded">
          <ToolbarButton
            onClick={() => executeCommand('bold')}
            title="Bold (Ctrl+B)"
            isActive={isCommandActive('bold')}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('italic')}
            title="Italic (Ctrl+I)"
            isActive={isCommandActive('italic')}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('underline')}
            title="Underline (Ctrl+U)"
            isActive={isCommandActive('underline')}
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('strikeThrough')}
            title="Strikethrough"
            isActive={isCommandActive('strikeThrough')}
          >
            <s>S</s>
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <div className="flex border border-gray-300 rounded">
          <ToolbarButton
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
            isActive={isCommandActive('insertUnorderedList')}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
            isActive={isCommandActive('insertOrderedList')}
          >
            1. List
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Links and Code */}
        <div className="flex border border-gray-300 rounded">
          <ToolbarButton
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) {
                executeCommand('createLink', url);
              }
            }}
            title="Insert Link"
          >
            🔗 Link
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const code = document.createElement('code');
                code.className = 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono';
                
                try {
                  range.surroundContents(code);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } catch {
                  // If surroundContents fails, try alternative approach
                  const selectedText = selection.toString();
                  if (selectedText) {
                    executeCommand('insertHTML', `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${selectedText}</code>`);
                  }
                }
                handleInput();
              }
            }}
            title="Inline Code"
          >
            &lt;/&gt; Code
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Utility */}
        <div className="flex border border-gray-300 rounded">
          <ToolbarButton
            onClick={() => executeCommand('removeFormat')}
            title="Clear Formatting"
          >
            Clear
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('undo')}
            title="Undo"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => executeCommand('redo')}
            title="Redo"
          >
            ↷
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="min-h-[200px] p-3 focus:outline-none max-w-none"
        style={{
          lineHeight: '1.6',
        }}
        data-placeholder={placeholder}
        required={required}
      />

      {/* Help text */}
      <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-300 rounded-b-md">
        Use the toolbar above or keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline)
      </div>

      <style>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-text-editor [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: 800;
          line-height: 1.1111111;
          margin: 2em 0 1em 0;
          color: #111827;
        }
        
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3333333;
          margin: 2em 0 1em 0;
          color: #111827;
        }
        
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 1.6em 0 0.8em 0;
          color: #111827;
        }
        
        .rich-text-editor [contenteditable] p {
          margin: 1.25em 0;
          line-height: 1.75;
          color: #374151;
        }
        
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          margin: 1.25em 0;
          padding-left: 1.625em;
          list-style-position: outside;
        }
        
        .rich-text-editor [contenteditable] ul {
          list-style-type: disc;
        }
        
        .rich-text-editor [contenteditable] ol {
          list-style-type: decimal;
        }
        
        .rich-text-editor [contenteditable] li {
          margin: 0.5em 0;
          padding-left: 0.375em;
          display: list-item;
          line-height: 1.75;
          color: #374151;
        }
        
        .rich-text-editor [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-text-editor [contenteditable] code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;