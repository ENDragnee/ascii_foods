"use client";

import { TrendingUp, Clock, CheckCircle, Zap, Loader2, AlertCircle, Trophy, Utensils, Image as ImageIcon } from "lucide-react";
import { useAdminDashboardStats, useTopSellingItems, useTodaysMenu } from "@/hooks/use-admin";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { MenuItem } from "@/types";

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorClass: { bg: string; text: string };
}) => (
  <div className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className={`rounded-lg p-2 ${colorClass.bg}`}>
        <Icon className={`h-5 w-5 ${colorClass.text}`} />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

/**
 * A themed card to display the top-selling items for the day.
 */
const TopSellersCard = () => {
  const { data: topSellers, isLoading } = useTopSellingItems();
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Trophy className="h-5 w-5 text-secondary" />
        <h2 className="text-lg font-semibold text-foreground">Top Sellers Today</h2>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded-md bg-muted"></div>
          <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted"></div>
          <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted"></div>
        </div>
      ) : !topSellers || topSellers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed sales yet today.</p>
      ) : (
        <ul className="space-y-3">
          {topSellers.map((item, index) => (
            <li key={item.food.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground">{index + 1}.</span>
                <div className="relative h-8 w-8 flex-shrink-0 rounded-md bg-muted">
                  {item.food.imageUrl ? <Image src={item.food.imageUrl} alt={item.food.name} layout="fill" objectFit="cover" className="rounded-md" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <span className="text-sm font-medium text-foreground">{item.food.name}</span>
              </div>
              <span className="text-sm font-bold text-primary">{item.sales} sold</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TodaysMenuCard = () => {
  const { data: menuItems, isLoading } = useTodaysMenu();
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Utensils className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">On the Menu Today</h2>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
          <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted"></div>
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        </div>
      ) : !menuItems || menuItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">The menu for today has not been set.</p>
      ) : (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {menuItems.map((item: MenuItem) => (
            <li key={item.id} className="truncate">- {item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default function AdminPage() {
  const { data: stats, isLoading, isError, error } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <main className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center text-destructive">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 text-lg">Error loading dashboard: {error?.message}</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="flex h-full w-full items-center justify-center">
        <p className="text-lg font-medium text-muted-foreground">No dashboard data available.</p>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{"A summary of your restaurant's activity today."}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Orders"
            value={stats.newOrdersCount}
            subtitle="Waiting for acceptance"
            icon={Zap}
            colorClass={{ bg: 'bg-destructive/10', text: 'text-destructive' }}
          />
          <StatCard
            title="In Progress"
            value={stats.preparingCount}
            subtitle="Being prepared"
            icon={Clock}
            colorClass={{ bg: 'bg-yellow-500/10', text: 'text-yellow-500' }}
          />
          <StatCard
            title="Ready for Pickup"
            value={stats.readyCount}
            subtitle="Waiting for customers"
            icon={CheckCircle}
            colorClass={{ bg: 'bg-green-500/10', text: 'text-green-500' }}
          />
          <StatCard
            title="Avg. Completion"
            value={`${stats.averageCompletionTime} min`}
            subtitle="Based on last 20 orders"
            icon={TrendingUp}
            colorClass={{ bg: 'bg-blue-500/10', text: 'text-blue-500' }}
          />
        </div>

        {/* Dynamic Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopSellersCard />
          <TodaysMenuCard />
        </div>
      </div>
    </main>
  );
}
