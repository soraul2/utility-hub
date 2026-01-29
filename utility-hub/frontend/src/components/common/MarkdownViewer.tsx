import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
      content: string;
      className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
      const emojiFont = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Playfair Display", serif';
      const bodyFont = '"Chakra Petch", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';

      return (
            <div className={`prose prose-invert max-w-none ${className}`}>
                  <ReactMarkdown
                        components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-amber-200 mb-4 mt-8 font-serif" style={{ fontFamily: emojiFont }} {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-amber-100 mb-3 mt-6 font-serif border-l-4 border-amber-500 pl-4" style={{ fontFamily: emojiFont }} {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-amber-50 mb-2 mt-4" style={{ fontFamily: bodyFont }} {...props} />,
                              p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-slate-300" style={{ fontFamily: bodyFont }} {...props} />,
                              strong: ({ node, ...props }) => <strong className="text-amber-400 font-bold" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-4 text-slate-300 marker:text-amber-500" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-4 text-slate-300 marker:text-amber-500" {...props} />,
                        }}
                  >
                        {content}
                  </ReactMarkdown>
            </div>
      );
};

export default MarkdownViewer;
