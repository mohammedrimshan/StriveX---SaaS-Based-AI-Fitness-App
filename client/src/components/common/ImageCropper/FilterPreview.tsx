
import React from "react";
import { FilterType } from "@/hooks/ui/imageFilter";
interface FilterPreviewProps {
  filter: FilterType;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({
  filter,
  image,
  isSelected,
  onClick,
}) => {
  return (
    <div 
      className={`filter-preview cursor-pointer flex flex-col items-center p-2 
        ${isSelected ? 'ring-2 ring-primary bg-blue-50 rounded-lg' : 'hover:bg-gray-50 rounded-lg'}`}
      onClick={onClick}
    >
      <div className="w-20 h-20 relative mb-2 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={filter.name}
          className="w-full h-full object-cover"
          style={{ filter: filter.filter }}
        />
      </div>
      <span className="text-xs font-medium">{filter.name}</span>
    </div>
  );
};

export default FilterPreview;
