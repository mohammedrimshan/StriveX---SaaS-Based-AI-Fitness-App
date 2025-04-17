// src/contexts/MembershipPlanContext.tsx
import React, { createContext, useContext, useState } from "react";
import { useMembershipPlans as useApiMembershipPlans } from "@/hooks/admin/useMembershipPlans";
import { useToaster } from "@/hooks/ui/useToaster";
import { IMembershipPlanEntity } from "@/types/membership";

interface MembershipPlanContextType {
  plans: IMembershipPlanEntity[];
  loading: boolean;
  error: Error | null;
  createPlan: (plan: Omit<IMembershipPlanEntity, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updatePlan: (id: string, plan: Partial<IMembershipPlanEntity>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  refreshPlans: () => void;
}

const MembershipPlanContext = createContext<MembershipPlanContextType | undefined>(undefined);

export const MembershipPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { successToast, errorToast } = useToaster();
  
  const {
    plans,
    isLoading: loading,
    isError,
    error,
    addPlan,
    updatePlan: apiUpdatePlan,
    deletePlan: apiDeletePlan,
  } = useApiMembershipPlans({
    search: searchTerm,
    limit: 100, // Adjust based on your requirements
  });

  const refreshPlans = () => {
    // Forcing a refresh by temporarily changing the search term
    setSearchTerm(" ");
    setTimeout(() => setSearchTerm(""), 10);
    successToast("Membership plans refreshed");
  };

  const createPlan = async (planData: Omit<IMembershipPlanEntity, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await addPlan({
        name: planData.name,
        durationMonths: planData.durationMonths,
        price: planData.price,
        isActive: planData.isActive, 
      });
      
      if (response.success) {
        successToast("Membership plan created successfully");
        return true;
      } else {
        errorToast("Failed to create membership plan");
        return false;
      }
    } catch (error) {
      errorToast(error instanceof Error ? error.message : "An error occurred while creating the plan");
      return false;
    }
  };

  const updatePlan = async (id: string, planData: Partial<IMembershipPlanEntity>) => {
    try {
      const response = await apiUpdatePlan(id, {
        name: planData.name,
        durationMonths: planData.durationMonths,
        price: planData.price,
        isActive: planData.isActive,
      });

      if (response.success) {
        successToast("Membership plan updated successfully");
        return true;
      } else {
        errorToast("Failed to update membership plan");
        return false;
      }
    } catch (error) {
      errorToast(error instanceof Error ? error.message : "An error occurred while updating the plan");
      return false;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const response = await apiDeletePlan(id);
      
      if (response.success) {
        successToast("Membership plan deleted successfully");
        return true;
      } else {
        errorToast("Failed to delete membership plan");
        return false;
      }
    } catch (error) {
      errorToast(error instanceof Error ? error.message : "An error occurred while deleting the plan");
      return false;
    }
  };

  // Map API types to our component interface
  const mappedPlans: IMembershipPlanEntity[] = plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    durationMonths: plan.durationMonths,
    price: plan.price,
    isActive: plan.isActive,
    createdAt: plan.createdAt ? new Date(plan.createdAt) : undefined,
    updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
  }));

  return (
    <MembershipPlanContext.Provider
      value={{
        plans: mappedPlans,
        loading,
        error: isError ? error : null,
        createPlan,
        updatePlan,
        deletePlan,
        refreshPlans,
      }}
    >
      {children}
    </MembershipPlanContext.Provider>
  );
};

export const useMembershipPlans = (): MembershipPlanContextType => {
  const context = useContext(MembershipPlanContext);
  if (context === undefined) {
    throw new Error("useMembershipPlans must be used within a MembershipPlanProvider");
  }
  return context;
};