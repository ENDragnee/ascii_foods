"use client";

import { useMemo } from 'react';
import { useAdminAnalytics } from '@/hooks/use-admin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Loader2, AlertCircle, TrendingUp, DollarSign, Users, Package, LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Helper Components ---

/**
 * A themed card wrapper for charts.
 * Fixed height ensures ResponsiveContainer always renders.
 */
const ChartCard = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: React.ReactNode }) => (
  <div className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="rounded-lg bg-muted p-2 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {/* Explicit height is crucial for Recharts */}
    <div className="h-[350px] w-full">
      {children}
    </div>
  </div>
);

/**
 * Type definitions for the CustomTooltip props.
 * This matches the data structure injected by Recharts.
 */
interface TooltipPayload {
  name: string;
  value: number;
  fill: string;
  // The original data object is available under 'payload' if needed
  payload?: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  // Custom props we pass in
  prefix?: string;
  suffix?: string;
}

/**
 * A custom tooltip that adapts to the theme.
 */
const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
        {/* Handle labels that might be dates or strings */}
        <p className="mb-1 text-sm font-semibold text-popover-foreground">
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: payload[0].fill }}>
          {payload[0].name}: {prefix}{payload[0].value.toLocaleString()}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, error } = useAdminAnalytics();

  // --- Data Transformation ---
  // Recharts prefers flat objects. We transform the nested API response here.
  const transformedData = useMemo(() => {
    if (!analytics) return null;

    return {
      // 1. Orders over time (already flat, just needs date formatting for display)
      ordersOverTime: analytics.ordersOverTime.map(item => ({
        ...item,
        displayDate: new Date(item.time).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
      })),

      // 2. Top Selling Foods: Flatten { food: { name } } -> { name }
      topSellingFoods: analytics.topSellingFoods.map(item => ({
        name: item.food.name,
        value: item.value
      })),

      // 3. Top Revenue Foods: Flatten { food: { name } } -> { name }
      topRevenueFoods: analytics.topRevenueFoods.map(item => ({
        name: item.food.name,
        value: item.value
      })),

      // 4. Top Customers: Flatten { user: { name } } -> { name }
      topCustomers: analytics.topCustomers.map(item => ({
        name: item.user.name,
        value: item.value
      }))
    };
  }, [analytics]);


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-destructive">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 text-lg">Error loading analytics: {error?.message}</p>
      </div>
    );
  }

  if (!transformedData) return <div className="p-6 text-muted-foreground">No analytics data available.</div>;

  return (
    <main className="h-full overflow-y-auto p-4 md:p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your restaurant&apos;s performance.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* 1. Orders Over Time */}
              <ChartCard
                title="Order Volume"
                icon={TrendingUp}
                description="Total orders received over the last 7 days."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transformedData.ordersOverTime}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Orders"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 2. Top Revenue Foods */}
              <ChartCard
                title="Revenue by Item"
                icon={DollarSign}
                description="Top 5 items generating the most revenue."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transformedData.topRevenueFoods}
                    layout="vertical"
                    margin={{ left: 0, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--color-foreground)"
                      fontSize={13}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip content={<CustomTooltip suffix=" ETB" />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                    <Bar
                      dataKey="value"
                      name="Revenue"
                      fill="var(--color-secondary)"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Tab 2: Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* 3. Top Selling Foods (Quantity) */}
              <ChartCard
                title="Most Popular Items"
                icon={Package}
                description="Top 5 items by quantity sold."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformedData.topSellingFoods}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      tickFormatter={(val) => val.length > 12 ? `${val.slice(0, 10)}...` : val}
                    />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                    <Bar
                      dataKey="value"
                      name="Sold"
                      fill="var(--color-chart-3)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 4. Top Customers */}
              <ChartCard
                title="Top Customers"
                icon={Users}
                description="Highest spending customers."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transformedData.topCustomers}
                    layout="vertical"
                    margin={{ left: 0, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--color-foreground)"
                      fontSize={13}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip content={<CustomTooltip suffix=" ETB" />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                    <Bar
                      dataKey="value"
                      name="Spent"
                      fill="var(--color-chart-4)"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
