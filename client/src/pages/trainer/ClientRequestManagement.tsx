import { useState } from "react";
import { Check, X, Clock, Dumbbell, User, Mail, Calendar, BarChart, ChevronDown, ChevronUp, Filter } from "lucide-react";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { useGetPendingClientRequests, useAcceptRejectClientRequest } from "@/hooks/trainer/useClientRequest";

// Define TypeScript interfaces for your data structure
interface ClientRequest {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  fitnessGoal: string;
  experienceLevel: string;
  selectStatus: string;
  createdAt: string;
  updatedAt: string;
  trainerName: string | null;
}

interface PendingClientRequestsResponse {
  success: boolean;
  message: string;
  requests: ClientRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
}

export default function ClientRequestsTable() {
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Fetch pending client requests using the query hook
  const { data: clientRequestsData, isLoading, isError, error } = useGetPendingClientRequests(page, limit);
  console.log(clientRequestsData, "data");
  
  // Access the requests array directly from the response
  const clientRequests: ClientRequest[] = clientRequestsData?.requests || [];

  // Mutation hook for accepting/rejecting requests
  const { mutate: acceptRejectRequest, isPending: isMutating } = useAcceptRejectClientRequest();

  // Format date string to a readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time from date string
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format text fields
  const formatText = (text: string): string => {
    if (!text) return "";
    const words = text.split(/(?=[A-Z])|_/);
    return words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  // Handle sorting
  const handleSort = (field: string): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort the client requests
  const sortedRequests = [...clientRequests].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortField === "createdAt" || sortField === "updatedAt") {
      return sortDirection === "asc"
        ? new Date(a[sortField as keyof ClientRequest] as string).getTime() - new Date(b[sortField as keyof ClientRequest] as string).getTime()
        : new Date(b[sortField as keyof ClientRequest] as string).getTime() - new Date(a[sortField as keyof ClientRequest] as string).getTime();
    } else {
      const valueA = String(a[sortField as keyof ClientRequest] || "");
      const valueB = String(b[sortField as keyof ClientRequest] || "");
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });

  // Handle accept request - Use client.clientId instead of client.id
  const handleAccept = (clientId: string): void => {
    acceptRejectRequest({ clientId, action: "accept" });
  };

  // Handle reject request - Use client.clientId instead of client.id
  const handleReject = (clientId: string): void => {
    acceptRejectRequest({ clientId, action: "reject" });
  };

  // Get status badge based on current status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
            <Check size={14} />
            <span>Accepted</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
            <X size={14} />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
            <Clock size={14} />
            <span>Pending</span>
          </div>
        );
    }
  };

  // Toggle row expansion
  const toggleRowExpand = (id: string): void => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Handle pagination
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="container mx-auto px-4 py-12 text-center">
          <AnimatedTitle title="Loading Client Requests" subtitle="Please wait while we fetch the data" />
          <div className="mt-8">Loading...</div>
        </div>
      </AnimatedBackground>
    );
  }

  if (isError) {
    return (
      <AnimatedBackground>
        <div className="container mx-auto px-4 py-12 text-center">
          <AnimatedTitle title="Error" subtitle="Failed to load client requests" />
          <div className="mt-8 text-red-500">{(error as Error)?.message || "An error occurred"}</div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-12">
        <AnimatedTitle
          title="Client Requests"
          subtitle="Review and manage pending training requests from clients"
        />

        <div className="mt-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header with filter options */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <User className="mr-2" size={20} />
                  <span>Client Request Queue</span>
                </h3>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <span className="text-white/80 text-sm">Showing {clientRequests.length} requests</span>
                  <div className="bg-white/20 p-2 rounded-full">
                    <Filter size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Client Name
                        {sortField === "name" && (
                          sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("fitnessGoal")}
                    >
                      <div className="flex items-center">
                        Fitness Goal
                        {sortField === "fitnessGoal" && (
                          sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("experienceLevel")}
                    >
                      <div className="flex items-center">
                        Experience
                        {sortField === "experienceLevel" && (
                          sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Requested Date
                        {sortField === "createdAt" && (
                          sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRequests.map((client) => (
                    <>
                      <tr
                        key={client.id}
                        className={`${
                          expandedRow === client.id ? "bg-indigo-50" : "hover:bg-gray-50"
                        } transition-colors duration-150 cursor-pointer`}
                        onClick={() => toggleRowExpand(client.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail size={12} className="mr-1" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Dumbbell size={16} className="text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-900">{formatText(client.fitnessGoal)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BarChart size={16} className="text-purple-500 mr-2" />
                            <span className="text-sm text-gray-900">{formatText(client.experienceLevel)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(client.createdAt)}</div>
                          <div className="text-xs text-gray-500">{formatTime(client.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(client.selectStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {client.selectStatus === "pending" ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccept(client.clientId); // Changed from client.id to client.clientId
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1 rounded-md text-xs flex items-center"
                                disabled={isMutating}
                              >
                                <Check size={12} className="mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(client.clientId); // Changed from client.id to client.clientId
                                }}
                                className="border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-xs flex items-center"
                                disabled={isMutating}
                              >
                                <X size={12} className="mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-xs italic">{formatText(client.selectStatus)}</div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {expandedRow === client.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-indigo-50/70">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Request Created</div>
                                <div className="flex items-center">
                                  <Calendar size={16} className="text-indigo-500 mr-2" />
                                  <span>
                                    {formatDate(client.createdAt)} at {formatTime(client.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                                <div className="flex items-center">
                                  <Clock size={16} className="text-purple-500 mr-2" />
                                  <span>
                                    {formatDate(client.updatedAt)} at {formatTime(client.updatedAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Current Status</div>
                                <div className="flex items-center">
                                  <div className="mr-2">{getStatusBadge(client.selectStatus)}</div>
                                  <span className="text-sm">since {formatDate(client.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {clientRequests.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no client requests waiting for your response at this time.
                </p>
              </div>
            )}

            {/* Pagination */}
            {clientRequestsData?.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="px-3 py-1 rounded-md bg-indigo-100 border border-indigo-300 text-sm">
                    Page {page} of {clientRequestsData?.totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === clientRequestsData?.totalPages}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}