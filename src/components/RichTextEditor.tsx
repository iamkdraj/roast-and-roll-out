
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Type, List, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface RichTextEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    if (editorRef.current && content) {
      // Convert JSON content to HTML for display
      const htmlContent = jsonToHtml(content);
      editorRef.current.innerHTML = htmlContent;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const jsonContent = htmlToJson(htmlContent);
      onChange(jsonContent);
      updateActiveFormats();
    }
  };

  const updateActiveFormats = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setActiveFormats({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline')
        });
      }
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const jsonToHtml = (json: any): string => {
    if (!json || !json.content) return '';
    
    return json.content.map((node: any) => {
      if (node.type === 'paragraph') {
        const textContent = node.content?.map((textNode: any) => {
          if (textNode.type === 'text') {
            let text = textNode.text || '';
            if (textNode.marks) {
              textNode.marks.forEach((mark: any) => {
                switch (mark.type) {
                  case 'bold':
                    text = `<strong>${text}</strong>`;
                    break;
                  case 'italic':
                    text = `<em>${text}</em>`;
                    break;
                  case 'underline':
                    text = `<u>${text}</u>`;
                    break;
                }
              });
            }
            return text;
          }
          return '';
        }).join('') || '';
        return `<p>${textContent}</p>`;
      }
      return '';
    }).join('');
  };

  const htmlToJson = (html: string): any => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const content: any[] = [];
    const paragraphs = tempDiv.querySelectorAll('p');
    
    if (paragraphs.length === 0 && tempDiv.textContent) {
      // If no paragraphs, treat as single paragraph
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: tempDiv.textContent }]
      });
    } else {
      paragraphs.forEach(p => {
        const textContent: any[] = [];
        const walker = document.createTreeWalker(
          p,
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
          null
        );
        
        let node;
        let currentText = '';
        let currentMarks: any[] = [];
        
        while (node = walker.nextNode()) {
          if (node.nodeType === Node.TEXT_NODE) {
            currentText += node.textContent || '';
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'STRONG' || element.tagName === 'B') {
              currentMarks.push({ type: 'bold' });
            } else if (element.tagName === 'EM' || element.tagName === 'I') {
              currentMarks.push({ type: 'italic' });
            } else if (element.tagName === 'U') {
              currentMarks.push({ type: 'underline' });
            }
          }
        }
        
        if (currentText) {
          textContent.push({
            type: 'text',
            text: currentText,
            marks: currentMarks.length > 0 ? currentMarks : undefined
          });
        }
        
        content.push({
          type: 'paragraph',
          content: textContent
        });
      });
    }
    
    return {
      type: 'doc',
      content: content.length > 0 ? content : [{
        type: 'paragraph',
        content: [{ type: 'text', text: tempDiv.textContent || '' }]
      }]
    };
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none"
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        style={{ minHeight: '200px' }}
      />
      
      <div className="border-t border-border p-2 bg-muted/50">
        <div className="flex flex-wrap gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant={activeFormats.bold ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant={activeFormats.italic ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant={activeFormats.underline ? "default" : "ghost"}
              size="sm"
              onClick={() => formatText('underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('formatBlock', 'h3')}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertUnorderedList')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyLeft')}
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
