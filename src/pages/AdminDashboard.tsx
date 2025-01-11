import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  communityIssues: number;
  governmentSchemes: number;
  resolutionRate: number;
  adminResolvedIssues: number;
  criticalIssues: number;
  issuesByMonth: Array<{ month: string; count: number }>;
  issuesByStatus: Array<{ name: string; value: number }>;
  recentActivity: Array<{
    id: string | number;
    title: string;
    type: string;
    status: string;
    date: string;
    userEmail: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    communityIssues: 0,
    governmentSchemes: 0,
    resolutionRate: 0,
    adminResolvedIssues: 0,
    criticalIssues: 0,
    issuesByMonth: [],
    issuesByStatus: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      if (!adminEmail) {
        console.error('No admin email found');
        return;
      }

      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/dashboard-stats?adminEmail=${adminEmail}`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform monthly data for bar chart
        const monthlyData = data.issuesByMonth.map((item: any) => ({
          month: item.month,
          count: item.count
        }));

        // Transform status data for pie chart
        const statusData = [
          { name: 'Pending', value: data.pendingIssues },
          { name: 'Resolved', value: data.resolvedIssues },
          { name: 'Community', value: data.communityIssues },
          { name: 'Government', value: data.governmentSchemes }
        ];

        const transformedData: DashboardStats = {
          totalIssues: data.totalIssues || 0,
          pendingIssues: data.pendingIssues || 0,
          resolvedIssues: data.resolvedIssues || 0,
          communityIssues: data.communityIssues || 0,
          governmentSchemes: data.governmentSchemes || 0,
          resolutionRate: data.resolutionRate || 0,
          adminResolvedIssues: data.adminResolvedIssues || 0,
          criticalIssues: data.criticalIssues || 0,
          issuesByMonth: monthlyData,
          issuesByStatus: statusData,
          recentActivity: data.recentActivity || []
        };

        setStats(transformedData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading dashboard stats...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-full ${color} bg-opacity-10 mr-3 sm:mr-4`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>

        {/* Stats Grid - More responsive for mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            title="Total Issues"
            value={stats.totalIssues}
            icon={AlertCircle}
            color="text-indigo-600"
          />
          <StatCard
            title="Pending Issues"
            value={stats.pendingIssues}
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard
            title="Solved Issues"
            value={stats.resolvedIssues}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Critical Issues"
            value={stats.criticalIssues}
            icon={AlertTriangle}
            color="text-red-600"
          />
        </div>

        {/* Charts - More responsive for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">Monthly Issues</h2>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.issuesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    interval={window.innerWidth < 640 ? 1 : 0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} issues`, 'Count']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="count" fill="#4F46E5" name="Issues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">Issues by Status</h2>
            <div className="h-[250px] sm:h-[300px] w-full">
              {stats.issuesByStatus.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.issuesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => 
                        window.innerWidth < 640 
                          ? `${(percent * 100).toFixed(0)}%`
                          : `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.issuesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Legend for mobile */}
            {window.innerWidth < 640 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.issuesByStatus.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-2">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.recentActivity.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'GOVERNMENT_SCHEME' ? `[Scheme] ${activity.title}` : activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {activity.status}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.date} by {activity.userEmail}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 