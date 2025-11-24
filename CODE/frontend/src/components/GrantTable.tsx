import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import projectData from './data/final_project_data.json';

interface ProjectData {
  award_number: string;
  project_title: string;
  recipient_name: string;
  awarding_office: string;
  award_amount: number;
  grant_status: string;
  bias_flags: string | null;
}

interface GrantTableProps {
  searchQuery: string;
  grants?: any[]; 
  showAdjusted?: boolean;
}

export function GrantTable({ searchQuery }: GrantTableProps) {
  const data = projectData as ProjectData[];

  const [sortField, setSortField] = useState<keyof ProjectData>('award_amount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  //This runs only on the table data, not affecting the charts
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    
    return data.filter(item => 
      (item.project_title && item.project_title.toLowerCase().includes(lowerQuery)) ||
      (item.recipient_name && item.recipient_name.toLowerCase().includes(lowerQuery)) ||
      (item.award_number && item.award_number.toLowerCase().includes(lowerQuery))
    );
  }, [data, searchQuery]);

  const handleSort = (field: keyof ProjectData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    if (status === 'Active') return 'outline'; 
    if (status === 'Terminated') return 'destructive';
    return 'secondary';
  };

  const getBiasColor = (bias: string) => {
    const b = bias.toLowerCase();
    if (b.includes('race') || b.includes('gender') || b.includes('equity')) return 'destructive';
    if (b.includes('climate') || b.includes('environment')) return 'default';
    return 'secondary';
  };

  const parseFlags = (flagStr: string | null) => {
    if (!flagStr) return [];
    return flagStr.split(',').map(s => s.trim()).filter(s => s);
  };

  const SortButton = ({ field, label }: { field: keyof ProjectData; label: string }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-8 -ml-3 font-bold text-slate-700">
      {label} <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Details</CardTitle>
        <CardDescription>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} records from Project Data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[140px]"><SortButton field="award_number" label="Award #" /></TableHead>
                <TableHead className="w-[350px]"><SortButton field="project_title" label="Project Title" /></TableHead>
                <TableHead className="w-[200px]"><SortButton field="recipient_name" label="Recipient" /></TableHead>
                <TableHead><SortButton field="awarding_office" label="Agency" /></TableHead>
                <TableHead className="text-right"><SortButton field="award_amount" label="Amount" /></TableHead>
                <TableHead><SortButton field="grant_status" label="Status" /></TableHead>
                {/* <TableHead>Bias Flags</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, idx) => (
                <TableRow key={`${item.award_number}-${idx}`} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs font-medium text-slate-600">{item.award_number}</TableCell>
                  <TableCell><div className="max-w-[350px] text-sm font-medium text-slate-900 truncate" title={item.project_title}>{item.project_title}</div></TableCell>
                  <TableCell><div className="text-xs text-slate-600 max-w-[200px] truncate" title={item.recipient_name}>{item.recipient_name}</div></TableCell>
                  <TableCell><Badge variant="outline" className="font-normal text-slate-600">{item.awarding_office}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">
                    {item.award_amount 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.award_amount)
                      : <span className="text-slate-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.grant_status)} className={item.grant_status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                      {item.grant_status}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {parseFlags(item.bias_flags).length > 0 ? (
                        parseFlags(item.bias_flags).map((flag, i) => (
                          <Badge key={i} variant={getBiasColor(flag)} className="text-[10px] px-1 py-0 h-5">{flag}</Badge>
                        ))
                      ) : <span className="text-xs text-slate-300">-</span>}
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}