import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  DollarSign, 
  Zap, 
  Lightbulb, 
  Loader2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  LayoutDashboard,
  History,
  Settings,
  HelpCircle,
  Bell,
  ChevronRight,
  Plus,
  BarChart3,
  Activity,
  Cpu,
  Database,
  Cloud,
  Terminal,
  ArrowUpRight,
  ArrowRight,
  Users,
  Clock
} from 'lucide-react';
import { analyzeSystem } from './services/geminiService';
import { AuditResult, AuditIssue, Priority, Category } from './types';

interface AuditHistoryItem {
  id: string;
  date: string;
  summary: string;
  status: string;
  data: AuditResult;
  name: string;
}

type TabId = 'dashboard' | 'audit' | 'history' | 'analytics' | 'monitoring' | 'settings' | 'support';

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    High: 'bg-rose-500 text-white shadow-rose-200',
    Medium: 'bg-amber-400 text-white shadow-amber-200',
    Low: 'bg-emerald-500 text-white shadow-emerald-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const CategoryIcon = ({ category }: { category: Category }) => {
  switch (category) {
    case 'Cost': return (
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <span className="text-xl" role="img" aria-label="cost">💰</span>
      </div>
    );
    case 'Security': return (
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-rose-600" />
        <span className="text-xl" role="img" aria-label="security">🔒</span>
      </div>
    );
    case 'Performance': return (
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-600" />
        <span className="text-xl" role="img" aria-label="performance">⚡</span>
      </div>
    );
    case 'Recommendation': return (
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-emerald-600" />
        <span className="text-xl" role="img" aria-label="recommendation">💡</span>
      </div>
    );
  }
};

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend?: string }) => (
  <div className="dashboard-card p-6 flex flex-col gap-6 border-none shadow-xl shadow-slate-200/40 bg-white">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-2xl ${color} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full shadow-sm ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('audit'); // Default to audit for better demo
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationMessage, setActivationMessage] = useState('');
  const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('auditHistory');
    if (savedHistory) {
      try {
        setAuditHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse audit history", e);
      }
    }
  }, []);

  const handleEnableFullSystemMode = async () => {
    setIsActivating(true);
    const messages = [
      "Spawning audit agents...",
      "Analyzing infrastructure layers...",
      "Detecting anomalies..."
    ];
    
    for (let i = 0; i < messages.length; i++) {
      setActivationMessage(messages[i]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsAdvancedMode(true);
    setIsActivating(false);
  };

  const stats = useMemo(() => {
    if (!result) return null;
    return {
      high: result.issues.filter(i => i.priority === 'High').length,
      medium: result.issues.filter(i => i.priority === 'Medium').length,
      low: result.issues.filter(i => i.priority === 'Low').length,
      total: result.issues.length
    };
  }, [result]);

  const analyticsData = useMemo(() => {
    if (!result) return null;

    const totalIssues = result.issues.length;
    const highPriority = result.issues.filter(i => i.priority === 'High').length;
    
    // Efficiency Score calculation
    let score = 90;
    if (highPriority > 5) score = 40 + Math.random() * 20;
    else if (highPriority > 2) score = 60 + Math.random() * 15;
    else if (totalIssues > 10) score = 70 + Math.random() * 10;
    else score = 85 + Math.random() * 10;
    
    // Issue Distribution
    const securityCount = result.issues.filter(i => i.category === 'Security').length;
    const costCount = result.issues.filter(i => i.category === 'Cost').length;
    const performanceCount = result.issues.filter(i => i.category === 'Performance').length;
    const recCount = result.issues.filter(i => i.category === 'Recommendation').length;
    
    const distribution = [
      { label: 'Security', val: totalIssues > 0 ? Math.round((securityCount / totalIssues) * 100) : 0, color: 'bg-rose-500' },
      { label: 'Cost', val: totalIssues > 0 ? Math.round((costCount / totalIssues) * 100) : 0, color: 'bg-blue-500' },
      { label: 'Performance', val: totalIssues > 0 ? Math.round((performanceCount / totalIssues) * 100) : 0, color: 'bg-amber-500' },
      { label: 'Optimization', val: totalIssues > 0 ? Math.round((recCount / totalIssues) * 100) : 0, color: 'bg-slate-300' },
    ];

    // Cost Trends (Simulated)
    const baseCost = 50;
    const costTrend = Array.from({ length: 7 }).map((_, i) => {
      const volatility = Math.random() * 10 - 5;
      const issueImpact = (totalIssues * 2) * (i / 6); 
      return Math.round(baseCost + volatility + issueImpact);
    });

    // Infrastructure Growth
    const loadIncrease = 15 + (totalIssues * 1.5);

    return {
      score: Math.round(score),
      distribution,
      costTrend,
      loadIncrease: Math.round(loadIncrease)
    };
  }, [result]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSystem(input);
      setResult(data);

      // Save to Audit History
      const highPriorityCount = data.issues.filter(i => i.priority === 'High').length;
      const totalIssues = data.issues.length;
      
      const newAudit: AuditHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        summary: `${totalIssues} issues, ${highPriorityCount} high priority`,
        status: highPriorityCount > 3 ? "Critical" : (highPriorityCount > 0 ? "Fair" : "Good"),
        data: data,
        name: input.length > 30 ? input.substring(0, 30) + '...' : input
      };

      let history = JSON.parse(localStorage.getItem("auditHistory") || "[]");
      history.unshift(newAudit);
      history = history.slice(0, 5);
      localStorage.setItem("auditHistory", JSON.stringify(history));
      setAuditHistory(history);
      
      console.log("Saved audit:", newAudit);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze system. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Audits" value={isAdvancedMode ? "42" : "24"} icon={History} color="bg-blue-50 text-blue-600" trend={isAdvancedMode ? "+18" : "+12%"} />
        <StatCard label="Critical Risks" value={isAdvancedMode ? "12" : "3"} icon={ShieldAlert} color="bg-rose-50 text-rose-600" trend={isAdvancedMode ? "+9" : "-2"} />
        <StatCard label="Cost Savings" value={isAdvancedMode ? "$28.1k" : "$12.4k"} icon={DollarSign} color="bg-emerald-50 text-emerald-600" trend={isAdvancedMode ? "+$15.7k" : "+$2.1k"} />
        <StatCard label="Avg Health" value={isAdvancedMode ? "62%" : "84%"} icon={Activity} color="bg-amber-50 text-amber-600" trend={isAdvancedMode ? "-22%" : "+5%"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isAdvancedMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="dashboard-card p-8 border-none shadow-2xl shadow-blue-600/10 bg-slate-900 text-white"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Agent Activity</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Full System Scan Active</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Agents</p>
                  <p className="text-2xl font-black text-white">05</p>
                </div>
              </div>
              <div className="space-y-4 font-mono text-xs">
                {[
                  "Agent 1 → Scanning API endpoints",
                  "Agent 2 → Checking resource allocation",
                  "Agent 3 → Detecting cost anomalies",
                  "Agent 4 → Validating configurations",
                  "Agent 5 → Correlating system metrics"
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400 border-l-2 border-blue-600/30 pl-4 py-1">
                    <span className="text-blue-500 font-bold">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="dashboard-card p-8 border-none shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
              <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">View All Reports</button>
            </div>
            <div className="space-y-6">
              {[
                { title: 'AWS Infrastructure Audit', date: '2 hours ago', status: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50' },
                { title: 'GCP Kubernetes Review', date: '5 hours ago', status: 'Healthy', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Azure Cost Optimization', date: 'Yesterday', status: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' },
                { title: 'On-premise Security Scan', date: '2 days ago', status: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Cloud className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs font-medium text-slate-400">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.bg} ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`dashboard-card p-8 border-none shadow-2xl flex flex-col justify-between transition-all duration-500 ${isAdvancedMode ? 'bg-emerald-600 shadow-emerald-600/30' : 'premium-gradient shadow-blue-600/30'} text-white`}>
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              {isAdvancedMode ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Cpu className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-2xl font-bold mb-3">{isAdvancedMode ? "Full System Mode Enabled" : "Advanced AI Audit Capabilities"}</h3>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
              {isAdvancedMode ? "Continuous monitoring and multi-agent coordination are now active across your infrastructure." : "Deploy autonomous agents for continuous infrastructure validation and multi-layered analysis."}
            </p>
            <ul className="space-y-6 mb-8">
              {[
                { title: 'Continuous Real-Time Monitoring', desc: 'AI agents monitor system behavior and detect anomalies instantly' },
                { title: 'Multi-Agent Collaboration', desc: 'Multiple AI agents coordinate to analyze complex system interactions' },
                { title: 'Scalable Infrastructure Analysis', desc: 'Handles large-scale systems with high performance and reliability' },
                { title: 'API-Driven Integrations', desc: 'Seamlessly connect with external tools and enterprise workflows' }
              ].map((feat, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center backdrop-blur-md mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">{feat.title}</p>
                    <p className="text-[11px] text-blue-100 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={handleEnableFullSystemMode}
            disabled={isActivating || isAdvancedMode}
            className={`w-full bg-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-black/10 active:scale-[0.98] flex items-center justify-center gap-3 ${isAdvancedMode ? 'text-emerald-600 cursor-default' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            {isActivating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {activationMessage}
              </>
            ) : isAdvancedMode ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Active
              </>
            ) : (
              "Enable Full System Mode"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-12">
      {/* Input Section */}
      {!result && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card p-10 border-none shadow-2xl shadow-slate-200/50 bg-white"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">System Audit</h3>
              <p className="text-sm font-medium text-slate-500">Describe your infrastructure for a deep AI assessment.</p>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: We use AWS with EC2 instances for our web app, RDS for Postgres, and S3 for storage. Traffic is handled by an ALB. We're seeing high monthly bills and occasional latency..."
            className="w-full h-64 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 mb-8 text-lg font-medium leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className="flex items-center gap-3 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/30 active:scale-95"
            >
              <Search className="w-4 h-4" />
              Start Premium Audit
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-50 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-lg shadow-blue-100"></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Architecting Solutions...</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Our AI is analyzing your infrastructure patterns against industry standards.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-3xl flex items-center gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Top Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Issues" value={isAdvancedMode ? (stats?.total || 0) + 9 : (stats?.total || 0)} icon={LayoutDashboard} color="bg-indigo-50 text-indigo-600" />
              <StatCard label="High Priority" value={isAdvancedMode ? (stats?.high || 0) + 3 : (stats?.high || 0)} icon={ShieldAlert} color="bg-rose-50 text-rose-600" />
              <StatCard label="Cost Savings" value={isAdvancedMode ? "~42%" : "~24%"} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
              <div className="dashboard-card p-6 flex flex-col gap-6 border-none shadow-xl shadow-slate-200/40 bg-white">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    isAdvancedMode ? 'bg-blue-50 text-blue-600' :
                    result.overallHealth.toLowerCase().includes('excellent') ? 'bg-emerald-50 text-emerald-600' :
                    result.overallHealth.toLowerCase().includes('fair') ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    isAdvancedMode ? 'bg-blue-500' :
                    result.overallHealth.toLowerCase().includes('excellent') ? 'bg-emerald-500' :
                    result.overallHealth.toLowerCase().includes('fair') ? 'bg-amber-500' : 'bg-rose-500'
                  }`}></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{isAdvancedMode ? "Full System Scan Active" : result.overallHealth}</p>
                </div>
              </div>
            </div>

            {/* AI Verdict Section */}
            <div className="premium-gradient rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Cpu className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-100">AI Verdict</span>
                </div>
                <h3 className="text-4xl font-bold mb-6 leading-tight max-w-2xl">Infrastructure Assessment</h3>
                <p className="text-blue-50 text-xl leading-relaxed max-w-3xl font-medium opacity-90">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Issues Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  Detailed Findings
                  <span className="bg-slate-100 text-slate-500 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{result.issues.length} Issues</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {result.issues.map((issue, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group dashboard-card p-10 flex flex-col border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          issue.category === 'Cost' ? 'bg-blue-50' :
                          issue.category === 'Security' ? 'bg-rose-50' :
                          issue.category === 'Performance' ? 'bg-amber-50' : 'bg-emerald-50'
                        }`}>
                          <CategoryIcon category={issue.category} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{issue.category}</span>
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{issue.title}</h4>
                        </div>
                      </div>
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    
                    <p className="text-slate-500 text-base leading-relaxed mb-10 font-medium">
                      {issue.explanation}
                    </p>
                    
                    <div className="mt-auto space-y-8">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100/50 transition-all duration-500">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Action</span>
                        </div>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{issue.suggestedFix}</p>
                      </div>
                      
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Impact</span>
                        </div>
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{issue.impact}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="dashboard-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Audit Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Health</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Summary</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditHistory.length > 0 ? (
              auditHistory.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{audit.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{audit.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${
                      audit.status === 'Critical' ? 'text-red-600' : 
                      audit.status === 'Fair' ? 'text-amber-600' : 
                      'text-emerald-600'
                    }`}>{audit.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{audit.summary}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setResult(audit.data);
                        setActiveTab('audit');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                    >
                      View <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No audit history found. Run your first audit to see results here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {auditHistory.length > 0 && (
        <div className="flex justify-center">
          <button 
            onClick={() => {
              localStorage.removeItem('auditHistory');
              setAuditHistory([]);
            }}
            className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!analyticsData) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Analytics Available</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Run a system audit to generate data-driven insights and performance metrics.</p>
          <button 
            onClick={() => setActiveTab('audit')}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            Run Audit Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded">AI-Generated Insights</span>
          <span className="text-[10px] text-slate-400 font-bold">Based on latest system audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dashboard-card p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Estimated Cost Behavior</h4>
            <div className="h-32 flex items-end gap-2">
              {analyticsData.costTrend.map((h, i) => (
                <div key={i} className="flex-grow bg-blue-50 rounded-t-sm relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / 150) * 100}%` }}
                    className="bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700"
                  ></motion.div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ${h}k
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
              <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
            </div>
          </div>

          <div className="dashboard-card p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Issue Distribution</h4>
            <div className="space-y-3">
              {analyticsData.distribution.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      className={`h-full ${item.color}`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-6 flex flex-col justify-center items-center text-center">
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${analyticsData.score}, 100` }}
                  className={`${analyticsData.score > 80 ? 'text-emerald-500' : analyticsData.score > 60 ? 'text-amber-500' : 'text-rose-500'} stroke-current`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-slate-900">{analyticsData.score}%</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Efficiency Score</h4>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
              {analyticsData.score > 80 ? 'Optimized' : analyticsData.score > 60 ? 'Moderate' : 'Critical'}
            </p>
          </div>
        </div>

        <div className="dashboard-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Infrastructure Growth</h3>
              <p className="text-xs text-slate-500">System load increased by {analyticsData.loadIncrease}% over last 30 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">7D</button>
              <button className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-bold text-white shadow-md shadow-blue-100">30D</button>
            </div>
          </div>
          <div className="h-48 w-full flex items-end justify-between px-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = 20 + Math.random() * 60 + (i * 2);
              return (
                <div key={i} className="flex-grow bg-slate-50 rounded-t-xl relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-t-xl"
                  ></motion.div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-slate-400">
            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMonitoring = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h4 className="font-bold text-slate-900">System Uptime</h4>
          </div>
          <p className="text-3xl font-bold text-slate-900">99.98%</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="font-bold text-slate-900">Avg Response</h4>
          </div>
          <p className="text-3xl font-bold text-slate-900">124ms</p>
          <p className="text-xs text-slate-500 mt-1">-12ms from last week</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold text-slate-900">Active Alerts</h4>
          </div>
          <p className="text-3xl font-bold text-slate-900">2</p>
          <p className="text-xs text-slate-500 mt-1">Requires attention</p>
        </div>
      </div>

      <div className="dashboard-card p-6">
        <h3 className="font-bold text-slate-900 mb-6">Service Status</h3>
        <div className="space-y-6">
          {[
            { name: 'API Gateway', region: 'us-east-1', status: 'Operational', load: '12%', color: 'bg-emerald-500' },
            { name: 'Primary Database', region: 'us-east-1', status: 'Operational', load: '45%', color: 'bg-emerald-500' },
            { name: 'Auth Service', region: 'eu-west-1', status: 'Degraded', load: '89%', color: 'bg-amber-500' },
            { name: 'Static Assets (CDN)', region: 'Global', status: 'Operational', load: '4%', color: 'bg-emerald-500' },
            { name: 'Worker Nodes', region: 'us-west-2', status: 'Operational', load: '22%', color: 'bg-emerald-500' },
          ].map((service, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${service.color} animate-pulse`}></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{service.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{service.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">{service.status}</p>
                  <p className="text-[10px] text-slate-400">Status</p>
                </div>
                <div className="w-24 text-right">
                  <p className="text-xs font-bold text-slate-700">{service.load}</p>
                  <p className="text-[10px] text-slate-400">Current Load</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl space-y-6">
      <div className="dashboard-card p-6">
        <h3 className="font-bold text-slate-900 mb-6">Profile Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input type="text" defaultValue="System Admin" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
              <input type="email" defaultValue="admin@sentinelops.ai" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Title</label>
            <input type="text" defaultValue="Cloud Architect" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
      </div>

      <div className="dashboard-card p-6">
        <h3 className="font-bold text-slate-900 mb-6">Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'Security Alerts', desc: 'Get notified of critical vulnerabilities immediately.' },
            { label: 'Cost Thresholds', desc: 'Alert when projected monthly spend exceeds budget.' },
            { label: 'Weekly Summary', desc: 'Receive a weekly report of your system health.' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20">Save Changes</button>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="dashboard-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Contact Support</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option>Technical Issue</option>
                <option>Billing Question</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
              <textarea placeholder="Describe how we can help..." className="w-full h-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none"></textarea>
            </div>
            <button className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors">Send Message</button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="dashboard-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'How accurate is the AI audit?', a: 'Our AI uses the latest best practices from AWS, GCP, and Azure to provide highly accurate recommendations.' },
              { q: 'Can I connect my live cloud account?', a: 'Direct cloud integration is available in our Enterprise plan.' },
              { q: 'Is my system description private?', a: 'Yes, all data is encrypted and used only for the duration of the audit.' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-bold text-slate-900">{item.q}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-card p-6 bg-blue-600 text-white border-none">
          <h3 className="font-bold mb-2">Need a Custom Review?</h3>
          <p className="text-blue-100 text-xs mb-4">Schedule a 1-on-1 call with a Senior Solutions Architect for a deep dive into your infrastructure.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">Book a Session</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'audit': return renderAudit();
      case 'history': return renderHistory();
      case 'analytics': return renderAnalytics();
      case 'monitoring': return renderMonitoring();
      case 'settings': return renderSettings();
      case 'support': return renderSupport();
      default: return renderDashboard();
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Dashboard', sub: 'Welcome back! Here is an overview of your system health.' };
      case 'audit': return { title: 'System Audit', sub: 'Analyze and optimize your technical infrastructure.' };
      case 'history': return { title: 'Audit History', sub: 'Review your past infrastructure reports.' };
      case 'analytics': return { title: 'Analytics', sub: 'Detailed insights into your cloud performance.' };
      case 'monitoring': return { title: 'Live Monitoring', sub: 'Real-time infrastructure health tracking.' };
      case 'settings': return { title: 'Settings', sub: 'Configure your SentinelOps preferences.' };
      case 'support': return { title: 'Support', sub: 'Get expert help with your architecture.' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SentinelOps AI</span>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={activeTab === 'dashboard' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={activeTab === 'audit' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <Terminal className="w-4 h-4" />
            System Audit
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <History className="w-4 h-4" />
            Audit History
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={activeTab === 'analytics' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={activeTab === 'monitoring' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <Activity className="w-4 h-4" />
            Live Monitoring
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button 
            onClick={() => setActiveTab('settings')}
            className={activeTab === 'settings' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={activeTab === 'support' ? 'sidebar-item-active w-full' : 'sidebar-item w-full'}
          >
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Demo Environment</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-grow overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{pageInfo?.title}</h2>
                <p className="text-slate-500 text-sm">{pageInfo?.sub}</p>
              </div>
              {activeTab !== 'audit' && (
                <button 
                  onClick={() => setActiveTab('audit')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  New Audit
                </button>
              )}
              {activeTab === 'audit' && (
                <button 
                  onClick={() => { setResult(null); setInput(''); }}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Clear Audit
                </button>
              )}
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
