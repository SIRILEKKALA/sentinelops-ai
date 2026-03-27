export type Category = 'Cost' | 'Security' | 'Performance' | 'Recommendation';
export type Priority = 'High' | 'Medium' | 'Low';

export interface AuditIssue {
  category: Category;
  title: string;
  explanation: string;
  suggestedFix: string;
  priority: Priority;
  impact: string;
}

export interface AuditResult {
  overallHealth: string;
  summary: string;
  issues: AuditIssue[];
}
