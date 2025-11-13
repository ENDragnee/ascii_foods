"use client"

import { useState } from "react"
import { TrendingUp, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface OrderStats {
  newOrdersCount: number
  preparingCount: number
  readyCount: number
  totalOrders: number
  avgOrderTime: number
  completionRate: number
}

export default function HomePage() {
  const [stats, setStats] = useState<OrderStats>({
    newOrdersCount: 12,
    preparingCount: 8,
    readyCount: 5,
    totalOrders: 25,
    avgOrderTime: 18,
    completionRate: 80,
  })

  const [issues, setIssues] = useState([
    {
      id: 1,
      type: "delayed",
      title: "High Order Backlog",
      description: "12 new orders waiting. Consider calling another staff member.",
      severity: "high",
    },
    {
      id: 2,
      type: "alert",
      title: "Average Prep Time Increasing",
      description: "Current avg time: 18 mins (normally 12 mins). Check kitchen capacity.",
      severity: "medium",
    },
    {
      id: 3,
      type: "success",
      title: "Ready for Pickup",
      description: "5 orders ready. Notify customers via SMS.",
      severity: "low",
    },
  ])

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

          {/* Average Order Time */}
          <div className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Avg Order Time</h3>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">{stats.avgOrderTime}m</p>
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
              {/* Total Orders */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total Orders Completed</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">+15% from yesterday</p>
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

              {/* Peak Hours */}
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

          {/* System Status */}
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

        {/* Issues & Alerts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Alerts & Insights</h2>
          <div className="grid grid-cols-1 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border-l-4 flex items-start gap-4 ${
                  issue.severity === "high"
                    ? "bg-red-50 border-red-400 border-l-4"
                    : issue.severity === "medium"
                      ? "bg-yellow-50 border-yellow-400 border-l-4"
                      : "bg-green-50 border-green-400 border-l-4"
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    issue.severity === "high"
                      ? "bg-red-100"
                      : issue.severity === "medium"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      issue.severity === "high"
                        ? "text-red-600"
                        : issue.severity === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
