import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import type { Grant, FairnessMetrics } from './data/GrantData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface BiasMetricsProps {
  grants: Grant[];
  fairnessMetrics: FairnessMetrics;
  showAdjusted: boolean;
}

export function BiasMetrics({ grants, fairnessMetrics, showAdjusted }: BiasMetricsProps) {
  const getProbability = (g: Grant) => 
    showAdjusted && (g as any).adjustedTerminationProb !== undefined 
      ? (g as any).adjustedTerminationProb 
      : g.terminationProbability;

  // --- NEW: Calculate Data for the 5 Categories ---
  const categories = [
    { id: 'Race', label: 'Race/Ethnicity' },
    { id: 'Gender', label: 'Gender' },
    { id: 'MentalHealth', label: 'Mental Health' },
    { id: 'LGBTQ', label: 'LGBTQ+' },
    { id: 'Climate', label: 'Climate' },
  ];

  const chartData = categories.map(cat => {
    // "Flagged": Grants that contain terms related to this bias category
    const flaggedGrants = grants.filter(g => g.biasFlags.some(f => f.type === cat.id));
    // "Baseline": Grants that DO NOT contain these terms
    const baselineGrants = grants.filter(g => !g.biasFlags.some(f => f.type === cat.id));

    const flaggedRate = flaggedGrants.length > 0 
      ? (flaggedGrants.filter(g => g.terminated).length / flaggedGrants.length) * 100 
      : 0;
      
    const baselineRate = baselineGrants.length > 0
      ? (baselineGrants.filter(g => g.terminated).length / baselineGrants.length) * 100
      : 0;

    return {
      group: cat.label,
      Flagged: flaggedRate,
      Baseline: baselineRate,
      count: flaggedGrants.length // Keep for tooltip if needed
    };
  });

  const getFairnessColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFairnessLabel = (score: number) => {
    if (score >= 0.9) return 'Good';
    if (score >= 0.75) return 'Fair';
    return 'Poor';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bias Analysis & Fairness Metrics</CardTitle>
        <CardDescription>
          Comparing termination rates for grants containing specific topic terms vs. baseline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Termination %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelStyle={{ color: 'black', fontWeight: 'bold' }}
              />
              <Legend />
              <Bar dataKey="Flagged" fill="#ef4444" name="Containing Terms" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Baseline" fill="#94a3b8" name="Baseline (No Terms)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fairness Metrics Table */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900">Fairness Metrics (Demographic Parity)</h4>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    <strong>Demographic Parity:</strong> Score closest to 1.0 indicates the model treats grants with these terms similarly to grants without them. Lower scores indicate disparity.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Dynamically render metrics for the 5 categories */}
            {categories.map(cat => {
              // Use type assertion or safe access for the dynamic key
              const key = cat.id === 'MentalHealth' ? 'mentalHealth' : cat.id.toLowerCase();
              const score = (fairnessMetrics.demographicParity as any)[key] || 0;
              
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{cat.label}</span>
                    <Badge className={`px-2 py-0 ${getFairnessColor(score)} bg-slate-50 border-slate-200`}>
                      {score.toFixed(2)}
                    </Badge>
                  </div>
                  <Progress value={score * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {showAdjusted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Bias corrections are active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}