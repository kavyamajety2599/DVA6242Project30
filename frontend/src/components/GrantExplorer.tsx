import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [selectedAgencies, setSelectedAgencies] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [yearRange, setYearRange] = useState<number[]>([2020, 2024]);
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
      if (selectedAgencies !== 'all' && grant.agency !== selectedAgencies) return false;
      if (selectedField !== 'all' && grant.field !== selectedField) return false;
      if (grant.year < yearRange[0] || grant.year > yearRange[1]) return false;
      if (searchQuery && !grant.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !grant.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [allGrants, selectedAgencies, selectedField, yearRange, searchQuery]);

  const adjustedGrants = useMemo(() => {
    return filteredGrants.map(grant => {
      let adjustedTerminationProb = grant.terminationProbability;
      
      // Apply bias adjustments
      if (grant.gender === 'Female') {
        adjustedTerminationProb -= biasAdjustments.genderBias * 0.01;
      }
      if (grant.race === 'Minority') {
        adjustedTerminationProb -= biasAdjustments.raceBias * 0.01;
      }
      if (grant.institutionPrestige === 'Low') {
        adjustedTerminationProb -= biasAdjustments.institutionBias * 0.01;
      }
      if (grant.piExperience < 5) {
        adjustedTerminationProb -= biasAdjustments.experienceBias * 0.01;
      }

      // Clamp between 0 and 1
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
    ) / total;
    
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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-slate-900">Grant Termination Dashboard</h1>
          <p className="text-slate-600">
            Explore language features, bias factors, and metadata relationships with grant outcomes
          </p>
        </div>

        {/* Top Section - Filters & Controls */}
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
                      Reduce bias by adjusting these factors. Visualizations update in real-time.
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
                      <p className="text-sm text-slate-600">Reduces termination probability for female PIs</p>
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
                      <p className="text-sm text-slate-600">Reduces termination probability for minority PIs</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Institution Bias Correction</Label>
                        <Badge variant="secondary">{biasAdjustments.institutionBias}%</Badge>
                      </div>
                      <Slider
                        value={[biasAdjustments.institutionBias]}
                        onValueChange={(val) => handleBiasAdjustment('institutionBias', val)}
                        min={0}
                        max={20}
                        step={1}
                      />
                      <p className="text-sm text-slate-600">Reduces termination probability for low-prestige institutions</p>
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
                      <p className="text-sm text-slate-600">Reduces termination probability for early-career researchers</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Agency</Label>
                <Select value={selectedAgencies} onValueChange={setSelectedAgencies}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    <SelectItem value="NIH">NIH</SelectItem>
                    <SelectItem value="NSF">NSF</SelectItem>
                    <SelectItem value="DOE">DOE</SelectItem>
                    <SelectItem value="NASA">NASA</SelectItem>
                    <SelectItem value="DARPA">DARPA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Research Field</Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Psychology">Psychology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year Range: {yearRange[0]} - {yearRange[1]}</Label>
                <Slider
                  value={yearRange}
                  onValueChange={setYearRange}
                  min={2020}
                  max={2024}
                  step={1}
                  minStepsBetweenThumbs={0}
                />
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Title or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-600">Total Grants</p>
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

        {/* Middle Section - Word Cloud & Bias Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WordCloud keywordData={keywordData} />
          <BiasMetrics 
            grants={displayGrants} 
            fairnessMetrics={fairnessMetrics}
            showAdjusted={showAdjusted}
          />
        </div>

        {/* Bottom Section - Grant Details Table */}
        <GrantTable grants={displayGrants} showAdjusted={showAdjusted} />
      </div>
    </div>
  );
}
