import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Grant, FairnessMetrics } from './data/GrantData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface BiasMetricsProps {
  grants: Grant[];
  fairnessMetrics: FairnessMetrics;
  showAdjusted: boolean;
}

export function BiasMetrics({ grants }: BiasMetricsProps) {
  
  const categories = [
    { id: 'Race', label: 'Race/Ethnicity' },
    { id: 'Gender', label: 'Gender' },
    { id: 'MentalHealth', label: 'Mental Health' },
    { id: 'LGBTQ', label: 'LGBTQ+' },
    { id: 'Climate', label: 'Climate' },
  ];

  // --- UPDATED LOGIC: Calculate Average Impact Only ---
  const chartData = categories.map(cat => {
    // 1. Collect all impacts for this category
    const impacts = grants
      .flatMap(g => g.biasFlags)
      .filter(f => f.type === cat.id)
      .map(f => f.impact);

    const count = impacts.length;
    
    if (count === 0) {
      return { group: cat.label, "Average Bias": 0, count: 0 };
    }

    // 2. Avg Delta = sum(deltas) / len
    const totalImpact = impacts.reduce((sum, val) => sum + val, 0);
    const avgImpact = totalImpact / count;

    return {
      group: cat.label,
      "Average Bias": avgImpact,
      count: count
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Bias Impact Analysis</CardTitle>
        <CardDescription>
          Average impact of topic terms on termination probability (Signed Delta %).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
              
              {/* Removed Max Bias Bar */}
              <Bar 
                dataKey="Average Bias" 
                fill="#3b82f6" 
                name="Avg Impact (Mean)" 
                radius={[2, 2, 2, 2]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded-md text-xs text-slate-600">
          <p><strong>Positive (+):</strong> Terms increased termination risk (Bias against topic).</p>
          <p><strong>Negative (-):</strong> Terms reduced termination risk (Protective topic).</p>
        </div>
      </CardContent>
    </Card>
  );
}