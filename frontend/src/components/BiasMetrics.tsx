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

  const genderData = [
    {
      group: 'Male',
      rate: grants.filter(g => g.gender === 'Male' && g.terminated).length / 
            (grants.filter(g => g.gender === 'Male').length || 1) * 100,
      avgProb: grants.filter(g => g.gender === 'Male').reduce((sum, g) => sum + getProbability(g), 0) / 
               (grants.filter(g => g.gender === 'Male').length || 1) * 100,
    },
    {
      group: 'Female',
      rate: grants.filter(g => g.gender === 'Female' && g.terminated).length / 
            (grants.filter(g => g.gender === 'Female').length || 1) * 100,
      avgProb: grants.filter(g => g.gender === 'Female').reduce((sum, g) => sum + getProbability(g), 0) / 
               (grants.filter(g => g.gender === 'Female').length || 1) * 100,
    },
  ];

  const raceData = [
    {
      group: 'Minority',
      rate: grants.filter(g => g.race === 'Minority' && g.terminated).length / 
            (grants.filter(g => g.race === 'Minority').length || 1) * 100,
      avgProb: grants.filter(g => g.race === 'Minority').reduce((sum, g) => sum + getProbability(g), 0) / 
               (grants.filter(g => g.race === 'Minority').length || 1) * 100,
    },
    {
      group: 'Non-Minority',
      rate: grants.filter(g => g.race === 'Non-Minority' && g.terminated).length / 
            (grants.filter(g => g.race === 'Non-Minority').length || 1) * 100,
      avgProb: grants.filter(g => g.race === 'Non-Minority').reduce((sum, g) => sum + getProbability(g), 0) / 
               (grants.filter(g => g.race === 'Non-Minority').length || 1) * 100,
    },
  ];


  const allGroupData = [...genderData, ...raceData]; 

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
          {showAdjusted ? 'Adjusted termination rates with bias corrections applied' : 'Termination rates by demographic group'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" angle={-20} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Termination %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate" fill="#ef4444" name="Actual Rate %" />
              <Bar dataKey="avgProb" fill="#f59e0b" name="Avg Probability %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900">Fairness Metrics</h4>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    <strong>Demographic Parity:</strong> Ratio of termination probabilities (closer to 1.0 = more fair)
                    <br /><br />
                    <strong>Equality of Opportunity:</strong> Ratio of actual termination rates (closer to 1.0 = more fair)
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Gender (DP)</span>
                <Badge className={getFairnessColor(fairnessMetrics.demographicParity.gender)}>
                  {fairnessMetrics.demographicParity.gender.toFixed(2)}
                </Badge>
              </div>
              <Progress value={fairnessMetrics.demographicParity.gender * 100} className="h-2" />
              <span className="text-xs text-slate-500">
                {getFairnessLabel(fairnessMetrics.demographicParity.gender)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Gender (EO)</span>
                <Badge className={getFairnessColor(fairnessMetrics.equalityOfOpportunity.gender)}>
                  {fairnessMetrics.equalityOfOpportunity.gender.toFixed(2)}
                </Badge>
              </div>
              <Progress value={fairnessMetrics.equalityOfOpportunity.gender * 100} className="h-2" />
              <span className="text-xs text-slate-500">
                {getFairnessLabel(fairnessMetrics.equalityOfOpportunity.gender)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Race (DP)</span>
                <Badge className={getFairnessColor(fairnessMetrics.demographicParity.race)}>
                  {fairnessMetrics.demographicParity.race.toFixed(2)}
                </Badge>
              </div>
              <Progress value={fairnessMetrics.demographicParity.race * 100} className="h-2" />
              <span className="text-xs text-slate-500">
                {getFairnessLabel(fairnessMetrics.demographicParity.race)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Race (EO)</span>
                <Badge className={getFairnessColor(fairnessMetrics.equalityOfOpportunity.race)}>
                  {fairnessMetrics.equalityOfOpportunity.race.toFixed(2)}
                </Badge>
              </div>
              <Progress value={fairnessMetrics.equalityOfOpportunity.race * 100} className="h-2" />
              <span className="text-xs text-slate-500">
                {getFairnessLabel(fairnessMetrics.equalityOfOpportunity.race)}
              </span>
            </div>
            
          </div>
        </div>

        {showAdjusted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Bias corrections are active. Fairness metrics reflect adjusted probabilities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}