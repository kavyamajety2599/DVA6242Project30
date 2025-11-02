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

  // Take top 30 keywords
  const topKeywords = keywordData.slice(0, 30);

  // Calculate sizes based on frequency
  const maxFreq = Math.max(...topKeywords.map(k => k.frequency), 1);
  const minFreq = Math.min(...topKeywords.map(k => k.frequency), 1);

  const getSize = (freq: number) => {
    const normalized = (freq - minFreq) / (maxFreq - minFreq);
    return 12 + normalized * 32; // 12px to 44px
  };

  const getColor = (weight: number) => {
    if (weight > 0.1) return 'text-red-600';
    if (weight > 0.05) return 'text-orange-500';
    if (weight > 0) return 'text-yellow-600';
    if (weight > -0.05) return 'text-blue-500';
    return 'text-blue-700';
  };

  const getBackgroundColor = (weight: number) => {
    if (weight > 0.1) return 'bg-red-50 hover:bg-red-100';
    if (weight > 0.05) return 'bg-orange-50 hover:bg-orange-100';
    if (weight > 0) return 'bg-yellow-50 hover:bg-yellow-100';
    if (weight > -0.05) return 'bg-blue-50 hover:bg-blue-100';
    return 'bg-blue-50 hover:bg-blue-100';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Termination Word Cloud</CardTitle>
          <CardDescription>
            Keywords correlated with grant termination. Size = frequency, Color = impact direction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-wrap gap-3 items-center justify-center p-4">
            {topKeywords.map((keyword, index) => {
              const fontSize = getSize(keyword.frequency);
              const colorClass = getColor(keyword.terminationWeight);
              const bgClass = getBackgroundColor(keyword.terminationWeight);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedKeyword(keyword)}
                  className={`${bgClass} px-3 py-1 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-300`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <span className={`${colorClass} font-medium`}>
                    {keyword.keyword}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-sm font-medium text-slate-700">Legend:</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-600">High risk (+10%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-slate-600">Moderate risk (+5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-slate-600">Slight risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-slate-600">Protective</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Detail Dialog */}
      <Dialog open={!!selectedKeyword} onOpenChange={() => setSelectedKeyword(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Keyword: "{selectedKeyword?.keyword}"
              {selectedKeyword && selectedKeyword.terminationWeight > 0 ? (
                <TrendingUp className="w-5 h-5 text-red-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-blue-600" />
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and sample grants containing this keyword
            </DialogDescription>
          </DialogHeader>

          {selectedKeyword && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Frequency</p>
                  <p className="text-xl font-bold text-slate-900">{selectedKeyword.frequency}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Avg Termination Rate</p>
                  <p className="text-xl font-bold text-slate-900">
                    {(selectedKeyword.avgTerminationRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Impact Weight</p>
                  <p className="text-xl font-bold text-slate-900">
                    {selectedKeyword.terminationWeight > 0 ? '+' : ''}
                    {(selectedKeyword.terminationWeight * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Sample Grants</h4>
                <div className="space-y-2">
                  {selectedKeyword.sampleGrants.map((grant, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        grant.terminated 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-900 flex-1">{grant.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={grant.terminated ? "destructive" : "default"}>
                            {grant.terminated ? 'Terminated' : 'Active'}
                          </Badge>
                          <Badge variant="secondary">
                            {(grant.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
