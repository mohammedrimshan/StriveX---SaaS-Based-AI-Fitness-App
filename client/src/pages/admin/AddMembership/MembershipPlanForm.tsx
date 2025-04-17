import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { IMembershipPlanEntity } from "@/types/membership";
import { useMembershipPlans } from "./MembershipPlanContext";
import { CalendarClock, DollarSign, Tag, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  durationMonths: z.coerce.number().int().positive({ message: "Duration must be a positive number." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }).multipleOf(0.01, { message: "Price must have at most 2 decimal places." }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface MembershipPlanFormProps {
  plan?: IMembershipPlanEntity;
  isOpen: boolean;
  onClose: () => void;
}

const MembershipPlanForm: React.FC<MembershipPlanFormProps> = ({ plan, isOpen, onClose }) => {
    console.log(plan)
  const { createPlan, updatePlan } = useMembershipPlans();
  const isEditing = !!plan;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || "",
      durationMonths: plan?.durationMonths || 1,
      price: plan?.price || 9.99,
      isActive: plan?.isActive ?? true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    let success;
    
    if (isEditing && plan?.id) {
      success = await updatePlan(plan.id, data);
    } else {
      success = await createPlan(data);
    }
    
    if (success) {
      form.reset();
      onClose();
    }
  };


  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        durationMonths: plan.durationMonths,
        price: plan.price,
        isActive: plan.isActive ?? true,
      });
    }
  }, [plan, form.reset]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <div className="bg-primary/10 p-2 rounded-full">
              {isEditing ? 
                <Tag className="h-6 w-6 text-primary" /> : 
                <DollarSign className="h-6 w-6 text-primary" />
              }
            </div>
            <span>{isEditing ? "Edit Membership Plan" : "Add New Membership Plan"}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Plan Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Premium Plan" {...field} className="transition-all duration-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Duration (Months)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="e.g. 12" 
                        {...field} 
                        className="transition-all duration-200" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="e.g. 99.99" 
                          {...field} 
                          className="pl-9 transition-all duration-200" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Active Status
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this plan available to customers
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="transition-all duration-200 hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-purple-700 hover:opacity-90 transition-all duration-200"
              >
                {isEditing ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipPlanForm;
