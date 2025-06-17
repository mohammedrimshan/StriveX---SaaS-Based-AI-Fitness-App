"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, RefreshCw, FolderPlus, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import CategoryModal from "./CategoryManagement/CategoryModal";
import Pagination from "./CategoryManagement/Pagination";
import { getAllCategories, addAndEditCategory, toggleCategoryStatus } from "@/services/admin/adminService";
import { useAllCategoryAdminQuery, useAllCategoryMutation, CategoryType } from "@/hooks/admin/useAllCategory";
import { useToaster } from "@/hooks/ui/useToaster";

const ITEMS_PER_PAGE = 5;
const DEBOUNCE_DELAY = 300;

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { successToast, errorToast } = useToaster();

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, DEBOUNCE_DELAY);
    handler();
    return () => handler.cancel();
  }, [searchQuery]);

  const { data, isLoading, isFetching, refetch } = useAllCategoryAdminQuery(
    getAllCategories,
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearch
  );

  const { mutate: categoryMutation, isPending } = useAllCategoryMutation(
    addAndEditCategory,
    toggleCategoryStatus
  );

  const categories = data?.categories || [];
  const totalPages = data?.totalPages || 1;

  const handleSaveCategory = useCallback(
      (name: string, description: string, metValue: number) => {
      if (isPending) return;
      console.log("Saving category:", { name, description,metValue, editMode });
      const categoryData = {
        id: editMode && currentCategory ? currentCategory._id : undefined,
        name,
        metValue,
        description,
        action: editMode ? ("edit" as const) : ("add" as const),
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      };
      categoryMutation(categoryData, {
        onSuccess: () => {
          setIsModalOpen(false);
          successToast(`Category successfully ${editMode ? "updated" : "created"}`);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || `Failed to ${editMode ? "update" : "create"} category`;
          errorToast(errorMessage);
        },
      });
    },
    [categoryMutation, editMode, currentCategory, isPending, successToast, errorToast, currentPage, debouncedSearch]
  );

  const handleToggleStatus = useCallback(
  (categoryId: string, currentStatus: boolean) => {
    if (isPending) return;
    const category = categories.find((cat) => cat._id === categoryId); // Find the category
    if (!category) return; // Optional: Handle case where category is not found
    console.log("Toggling status:", { categoryId, newStatus: !currentStatus });
    categoryMutation(
      {
        id: categoryId,
        status: !currentStatus,
        action: "toggle" as const,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        metValue: category.metValue, 
      },
      {
        onSuccess: () => {
          successToast(`Category ${currentStatus ? "deactivated" : "activated"} successfully`);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            `Failed to ${currentStatus ? "deactivate" : "activate"} category`;
          errorToast(errorMessage);
        },
      }
    );
  },
  [categoryMutation, isPending, successToast, errorToast, currentPage, debouncedSearch, categories] // Add categories to dependencies
);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryType) => {
    setEditMode(true);
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 pt-24 w-full min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 w-full bg-white shadow-lg rounded-2xl border border-purple-50 p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl shadow-sm">
              <FolderPlus className="h-7 w-7 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">Category Management</h1>
            <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
              {data?.totalCategory || 0} total
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleOpenAddModal}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isPending}
            >
              <FolderPlus className="mr-2 h-5 w-5" />
              Add Category
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 border-purple-200 focus-visible:ring-purple-500"
            disabled={isPending}
          />
          {isFetching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            </span>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
              disabled={isPending}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        <Card className="border-purple-100">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-purple-50">
                <TableRow>
                  <TableHead className="text-purple-700">#</TableHead>
                  <TableHead className="text-purple-700">Name</TableHead>
                  <TableHead className="text-purple-700">MET</TableHead>
                  <TableHead className="text-purple-700">Description</TableHead>
                  <TableHead className="text-purple-700">Status</TableHead>
                  <TableHead className="text-right text-purple-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FolderPlus className="h-16 w-16 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">
                          {searchQuery ? `No categories found for "${searchQuery}"` : "No categories found"}
                        </p>
                        <p className="text-sm">
                          {searchQuery ? "Try a different search term or add a new category" : "Add a new category to get started"}
                        </p>
                        <Button
                          onClick={handleOpenAddModal}
                          className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
                          disabled={isPending}
                        >
                          <FolderPlus className="mr-2 h-4 w-4" />
                          Add Category
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {categories.map((category, index) => (
                      <motion.tr
                        key={category._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                        <TableCell className="font-medium">{category.title}</TableCell>
                        <TableCell className="font-medium">{category.metValue}</TableCell>
                        <TableCell>{category.description || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={category.status ? "default" : "outline"}
                            className={category.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                          >
                            {category.status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditModal(category)}
                              disabled={isPending}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(category._id, category.status)}
                              disabled={isPending}
                              className={
                                category.status
                                  ? "border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                  : "border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                              }
                            >
                              {category.status ? (
                                <XCircle className="mr-2 h-4 w-4" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {category.status ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        
          />
        )}

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
          editMode={editMode}
          initialValues={
            currentCategory
              ? { name: currentCategory.title,metValue:currentCategory.metValue, description: currentCategory.description || "" }
              : undefined
          }
    
        />
      </motion.div>
    </div>
  );
}