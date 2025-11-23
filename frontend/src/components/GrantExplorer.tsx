import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { WordCloud } from './WordCloud';
import { BiasMetrics } from './BiasMetrics';
import { GrantTable } from './GrantTable';
import { generateGrantData, type BiasAdjustments, calculateKeywordData, calculateFairnessMetrics } from './data/GrantData';
import { Settings, Search } from 'lucide-react';

export function GrantExplorer() {
  const [yearRange, setYearRange] = useState<number[]>([1980, 2025]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [biasAdjustments, setBiasAdjustments] = useState<BiasAdjustments>({
    genderBias: 0,
    raceBias: 0,
    institutionBias: 0, 
    experienceBias: 0,
  });
  const [showAdjusted, setShowAdjusted] = useState(false);

  const allGrants = useMemo(() => generateGrantData(), []);

  const filteredGrants = useMemo(() => {
    return allGrants.filter(grant => {
      if (grant.year < yearRange[0] || grant.year > yearRange[1]) return false;
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = grant.title.toLowerCase().includes(searchLower);
        const keywordMatch = grant.keywords.some(k => k.toLowerCase().includes(searchLower));
        if (!titleMatch && !keywordMatch) return false;
      }
      return true;
    });
  }, [allGrants, yearRange, searchQuery]);

  const adjustedGrants = useMemo(() => {
    return filteredGrants.map(grant => {
      let adjustedTerminationProb = grant.terminationProbability;
      
    
      if (grant.gender === 'Female') {
        adjustedTerminationProb -= biasAdjustments.genderBias * 0.01;
      }
      if (grant.race === 'Minority') {
        adjustedTerminationProb -= biasAdjustments.raceBias * 0.01;
      }

      if (grant.piExperience < 5) {
        adjustedTerminationProb -= biasAdjustments.experienceBias * 0.01;
      }

      adjustedTerminationProb = Math.max(0, Math.min(1, adjustedTerminationProb));

      return {
        ...grant,
        adjustedTerminationProb,
      };
    });
  }, [filteredGrants, biasAdjustments]);

  const displayGrants = showAdjusted ? adjustedGrants : filteredGrants;

  const keywordData = useMemo(() => calculateKeywordData(displayGrants), [displayGrants]);
  const fairnessMetrics = useMemo(() => calculateFairnessMetrics(displayGrants, showAdjusted), [displayGrants, showAdjusted]);

  const stats = useMemo(() => {
    const terminated = displayGrants.filter(g => g.terminated).length;
    const total = displayGrants.length;
    const avgProb = displayGrants.reduce((sum, g) => 
      sum + (showAdjusted ? (g as any).adjustedTerminationProb : g.terminationProbability), 0
    ) / (total || 1);
    
    return {
      terminationRate: total > 0 ? (terminated / total) * 100 : 0,
      avgProbability: avgProb * 100,
      totalGrants: total,
    };
  }, [displayGrants, showAdjusted]);

  const handleBiasAdjustment = (key: keyof BiasAdjustments, value: number[]) => {
    setBiasAdjustments(prev => ({ ...prev, [key]: value[0] }));
    setShowAdjusted(true);
  };

  const resetBiasAdjustments = () => {
    setBiasAdjustments({
      genderBias: 0,
      raceBias: 0,
      institutionBias: 0,
      experienceBias: 0,
    });
    setShowAdjusted(false);
  };

  const biasControlsActive = Object.values(biasAdjustments).some(v => v > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-slate-900">Grant Termination Dashboard</h1>
          <p className="text-slate-600">
            Model Evaluation on Test Set ({stats.totalGrants} Records)
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters & Controls</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={biasControlsActive ? "default" : "outline"} size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Bias Controls
                    {biasControlsActive && <Badge variant="secondary" className="ml-2">Active</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Bias Adjustment Controls</SheetTitle>
                    <SheetDescription>
                      Simulate fairness corrections by adjusting probability weights for specific demographic groups.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Gender Bias Correction</Label>
                        <Badge variant="secondary">{biasAdjustments.genderBias}%</Badge>
                      </div>
                      <Slider
                        value={[biasAdjustments.genderBias]}
                        onValueChange={(val) => handleBiasAdjustment('genderBias', val)}
                        min={0}
                        max={20}
                        step={1}
                      />
                      <p className="text-sm text-slate-600">Reduces risk score for female PIs</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Race Bias Correction</Label>
                        <Badge variant="secondary">{biasAdjustments.raceBias}%</Badge>
                      </div>
                      <Slider
                        value={[biasAdjustments.raceBias]}
                        onValueChange={(val) => handleBiasAdjustment('raceBias', val)}
                        min={0}
                        max={20}
                        step={1}
                      />
                      <p className="text-sm text-slate-600">Reduces risk score for minority PIs</p>
                    </div>


                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Experience Bias Correction</Label>
                        <Badge variant="secondary">{biasAdjustments.experienceBias}%</Badge>
                      </div>
                      <Slider
                        value={[biasAdjustments.experienceBias]}
                        onValueChange={(val) => handleBiasAdjustment('experienceBias', val)}
                        min={0}
                        max={20}
                        step={1}
                      />
                      <p className="text-sm text-slate-600">Reduces risk score for early-career researchers</p>
                    </div>

                    {biasControlsActive && (
                      <Button onClick={resetBiasAdjustments} variant="outline" className="w-full">
                        Reset All Adjustments
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Year Range: {yearRange[0]} - {yearRange[1]}</Label>
                <Slider
                  value={yearRange}
                  onValueChange={setYearRange}
                  min={1980}
                  max={2025}
                  step={1}
                  minStepsBetweenThumbs={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by title or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-600">Test Set Size</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalGrants}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Termination Rate</p>
                <p className="text-2xl font-bold text-slate-900">{stats.terminationRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Probability</p>
                <p className="text-2xl font-bold text-slate-900">{stats.avgProbability.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordCloud keywordData={keywordData} />
          <BiasMetrics 
            grants={displayGrants} 
            fairnessMetrics={fairnessMetrics}
            showAdjusted={showAdjusted}
          />
        </div>

        <GrantTable grants={displayGrants} showAdjusted={showAdjusted} />
      </div>
    </div>
  );
}