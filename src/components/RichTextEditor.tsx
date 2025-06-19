
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
      const htmlContent = jsonToHtml(content);
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
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
    
    if (paragraphs.length === 0 && tempDiv.textContent?.trim()) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: tempDiv.textContent.trim() }]
      });
    } else {
      paragraphs.forEach(p => {
        const textNodes: any[] = [];
        
        const processNode = (node: Node): void => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              const marks: any[] = [];
              let parent = node.parentElement;
              
              while (parent && parent !== p) {
                if (parent.tagName === 'STRONG' || parent.tagName === 'B') {
                  marks.push({ type: 'bold' });
                } else if (parent.tagName === 'EM' || parent.tagName === 'I') {
                  marks.push({ type: 'italic' });
                } else if (parent.tagName === 'U') {
                  marks.push({ type: 'underline' });
                }
                parent = parent.parentElement;
              }
              
              textNodes.push({
                type: 'text',
                text: text,
                ...(marks.length > 0 && { marks })
              });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processNode);
          }
        };
        
        Array.from(p.childNodes).forEach(processNode);
        
        if (textNodes.length === 0 && p.textContent?.trim()) {
          textNodes.push({
            type: 'text',
            text: p.textContent.trim()
          });
        }
        
        content.push({
          type: 'paragraph',
          content: textNodes
        });
      });
    }
    
    return {
      type: 'doc',
      content: content.length > 0 ? content : [{
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      }]
    };
  };

  return (
    <div className="overflow-hidden">
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[150px] p-4 focus:outline-none text-sm leading-relaxed"
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        style={{ minHeight: '150px' }}
        suppressContentEditableWarning={true}
      />
      
      <div className="border-t border-border p-3 bg-muted/30">
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
