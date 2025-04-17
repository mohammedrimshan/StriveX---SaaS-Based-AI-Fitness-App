
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IMembershipPlanEntity } from "@/types/membership";
import { useMembershipPlans } from "./MembershipPlanContext";

interface DeletePlanDialogProps {
  plan: IMembershipPlanEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({ plan, isOpen, onClose }) => {
  const { deletePlan } = useMembershipPlans();

  const handleDelete = async () => {
    if (plan?.id) {
      const success = await deletePlan(plan.id);
      if (success) {
        onClose();
      }
    }
  };

  if (!plan) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Membership Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{plan.name}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlanDialog;
