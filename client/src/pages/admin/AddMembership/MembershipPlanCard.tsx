import React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IMembershipPlanEntity } from "@/types/membership";
import { 
  CalendarClock, 
  DollarSign, 
  PencilIcon, 
  Trash2, 
  ClockIcon, 
  CheckCircle, 
  XCircle, 
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface MembershipPlanCardProps {
  plan: IMembershipPlanEntity;
  onEdit: (plan: IMembershipPlanEntity) => void;
  onDelete: (plan: IMembershipPlanEntity) => void;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({ plan, onEdit, onDelete }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(plan.price);

  const formattedUpdatedAt = plan.updatedAt 
    ? formatDistanceToNow(new Date(plan.updatedAt), { addSuffix: true })
    : "N/A";
    
  // Get gradient intensity based on price
  const getGradientIntensity = () => {
    if (plan.price >= 100) {
      return "from-violet-100 to-rose-50 dark:from-violet-900/30 dark:to-rose-900/20";
    } else if (plan.price >= 50) {
      return "from-violet-50 to-rose-50 dark:from-violet-900/20 dark:to-rose-900/10";
    } else {
      return "from-violet-50/70 to-rose-50/70 dark:from-violet-900/10 dark:to-rose-900/5";
    }
  };

  // Get accent color based on plan status
  const getAccentColor = () => {
    return plan.isActive
      ? "text-violet-600 dark:text-violet-400"
      : "text-rose-600 dark:text-rose-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className={`transition-all duration-300 hover:shadow-lg overflow-hidden h-full border-t-4 ${
        plan.isActive 
          ? "border-t-violet-500 dark:border-t-violet-600" 
          : "border-t-rose-400 dark:border-t-rose-500"
      } bg-gradient-to-br ${getGradientIntensity()}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
          {plan.price >= 100 && (
            <div className="absolute -top-1 -right-1 rotate-12 text-yellow-500">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Badge className={`
              ${plan.isActive 
                ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" 
                : "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"} 
              text-white font-medium`}>
              {plan.isActive ? (
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-violet-100 dark:hover:bg-violet-900/20" 
              onClick={() => onEdit(plan)}
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-rose-500 hover:text-white hover:bg-rose-500" 
              onClick={() => onDelete(plan)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <h3 className="text-xl font-bold mb-3 tracking-tight">{plan.name}</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`rounded-full p-2 ${plan.isActive ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"} mr-3`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <span className={`text-xl font-bold ${getAccentColor()}`}>{formattedPrice}</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`rounded-full p-2 ${plan.isActive ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"} mr-3`}>
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <span className="font-medium">
                  {plan.durationMonths === 1 
                    ? "1 month" 
                    : `${plan.durationMonths} months`
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground flex items-center pt-2 border-t border-violet-100/50 dark:border-violet-800/20 mt-2">
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>Updated {formattedUpdatedAt}</span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MembershipPlanCard;