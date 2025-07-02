import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, ArrowDownLeft, ArrowUpRight, Search, Filter, Star, Sparkles, Trophy, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { debounce } from 'lodash';
import AnimatedBackground from '@/components/Animation/AnimatedBackgorund';
import AnimatedTitle from '@/components/Animation/AnimatedTitle';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { useClientWallet } from '@/hooks/wallet/useClientWallet';
import { IWalletTransaction } from '@/types/clientWallet';

// Define transaction type to include WITHDRAWAL
type TransactionType = 'ALL' | 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT';

// Generate list of months and years for selection
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(0, i).toLocaleString('en-IN', { month: 'long' }),
}));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

const formatReason = (reason: string) => {
  if (reason === "UNBOOKED_DAY") return "Unbooked Day";
  if (reason.startsWith("SUBSCRIPTION_UPGRADE")) return "Subscription Upgrade";
  if (reason === "BONUS_REWARD") return "Bonus Reward";
  if (reason === "REFERRAL_BONUS") return "Referral Bonus";
  if (reason === "MONTHLY_SUBSCRIPTION") return "Monthly Subscription";
  return reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const ClientWallet = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType>('ALL');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch wallet data using the hook with selected year and month
  const { data: walletData, isLoading } = useClientWallet(selectedYear, selectedMonth, currentPage, 10);

  // Calculate unbooked days count
  const unbookedDaysCount = useMemo(() => {
    return walletData?.transactions.filter(t => t.reason === 'UNBOOKED_DAY').length || 0;
  }, [walletData]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Filter transactions based on search term and type
  const filteredTransactions = useMemo(() => {
    if (!walletData?.transactions) return [];

    let filtered = walletData.transactions;

    if (filterType !== 'ALL') {
      filtered = filtered.filter(transaction => 
        transaction.type.toUpperCase() === filterType.toUpperCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        formatReason(transaction.reason).toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [walletData, searchTerm, filterType]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const transactionVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-12 w-12 border-3 border-t-indigo-600 border-purple-200 rounded-full"
          />
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="relative pt-12 pb-8">
          <div className="container11 mx-auto px-4">
            <AnimatedTitle 
              title="My Wallet" 
              subtitle="Track your fitness journey earnings and expenses with style"
              className="mb-10"
            />

            {/* Stats Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
            >
              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-lg rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
                    <CardContent className="relative p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <Sparkles className="h-3 w-3 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-white/80 text-[0.65rem] font-medium mb-0.5">Current Balance</p>
                      <p className="text-white text-lg font-bold">₹{walletData?.wallet.balance.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-lg rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
                    <CardContent className="relative p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <Star className="h-3 w-3 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-white/80 text-[0.65rem] font-medium mb-0.5">Monthly Transactions</p>
                      <p className="text-white text-lg font-bold">{walletData?.monthlyTransactionCount}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-lg rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
                    <CardContent className="relative p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <Trophy className="h-3 w-3 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-white/80 text-[0.65rem] font-medium mb-0.5">Monthly Total</p>
                      <p className="text-white text-lg font-bold">₹{walletData?.totalTransactionAmount.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
                    <CardContent className="relative p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <Target className="h-3 w-3 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-white/80 text-[0.65rem] font-medium mb-0.5">Unbooked Days</p>
                      <p className="text-white text-lg font-bold">{unbookedDaysCount}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Transaction List Section */}
        <div className="container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            {/* Search and Filter Section */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      Transaction History
                    </h2>
                    <p className="text-gray-600 text-sm">Monitor all your wallet activities</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Month Selector */}
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(value) => {
                        setSelectedMonth(Number(value));
                        setCurrentPage(1); // Reset to first page on month change
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 bg-white/50 backdrop-blur-sm text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-indigo-100">
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Year Selector */}
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={(value) => {
                        setSelectedYear(Number(value));
                        setCurrentPage(1); // Reset to first page on year change
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 bg-white/50 backdrop-blur-sm text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-indigo-100">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-10 w-full sm:w-64 h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 bg-white/50 backdrop-blur-sm text-sm"
                        onChange={(e) => debouncedSearch(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={(value: TransactionType) => setFilterType(value)}>
                      <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-300 bg-white/50 backdrop-blur-sm text-sm">
                        <Filter className="h-4 w-4 mr-2 text-indigo-600" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-indigo-100">
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="REFUND">Refunds</SelectItem>
                        <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                        <SelectItem value="DEPOSIT">Deposits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border-indigo-200">
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                  </Badge>
                </div>
              </motion.div>
            </div>

            {/* Transactions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-2xl inline-block mb-4">
                        <Search className="h-12 w-12 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">No transactions found</h3>
                      <p className="text-gray-600 text-sm">Try adjusting your search or filter criteria</p>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-gray-100"
                  >
                    {filteredTransactions.map((transaction: IWalletTransaction, index: number) => (
                      <motion.div
                        key={transaction.id}
                        variants={transactionVariants}
                        custom={index}
                        className="p-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 ${
                              transaction.type === 'REFUND' || transaction.type === 'DEPOSIT'
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                                : 'bg-gradient-to-br from-red-400 to-pink-500'
                            }`}>
                              {transaction.type === 'REFUND' || transaction.type === 'DEPOSIT' ? (
                                <ArrowDownLeft className="h-4 w-4 text-white" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-white" />
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  transaction.type === 'REFUND' || transaction.type === 'DEPOSIT'
                                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800'
                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                                }`}>
                                  {transaction.type}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                                {formatReason(transaction.reason)}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              transaction.type === 'REFUND' || transaction.type === 'DEPOSIT' 
                                ? 'text-emerald-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'REFUND' || transaction.type === 'DEPOSIT' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Pagination */}
            {walletData?.totalPages && walletData.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-8 flex justify-center"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={walletData.totalPages}
                    onPageChange={setCurrentPage}
                    maxVisiblePages={5}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default ClientWallet;