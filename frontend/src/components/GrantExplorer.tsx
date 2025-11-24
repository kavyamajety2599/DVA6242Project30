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

  const filteredGrants = useMemo(() => {
    return allGrants.filter(grant => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = grant.title.toLowerCase().includes(searchLower);
        const keywordMatch = grant.keywords.some(k => k.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !keywordMatch) return false;
      }
      return true;
    });
  }, [allGrants, searchQuery]);

  const displayGrants = filteredGrants;

  const keywordData = useMemo(() => calculateKeywordData(displayGrants), [displayGrants]);
  const fairnessMetrics = useMemo(() => calculateFairnessMetrics(displayGrants), [displayGrants]);

  const stats = useMemo(() => {
    const total = displayGrants.length;
    const terminated = displayGrants.filter(g => g.terminated).length;
    return {
      terminationRate: total > 0 ? (terminated / total) * 100 : 0,
      totalGrants: total,
    };
  }, [displayGrants]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-slate-900">Grant Termination Dashboard</h1>
          <p className="text-slate-600">Model Evaluation on Test Set ({stats.totalGrants} Records)</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Filters & Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by title or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-sm text-slate-600">Test Set Size</p><p className="text-2xl font-bold text-slate-900">{stats.totalGrants}</p></div>
              <div><p className="text-sm text-slate-600">Termination Rate</p><p className="text-2xl font-bold text-slate-900">{stats.terminationRate.toFixed(1)}%</p></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordCloud keywordData={keywordData} />
          <BiasMetrics grants={displayGrants} fairnessMetrics={fairnessMetrics} showAdjusted={false} />
        </div>

        <GrantTable grants={displayGrants} showAdjusted={false} />
      </div>
    </div>
  );
}