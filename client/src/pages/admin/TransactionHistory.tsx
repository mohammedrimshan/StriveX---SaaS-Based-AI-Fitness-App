"use client"

import { useState, useEffect, useCallback } from "react"
import { CreditCard, TrendingUp, ArrowDownUp, Loader2 } from "lucide-react"
import TransactionTable from "./TransactionHistory/TransactionTable"
import TransactionHeader from "./TransactionHistory/TransactionHeader"
import { useTransactionHistory } from "@/hooks/admin/useTransactionHistory"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund"
import AnimatedTitle from "@/components/Animation/AnimatedTitle"
import { Button } from "@/components/ui/button"

const TransactionHistory = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 1,
    limit: 10
  });
  const [searchInputValue, setSearchInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Applying search filter:", searchInputValue);
      setFilters(prev => ({ ...prev, search: searchInputValue, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  const { 
    transactions, 
    totalPages, 
    currentPage, 
    totalTransactions, 
    loading, 
    updatingData, 
    error, 
    fetchTransactions 
  } = useTransactionHistory(filters);

  console.log(transactions)

  const handleTabChange = useCallback((value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    console.log("Status filter changed to:", value);
    setActiveTab(value);
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    console.log("Page changed to:", page);
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    console.log("Search input changed:", query);
    setSearchInputValue(query);
  }, []);

  // Calculate summary statistics
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const completedTransactions = transactions.filter((t) => t.status.toLowerCase() === "completed")
  const pendingTransactions = transactions.filter((t) => t.status.toLowerCase() === "pending")
  const completedAmount = completedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  return (
    <AnimatedBackground>
      <div className="min-h-screen mt-10">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <AnimatedTitle 
              title="Transaction History" 
              subtitle="Monitor all payment transactions in one place"
            />

            {/* Initial Loading State - only shown on first load */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center text-red-500 py-8">
                <p>{error}</p>
                <Button
                  onClick={() => fetchTransactions(filters)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Summary Cards */}
            {!loading && !error && (
              <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-500 dark:text-gray-400 flex items-center">
                      <CreditCard className="h-4 w-4 mr-1 text-purple-500" />
                      Total Transactions
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold">{totalTransactions}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-emerald-500 font-medium">{completedTransactions.length}</span> completed,
                      <span className="text-amber-500 font-medium ml-1">{pendingTransactions.length}</span> pending
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-500 dark:text-gray-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
                      Total Revenue
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-emerald-500 font-medium">₹{completedAmount.toLocaleString()}</span> processed
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-500 dark:text-gray-400 flex items-center">
                      <ArrowDownUp className="h-4 w-4 mr-1 text-violet-500" />
                      Average Transaction
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold">
                      ₹{(totalTransactions > 0 ? totalAmount / totalTransactions : 0).toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Across all payment plans</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs and Table */}
            {!loading && !error && (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="animate-slide-up">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      <TabsTrigger
                        value="all"
                        className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                      >
                        All Transactions
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                      >
                        Completed
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                      >
                        Pending
                      </TabsTrigger>
                    </TabsList>

                    <TransactionHeader
                      searchQuery={searchInputValue}
                      setSearchQuery={handleSearchChange}
                      statusFilter={activeTab}
                      setStatusFilter={handleStatusFilterChange}
                    />
                  </div>

                  {/* Add subtle updating indicator */}
                  {updatingData && (
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Updating data...
                      </div>
                    </div>
                  )}

                  {/* Use a single TransactionTable component with improved data loading */}
                  <TransactionTable
                    transactions={transactions}
                    searchQuery={filters.search}
                    statusFilter={filters.status}
                    currentPage={currentPage}
                    setCurrentPage={handlePageChange}
                    totalPages={totalPages}
                    totalTransactions={totalTransactions}
                  />
                </div>
              </Tabs>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
              © 2025 StriveX. All transactions are secure and encrypted.
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}

export default TransactionHistory