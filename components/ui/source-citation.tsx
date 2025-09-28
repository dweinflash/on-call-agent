import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Source {
  filename: string;
  title: string;
  section?: string;
}

interface SourceCitationProps {
  sources: Source[];
  className?: string;
}

export function SourceCitation({ sources, className = '' }: SourceCitationProps) {
  if (sources.length === 0) {
    return null;
  }

  const handleViewDocument = (filename: string) => {
    // Open the document in a new tab
    const documentUrl = `/docs/kma/${filename}`;
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`mt-4 border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-800">
          <FileText className="h-4 w-4" />
          Sources Referenced
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={`${source.filename}-${index}`}
              className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white border border-blue-100"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {source.title}
                </h4>
                {source.section && (
                  <p className="text-xs text-gray-600 mt-1">
                    Section: {source.section}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {source.filename}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDocument(source.filename)}
                className="flex-shrink-0 h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                title={`View ${source.filename}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Click the link icon to view the full document
        </div>
      </CardContent>
    </Card>
  );
}

interface SourceSummaryProps {
  sourceCount: number;
  className?: string;
}

export function SourceSummary({ sourceCount, className = '' }: SourceSummaryProps) {
  if (sourceCount === 0) {
    return (
      <div className={`text-xs text-gray-500 mt-2 ${className}`}>
        No specific incident procedures found in knowledge base
      </div>
    );
  }

  return (
    <div className={`text-xs text-blue-600 mt-2 ${className}`}>
      Response based on {sourceCount} incident response {sourceCount === 1 ? 'document' : 'documents'}
    </div>
  );
}