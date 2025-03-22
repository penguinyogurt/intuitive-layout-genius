
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Edit, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PaperEditorProps {
  content: string;
  isLoading: boolean;
  onContentChange: (content: string) => void;
}

const PaperEditor: React.FC<PaperEditorProps> = ({ 
  content,
  isLoading,
  onContentChange
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [editedContent, setEditedContent] = useState<string>(content);
  const previewRef = React.useRef<HTMLDivElement>(null);

  // Update edited content when content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "edit") {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  const handleSaveEdits = () => {
    onContentChange(editedContent);
    setActiveTab("preview");
    setEditMode(false);
    toast.success("Changes saved successfully");
  };

  const handleDownload = async () => {
    if (!content) {
      toast.error("No content to download");
      return;
    }

    try {
      // First, attempt to download as PDF
      if (previewRef.current) {
        toast.info("Preparing your PDF...");
        
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate dimensions to fit content to A4 page
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const pageHeight = 297; // A4 height in mm
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save("research_paper.pdf");
        toast.success("Research paper downloaded as PDF");
      } else {
        // Fallback to text download if PDF generation fails
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'research_paper.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Research paper downloaded as text file");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to generate PDF, downloading as text instead");
      
      // Fallback to text download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'research_paper.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Convert plain text to HTML with proper formatting for the preview
  const formatContentForPreview = (text: string) => {
    // Handle basic markdown-like syntax
    let formattedText = text
      // Handle headers
      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      // Handle paragraphs
      .replace(/\n\n(.*?)\n\n/gs, '</p><p class="my-3">$1</p>')
      // Handle lists
      .replace(/^\* (.*?)$/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 list-decimal">$1</li>')
      // Handle citations
      .replace(/\[(.*?)\]/g, '<span class="text-blue-600">[$1]</span>')
      // Handle bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formattedText.startsWith('<h1') && !formattedText.startsWith('<p')) {
      formattedText = `<p class="my-3">${formattedText}</p>`;
    }
    
    return formattedText;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Research Paper</h2>
          <div className="flex gap-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-[260px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="flex gap-1.5 items-center">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex gap-1.5 items-center">
                  <Edit className="h-4 w-4" />
                  Edit
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2"
              onClick={handleDownload}
              disabled={isLoading || !content}
            >
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </div>
        </div>
        
        <div className="min-h-[70vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Loader2 className="h-12 w-12 animate-spin text-sky-500 mb-4" />
              <p className="text-gray-600">Generating your research paper...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a minute or two</p>
            </div>
          ) : editMode ? (
            <div className="p-4 h-full">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60vh] p-4 font-mono text-sm"
                placeholder="Your research paper content..."
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveEdits}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div 
              ref={previewRef}
              className="p-8 prose max-w-none overflow-auto h-[calc(100vh-220px)]"
              dangerouslySetInnerHTML={{ __html: formatContentForPreview(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperEditor;
