import React, { useState } from "react";
import { MembershipPlanProvider, useMembershipPlans } from "./MembershipPlanContext";
import MembershipPlanForm from "./MembershipPlanForm";
import MembershipPlanCard from "./MembershipPlanCard";
import DeletePlanDialog from "./DeletePlanDialog";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMembershipPlanEntity } from "@/types/membership";
import { PlusCircle, Search, BadgeDollarSign } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Main component that will be wrapped with the provider
const MembershipPlanManagement: React.FC = () => {
  const { plans, loading } = useMembershipPlans();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IMembershipPlanEntity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (plan: IMembershipPlanEntity) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  const handleDelete = (plan: IMembershipPlanEntity) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedPlan(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 animate-fade-in">
      {/* Toast container */}
      <Toaster position="top-right" />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-primary to-purple-700 hover:opacity-90 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Plan
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index} 
              className="h-[200px] rounded-lg animate-pulse bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => (
            <MembershipPlanCard 
              key={plan.id} 
              plan={plan} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <div className="flex justify-center mb-3">
            <BadgeDollarSign className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No membership plans found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search term" : "Get started by creating your first membership plan"}
          </p>
          {!search && (
            <Button 
              onClick={handleAddNew}
              className="bg-gradient-to-r from-primary to-purple-700 hover:opacity-90 transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          )}
        </div>
      )}

      <MembershipPlanForm 
        plan={selectedPlan || undefined} 
        isOpen={formOpen} 
        onClose={handleCloseForm} 
      />
      
      <DeletePlanDialog 
        plan={selectedPlan} 
        isOpen={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog} 
      />
    </div>
  );
};

// Wrapper component that provides the context
const MembershipPlans: React.FC = () => {
  return (
    <AnimatedBackground>
      <div className="container mx-auto py-12 pt-24 px-4">
        <AnimatedTitle 
          title="Membership Plans" 
          subtitle="Create and manage premium membership options with flexible pricing and durations" 
        />
        <MembershipPlanProvider>
          <MembershipPlanManagement />
        </MembershipPlanProvider>
      </div>
    </AnimatedBackground>
  );
};

export default MembershipPlans;