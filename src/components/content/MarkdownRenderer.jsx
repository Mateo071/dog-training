import React from 'react';

const MarkdownRenderer = ({ content, className = '' }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-md p-4 my-4 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="list-item">$1</li>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-brand-blue hover:underline">$1</a>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-brand-blue hover:underline">$1</a>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 text-gray-700 italic">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-6 border-gray-300">')
      
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*?<\/li>)(\s*<br>\s*<li[^>]*>.*?<\/li>)*/g, (match) => {
      const items = match.split('<br>').filter(item => item.trim());
      const hasNumbered = items.some(item => item.includes('class="list-item"'));
      
      if (hasNumbered) {
        return `<ol class="list-decimal list-inside my-4 space-y-1 ml-4">${items.join('')}</ol>`;
      } else {
        return `<ul class="list-disc list-inside my-4 space-y-1 ml-4">${items.join('')}</ul>`;
      }
    });

    return html;
  };

  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        lineHeight: '1.7'
      }}
    />
  );
};

export default MarkdownRenderer;