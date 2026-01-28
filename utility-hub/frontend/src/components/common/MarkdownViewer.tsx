import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
      content: string;
      className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className }) => {
      return (
            <div className={`prose prose-invert max-w-none text-white ${className}`} style={{ color: 'white' }}>
                  <ReactMarkdown>
                        {content}
                  </ReactMarkdown>
            </div>
      );
};

export default MarkdownViewer;
