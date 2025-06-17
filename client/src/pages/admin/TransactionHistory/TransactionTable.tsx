"use client"

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, CreditCard, DollarSign, User, Package, Calendar } from 'lucide-react';
import { TransactionData } from "@/types/transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransactionTableProps {
  transactions: TransactionData[];
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalTransactions: number;
}

const ITEMS_PER_PAGE = 10; // Match backend limit

const TransactionTable = ({
  transactions,
  currentPage,
  setCurrentPage,
  totalPages,
  totalTransactions,
}: TransactionTableProps) => {
  const getStatusDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          tooltip: "Payment successfully processed"
        };
      case "pending":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          tooltip: "Payment is being processed"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: null,
          tooltip: "Unknown status"
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
              <TableHead className="font-medium text-gray-700 dark:text-gray-200 py-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  User Name
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Plan Name
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-right">
                <div className="flex items-center justify-end">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Amount (₹)
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-right">
                <div className="flex items-center justify-end">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Trainer Share (₹)
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200 text-right">
                <div className="flex items-center justify-end">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Admin Share (₹)
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Status
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Date (UTC)
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => {
                const statusDetails = getStatusDetails(transaction.status);
                return (
                  <TableRow 
                    key={transaction.id}
                    className={`
                      group transition-all duration-200 
                      ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'} 
                      hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-inner
                    `}
                  >
                    <TableCell className="font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {transaction.userName || "Unknown User"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {transaction.planName || "Unknown Plan"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                      ₹{(transaction.trainerAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-violet-600 dark:text-violet-400">
                      ₹{transaction.adminAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={`${statusDetails.color} capitalize flex items-center transition-all duration-300 hover:shadow-md`}
                            >
                              {statusDetails.icon}
                              {transaction.status}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{statusDetails.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600 dark:text-gray-300">
                        {format(new Date(transaction.createdAt), "yyyy-MM-dd")}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <CreditCard className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalTransactions)}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalTransactions)}</span> of{" "}
            <span className="font-medium">{totalTransactions}</span> transactions
          </div>
          <div className="flex space-x-1 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Logic to handle pagination display when there are many pages
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`rounded-full h-8 w-8 p-0 ${
                    pageNum === currentPage 
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" 
                      : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  } transition-all duration-200`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;