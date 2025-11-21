"use client";

import { useState } from 'react';
import { useAdminOrders, useAdminFoods, OrderFilterParams, AdminOrder } from '@/hooks/use-admin';
import { Loader2, Search, Calendar, FileDown, ArrowUpDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/pagination-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MenuItem } from '@/types';

const PAGE_SIZE = 10;

// ✅ Helper to safely parse the date string (timestamp) from the API
const parseDate = (dateString: string) => {
  const timestamp = Number(dateString);
  // If the conversion fails (NaN), try parsing it as a standard ISO string, otherwise use the timestamp
  return isNaN(timestamp) ? new Date(dateString) : new Date(timestamp);
};

// --- Sub-Component: Orders Report Tab ---
const OrdersReport = () => {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  // Fetch Data
  const filters: OrderFilterParams = {
    page,
    pageSize: PAGE_SIZE,
    search,
    status: status === "ALL" ? undefined : status,
    startDate,
    endDate,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  };

  const { data, isLoading, isError } = useAdminOrders(filters);
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExportPDF = () => {
    if (!data?.items) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Sales Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let filterText = "Filters: ";
    if (startDate) filterText += `From ${startDate} `;
    if (endDate) filterText += `To ${endDate} `;
    if (status !== "ALL") filterText += `Status: ${status}`;
    doc.text(filterText, 14, 38);

    const tableData = data.items.map((order: AdminOrder) => [
      `#${order.bonoNumber || '-'}`,
      // ✅ FIX: Use the helper to format the date correctly for PDF
      parseDate(order.createdAt).toLocaleDateString(),
      order.user.name,
      `${order.food.name} (x${order.quantity})`,
      `${order.totalPrice.toFixed(2)}`,
      order.orderStatus
    ]);

    autoTable(doc, {
      head: [['Bono', 'Date', 'Customer', 'Items', 'Total (ETB)', 'Status']],
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [230, 57, 70] }, // Matches your brand red approximately
    });

    doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Render Logic
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Orders & Sales</h2>
        <Button
          onClick={handleExportPDF}
          disabled={!data?.items?.length || isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer, food..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-full rounded-md border border-input bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">In Progress</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Dates */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('bonoNumber')}>
                  <div className="flex items-center gap-1">Bono <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('user')}>
                  <div className="flex items-center gap-1">Customer <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('food')}>
                  <div className="flex items-center gap-1">Item <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-3 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('totalPrice')}>
                  <div className="flex items-center justify-end gap-1">Total <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center mb-2"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    Loading data...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-destructive">
                    <div className="flex justify-center mb-2"><AlertCircle className="h-6 w-6" /></div>
                    Failed to load orders.
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No orders found matching filters.</td>
                </tr>
              ) : (
                data?.items.map((order: AdminOrder) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-bold">#{order.bonoNumber || '-'}</td>
                    {/* ✅ FIX: Use helper to format date in table */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {parseDate(order.createdAt).toLocaleDateString()}
                      <span className="block text-xs opacity-70">{parseDate(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{order.user.name}</div>
                      <div className="text-xs text-muted-foreground">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{order.food.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            order.orderStatus === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center border-t border-border bg-card py-4 rounded-lg">
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

// --- Sub-Component: Foods List Tab ---
const FoodsReport = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminFoods(page, PAGE_SIZE);
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (isError) return <div className="p-12 text-center text-destructive">Failed to load food items.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Menu Item Inventory</h2>
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
            <tr>
              <th className="px-6 py-3">Item Name</th>
              <th className="px-6 py-3 text-right">Price (ETB)</th>
              <th className="px-6 py-3 text-center">Image</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.items.map((food: MenuItem) => (
              <tr key={food.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{food.name}</td>
                <td className="px-6 py-4 text-right text-primary font-bold">{food.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  {food.imageUrl ? <span className="text-xs text-green-600">Available</span> : <span className="text-xs text-muted-foreground">None</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center border-t border-border bg-card py-4 rounded-lg">
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function ReportsPage() {
  return (
    <main className="h-full overflow-y-auto p-4 md:p-6 bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze sales data and view inventory.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="foods">Food Items</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersReport />
          </TabsContent>

          <TabsContent value="foods">
            <FoodsReport />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
