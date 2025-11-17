// app/admin/page.tsx (or wherever your AdminPage component is located)
"use client";

import { TrendingUp, Clock, CheckCircle, Zap } from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/use-admin"; // Adjust this path based on where you saved the hook

export default function AdminPage() {
  const { data: stats, isLoading, isError, error } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-xl font-medium text-slate-700">Loading dashboard data...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-xl font-medium text-red-600">Error loading stats: {error?.message}</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-xl font-medium text-slate-700">No dashboard data available.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600">Here's what's happening with your restaurant today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* New Orders */}
          <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-red-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">New Orders</h3>
              <div className="p-3 bg-red-100 rounded-lg">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">{stats.newOrdersCount}</p>
              <p className="text-sm text-slate-500">Waiting to be accepted</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-yellow-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">In Progress</h3>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">{stats.preparingCount}</p>
              <p className="text-sm text-slate-500">Being prepared</p>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-green-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Ready for Pickup</h3>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">{stats.readyCount}</p>
              <p className="text-sm text-slate-500">Waiting for customers</p>
            </div>
          </div>

          {/* Average Order Time - This data is not provided by your current GraphQL API, so it's a placeholder */}
          <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Avg Order Time</h3>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">N/A</p>
              <p className="text-sm text-slate-500">Today's average</p>
            </div>
          </div>
        </div>

        {/* Insights & Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Today's Performance</h2>
            <div className="space-y-4">
              {/* Total Orders Completed Today */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total Orders Completed</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrdersCompletedToday}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">+15% from yesterday</p> {/* This is static as API doesn't provide delta */}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Order Completion Rate</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.completionRate}%</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">{stats.completionRate}%</span>
                </div>
              </div>

              {/* Peak Hours (Static - as API doesn't provide it) */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Peak Hours</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">12 PM - 2 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Next peak in 2 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status (Static - as API doesn't provide it) */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-700">All systems operational</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-700">Printer connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-700">Database synced</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-slate-700">WiFi signal moderate</span>
              </div>
            </div>
          </div>
        </div>

        {/* The "Issues & Alerts" section has been removed as the provided GraphQL API
            does not return data for alerts or issues. If you wish to re-include this,
            you would need to extend your GraphQL schema and resolvers to provide such data. */}
      </div>
    </main>
  );
}