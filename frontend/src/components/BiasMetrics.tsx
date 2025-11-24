import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


import avgBiasData from './data/bias_avg_delta.json';
import maxBiasData from './data/bias_strongest_delta.json';

interface BiasMetricsProps {
  grants: any[];
  fairnessMetrics: any;
  showAdjusted: boolean;
}

export function BiasMetrics({ }: BiasMetricsProps) {
  
  const categories = [
    { label: 'Race/Ethnicity', jsonKey: 'race/ethnicity' },
    { label: 'Gender', jsonKey: 'gender' },
    { label: 'Mental Health', jsonKey: 'mental health/mental disorders' },
    { label: 'LGBTQ+', jsonKey: 'lgbtq' },
    { label: 'Climate', jsonKey: 'climate change' },
  ];


  const chartData = categories.map(cat => {
    // @ts-ignore - Accessing JSON by string key
    const avgVal = avgBiasData[cat.jsonKey] || 0;
    // @ts-ignore
    const maxVal = maxBiasData[cat.jsonKey] || 0;

    return {
      group: cat.label,
      "Average Bias": avgVal * 100,
      "Max Bias": maxVal * 100
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Bias Impact Analysis</CardTitle>
        <CardDescription>
          Global impact of topic terms on termination probability (Signed Delta %).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              barGap={8} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="group" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis 
                label={{ value: 'Impact (Delta %)', angle: -90, position: 'insideLeft' }} 
                domain={['auto', 'auto']} 
              />
              
              <Tooltip 
                formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`}
                contentStyle={{ borderRadius: '8px' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              
              <ReferenceLine y={0} stroke="#000" />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar 
                dataKey="Average Bias" 
                fill="#3b82f6" 
                name="Avg Impact" 
                radius={[2, 2, 2, 2]} 
                barSize={20}
              />
              
              <Bar 
                dataKey="Max Bias" 
                fill="#ef4444" 
                name="Max Impact" 
                radius={[2, 2, 2, 2]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Explanation Footer */}
        <div className="mt-4 p-3 bg-slate-50 rounded-md text-xs text-slate-600 border border-slate-100">
          <div className="flex items-start gap-2 mb-1">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p><strong>Interpretation:</strong> Values represent the change in termination probability when bias terms are present.</p>
          </div>
          <ul className="list-disc pl-9 space-y-1">
            <li><strong>Positive (+):</strong> Terms increased risk (Model bias against topic).</li>
            <li><strong>Negative (-):</strong> Terms decreased risk (Topic is protective).</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}