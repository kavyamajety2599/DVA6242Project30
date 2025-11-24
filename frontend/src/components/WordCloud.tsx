import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import type { KeywordData } from './data/GrantData';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WordCloudProps {
  keywordData: KeywordData[];
}

export function WordCloud({ keywordData }: WordCloudProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);

  if (!keywordData || keywordData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Termination Word Cloud</CardTitle>
          <CardDescription>No keyword data available.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px] text-slate-400">
          Try adjusting your search filters.
        </CardContent>
      </Card>
    );
  }

  const topKeywords = keywordData
    .slice(-60)
    .sort((a, b) => b.frequency - a.frequency);

  const maxFreq = Math.max(...topKeywords.map(k => k.frequency), 0);
  const minFreq = Math.min(...topKeywords.map(k => k.frequency), maxFreq);

  const getSize = (freq: number) => {
    const denominator = maxFreq - minFreq;
    if (denominator === 0) return 24;
    const normalized = (freq - minFreq) / denominator;
    return 14 + normalized * 26; 
  };

  const getColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'text-red-600';
      case 'Mod Risk': return 'text-orange-600';
      case 'Low Risk': return 'text-yellow-600';
      case 'Protective': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk': return 'bg-red-50 hover:bg-red-100 border-red-100';
      case 'Mod Risk': return 'bg-orange-50 hover:bg-orange-100 border-orange-100';
      case 'Low Risk': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100';
      case 'Protective': return 'bg-blue-50 hover:bg-blue-100 border-blue-100';
      default: return 'bg-slate-50 hover:bg-slate-100';
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Termination Word Cloud</CardTitle>
          <CardDescription>
            Key terms by frequency. Color indicates termination risk level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-wrap gap-3 items-center justify-center p-4 content-start">
            {topKeywords.map((keyword, index) => {
              const fontSize = getSize(keyword.frequency);
              const colorClass = getColor(keyword.riskLevel);
              const bgClass = getBackgroundColor(keyword.riskLevel);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedKeyword(keyword)}
                  className={`${bgClass} px-3 py-1 rounded-lg transition-all cursor-pointer border hover:border-slate-300 shadow-sm`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <span className={`${colorClass} font-medium capitalize`}>
                    {keyword.keyword}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-sm font-medium text-slate-700">Risk Legend:</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-slate-600">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span className="text-slate-600">Mod Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-600">Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-slate-600">Protective</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Detail Dialog */}
      <Dialog open={!!selectedKeyword} onOpenChange={() => setSelectedKeyword(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 capitalize">
              Keyword: "{selectedKeyword?.keyword}"
              {selectedKeyword?.riskLevel.includes('Risk') ? (
                <TrendingUp className={`w-5 h-5 ${getColor(selectedKeyword.riskLevel || '')}`} />
              ) : (
                <TrendingDown className="w-5 h-5 text-blue-600" />
              )}
            </DialogTitle>
            <DialogDescription>
              Analysis based on {selectedKeyword?.count} matching grants
            </DialogDescription>
          </DialogHeader>

          {selectedKeyword && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Risk Category</p>
                  <Badge variant="outline" className={`${getColor(selectedKeyword.riskLevel)} border-current mt-1`}>
                    {selectedKeyword.riskLevel}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Frequency</p>
                  <p className="text-xl font-bold text-slate-900">
                    {selectedKeyword.frequency.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}