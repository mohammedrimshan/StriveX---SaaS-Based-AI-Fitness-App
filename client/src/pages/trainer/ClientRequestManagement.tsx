import { useState } from "react";
import { Check, X, Clock, Dumbbell, User, Mail, Calendar, BarChart, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import {
  useGetPendingClientRequests,
  useAcceptRejectClientRequest,
} from "@/hooks/trainer/useClientRequest";

interface ClientRequest {
  id?: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  fitnessGoal?: string;
  experienceLevel?: string;
  selectStatus: string;
  createdAt?: string;
  updatedAt?: string;
  trainerName?: string | null;
  profileImage?: string;
}

export default function ClientRequestsTable() {
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const {
    data: clientRequestsData,
    isLoading,
    isError,
    error,
  } = useGetPendingClientRequests(page, limit);

  console.log(clientRequestsData)
  const clientRequests: ClientRequest[] = clientRequestsData?.requests || [];
  const { mutate: acceptRejectRequest, isPending: isMutating } =
    useAcceptRejectClientRequest();

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatText = (text?: string): string => {
    if (!text) return "N/A";
    const words = text.split(/(?=[A-Z])|_/);
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSort = (field: string): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRequests = [...clientRequests].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortDirection === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === "createdAt" || sortField === "updatedAt") {
      const timeA = a[sortField as keyof ClientRequest]
        ? new Date(a[sortField as keyof ClientRequest] as string).getTime()
        : 0;
      const timeB = b[sortField as keyof ClientRequest]
        ? new Date(b[sortField as keyof ClientRequest] as string).getTime()
        : 0;
      return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
    } else {
      const valueA = String(a[sortField as keyof ClientRequest] || "");
      const valueB = String(b[sortField as keyof ClientRequest] || "");
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });

  const handleAccept = (id: string): void => {
    acceptRejectRequest({ clientId: id, action: "accept" });
  };

  const handleReject = (id: string): void => {
    acceptRejectRequest({ clientId: id, action: "reject" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs">
            <Check size={14} />
            <span>Accepted</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs">
            <X size={14} />
            <span>Rejected</span>
          </div>
        );
     default:
       return (
         <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full text-xs">
           <Clock size={14} />
           <span>Pending</span>
         </div>
       );
    }
  };

  const toggleRowExpand = (clientId: string): void => {
    setExpandedRow(expandedRow === clientId ? null : clientId);
  };

const handlePageChange = (newPage: number): void => {
  setPage(newPage);
};

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 text-center">
        <div className="text-lg font-semibold text-gray-700 mb-4">Loading Client Requests</div>
        <div className="text-gray-500">Please wait while we fetch the data</div>
        <div className="mt-8">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 text-center">
        <div className="text-lg font-semibold text-red-600 mb-4">Error</div>
        <div className="text-gray-500 mb-4">Failed to load client requests</div>
        <div className="mt-8 text-red-500">
          {(error as Error)?.message || "An error occurred"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 mt-4">
      <div className="mt-6 sm:mt-8 max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h3 className="text-lg sm:text-xl font-bold flex items-center">
                <User className="mr-2" size={20} />
                <span>Client Request Queue</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-xs sm:text-sm">
                  Showing {clientRequests.length} requests
                </span>
                <div className="bg-white/20 p-2 rounded-full">
                  <Filter size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Table for larger screens, Card layout for smaller screens */}
          <div className="block">
            {/* Table for larger screens (lg and above) */}
            <div className="hidden lg:block">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className="w-1/4 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Client Name
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("fitnessGoal")}
                    >
                      <div className="flex items-center">
                        Fitness Goal
                        {sortField === "fitnessGoal" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("experienceLevel")}
                    >
                      <div className="flex items-center">
                        Experience
                        {sortField === "experienceLevel" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Requested Date
                        {sortField === "createdAt" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRequests.map((client) => (
                    <>
                      <tr
                        key={client.clientId}
                        className={`${
                          expandedRow === client.clientId
                            ? "bg-indigo-50"
                            : "hover:bg-gray-50"
                        } transition-colors duration-150 cursor-pointer`}
                        onClick={() => toggleRowExpand(client.clientId)}
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden">
                              {client.profileImage ? (
                                <img
                                  src={client.profileImage || "/placeholder.svg"}
                                  alt={`${client.firstName} ${client.lastName}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const nextSibling = e.currentTarget
                                      .nextSibling as HTMLElement;
                                    if (nextSibling) {
                                      nextSibling.style.display = "flex";
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm"
                                style={{
                                  display: client.profileImage
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                {client.firstName.charAt(0)}
                                {client.lastName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <Mail size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <div className="flex items-center">
                            <Dumbbell
                              size={14}
                              className="text-indigo-500 mr-1 sm:mr-2 flex-shrink-0"
                            />
                            <span className="text-xs sm:text-sm text-gray-900 truncate">
                              {formatText(client.fitnessGoal)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <div className="flex items-center">
                            <BarChart
                              size={14}
                              className="text-purple-500 mr-1 sm:mr-2 flex-shrink-0"
                            />
                            <span className="text-xs sm:text-sm text-gray-900 truncate">
                              {formatText(client.experienceLevel)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {formatDate(client.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(client.createdAt)}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          {getStatusBadge(client.selectStatus)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs font-medium">
                          {client.selectStatus === "pending" ? (
                            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccept(client.id as string);
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-2 sm:px-3 py-1 rounded-md text-xs flex items-center"
                                disabled={isMutating}
                              >
                                <Check size={12} className="mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(client.clientId);
                                }}
                                className="border border-red-500 text-red-500 hover:bg-red-50 px-2 sm:px-3 py-1 rounded-md text-xs flex items-center"
                                disabled={isMutating}
                              >
                                <X size={12} className="mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-xs italic">
                              {formatText(client.selectStatus)}
                            </div>
                          )}
                        </td>
                      </tr>

                      {expandedRow === client.clientId && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-2 sm:px-4 py-2 sm:py-4 bg-indigo-50/70"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">
                                  Request Created
                                </div>
                                <div className="flex items-center">
                                  <Calendar
                                    size={14}
                                    className="text-indigo-500 mr-2 flex-shrink-0"
                                  />
                                  <span className="text-xs sm:text-sm">
                                    {formatDate(client.createdAt)} at{" "}
                                    {formatTime(client.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">
                                  Last Updated
                                </div>
                                <div className="flex items-center">
                                  <Clock
                                    size={14}
                                    className="text-purple-500 mr-2 flex-shrink-0"
                                  />
                                  <span className="text-xs sm:text-sm">
                                    {formatDate(client.updatedAt)} at{" "}
                                    {formatTime(client.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">
                                  Current Status
                                </div>
                                <div className="flex items-center">
                                  <div className="mr-2">
                                    {getStatusBadge(client.selectStatus)}
                                  </div>
                                  <span className="text-xs sm:text-sm">
                                    since {formatDate(client.updatedAt)}
                                  </span>
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

            {/* Card layout for smaller screens (below lg) */}
            <div className="block lg:hidden space-y-4 p-4">
              {sortedRequests.map((client) => (
                <div
                  key={client.clientId}
                  className={`border border-gray-200 rounded-lg shadow-sm p-4 ${
                    expandedRow === client.clientId
                      ? "bg-indigo-50"
                      : "bg-white"
                  } transition-colors duration-150 cursor-pointer`}
                  onClick={() => toggleRowExpand(client.clientId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        {client.profileImage ? (
                          <img
                            src={client.profileImage || "/placeholder.svg"}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const nextSibling = e.currentTarget
                                .nextSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium"
                          style={{
                            display: client.profileImage ? "none" : "flex",
                          }}
                        >
                          {client.firstName.charAt(0)}
                          {client.lastName.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Mail size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(client.selectStatus)}</div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center">
                      <Dumbbell size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                      <span>
                        <strong>Fitness Goal:</strong>{" "}
                        {formatText(client.fitnessGoal)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <BarChart size={14} className="text-purple-500 mr-2 flex-shrink-0" />
                      <span>
                        <strong>Experience:</strong>{" "}
                        {formatText(client.experienceLevel)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                      <span>
                        <strong>Requested:</strong>{" "}
                        {formatDate(client.createdAt)} at{" "}
                        {formatTime(client.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {client.selectStatus === "pending" ? (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(client.id as string);
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1 rounded-md text-xs flex items-center justify-center"
                          disabled={isMutating}
                        >
                          <Check size={12} className="mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(client.clientId);
                          }}
                          className="border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-xs flex items-center justify-center"
                          disabled={isMutating}
                        >
                          <X size={12} className="mr-1" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs italic text-center">
                        {formatText(client.selectStatus)}
                      </div>
                    )}
                  </div>

                  {expandedRow === client.clientId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Request Created
                          </div>
                          <div className="flex items-center">
                            <Calendar
                              size={14}
                              className="text-indigo-500 mr-2 flex-shrink-0"
                            />
                            <span className="text-sm">
                              {formatDate(client.createdAt)} at{" "}
                              {formatTime(client.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Last Updated
                          </div>
                          <div className="flex items-center">
                            <Clock
                              size={14}
                              className="text-purple-500 mr-2 flex-shrink-0"
                            />
                            <span className="text-sm">
                              {formatDate(client.updatedAt)} at{" "}
                              {formatTime(client.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Current Status
                          </div>
                          <div className="flex items-center">
                            <div className="mr-2">
                              {getStatusBadge(client.selectStatus)}
                            </div>
                            <span className="text-sm">
                              since {formatDate(client.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {clientRequests.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No pending requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no client requests waiting for your response at this
                time.
              </p>
            </div>
          )}

          {clientRequestsData && clientRequestsData.totalPages > 1 && (
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-center">
              <div className="flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-xs sm:text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="px-3 py-1 rounded-md bg-indigo-100 border border-indigo-300 text-xs sm:text-sm">
                  Page {page} of {clientRequestsData.totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === clientRequestsData.totalPages}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-xs sm:text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
