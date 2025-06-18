
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Convert HTML to our JSON format
      const content = {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: editorRef.current.textContent || '',
            marks: []
          }]
        }]
      };
      onChange(content);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText("");
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-32 p-4 focus:outline-none"
        placeholder={placeholder}
        onInput={updateContent}
        style={{ minHeight: '8rem' }}
      />
      
      <div className="border-t bg-muted/30 p-2 flex gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('formatBlock', 'h1')}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('formatBlock', 'h2')}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('insertUnorderedList')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('insertOrderedList')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
