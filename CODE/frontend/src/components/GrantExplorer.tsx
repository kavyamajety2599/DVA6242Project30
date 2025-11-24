import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { WordCloud } from './WordCloud';
import { BiasMetrics } from './BiasMetrics';
import { GrantTable } from './GrantTable';
import { generateGrantData, calculateKeywordData, calculateFairnessMetrics } from './data/GrantData';
import { Search } from 'lucide-react';

export function GrantExplorer() {
  const [searchQuery, setSearchQuery] = useState('');

  const allGrants = useMemo(() => generateGrantData(), []);

  const keywordData = useMemo(() => calculateKeywordData(allGrants), [allGrants]);
  const fairnessMetrics = useMemo(() => calculateFairnessMetrics(allGrants), [allGrants]);

  const stats = useMemo(() => {
    const terminated = allGrants.filter(g => g.terminated).length;
    const total = allGrants.length;
    return {
      terminationRate: total > 0 ? (terminated / total) * 100 : 0,
      totalGrants: total,
    };
  }, [allGrants]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-slate-900">Grant Termination Dashboard</h1>
          <p className="text-slate-600">
            Model Evaluation on Test Set ({stats.totalGrants} Records)
          </p>
        </div>

        {/* Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Input */}
            <div className="mb-6">
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search table by title, recipient, or award number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  * Search filters the Grant Details Table below. Charts show full dataset analysis.
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center md:text-left">
                <p className="text-sm text-slate-600">Test Set Size</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalGrants}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-slate-600">Termination Rate</p>
                <p className="text-2xl font-bold text-slate-900">{stats.terminationRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Section (Static) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordCloud keywordData={keywordData} />
          <BiasMetrics 
            grants={allGrants} 
            fairnessMetrics={fairnessMetrics}
            showAdjusted={false}
          />
        </div>

        {/* Data Table (Filtered) */}
        <GrantTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}