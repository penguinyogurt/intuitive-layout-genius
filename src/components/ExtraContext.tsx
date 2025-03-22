
import React, { useState } from 'react';
import { Button } from './ui/button';

interface ExtraContextProps {
  children?: React.ReactNode;
  onGeneratePaper?: (prompt: string) => Promise<void>;
}

const ExtraContext: React.FC<ExtraContextProps> = ({ children, onGeneratePaper }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [instructions, setInstructions] = useState("Analyze the data, identify patterns, and create a comprehensive research paper with proper sections including introduction, methodology, results, discussion, and conclusion.");

  const handleGeneratePaper = () => {
    if (onGeneratePaper) {
      onGeneratePaper(instructions);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm animate-fade-in">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium text-gray-800">AI Paper Generation</h3>
        
        {isConfiguring ? (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                Instructions for AI
              </label>
              <textarea
                id="instructions"
                className="min-h-[100px] p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Provide detailed instructions for your research paper..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsConfiguring(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleGeneratePaper}
              >
                Generate Paper
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm">
              {children || "Configure how the AI will analyze your data and generate a research paper."}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsConfiguring(true)}
            >
              Configure AI
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExtraContext;
