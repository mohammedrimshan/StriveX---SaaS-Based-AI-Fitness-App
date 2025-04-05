// ImageEditor.tsx
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Crop, 
  Filter as FilterIcon, 
  Check,
  ArrowLeft, 
  RefreshCw 
} from "lucide-react";
import ImageCropper from "./ImageCropper";
import FilterPreview from "./FilterPreview";
import { 
  filters, 
  aspectRatios, 
  AspectRatioType,
  FilterType
} from "@/hooks/ui/imageFilter";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  image: string;
  onSubmit: (image: string | null) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSubmit }) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioType>(aspectRatios[0]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(filters[0]);
  const [activeTab, setActiveTab] = useState("crop");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
  }, []);

  const applyFilter = useCallback((filter: FilterType) => {
    setSelectedFilter(filter);
    
    if (!croppedImage) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.filter = filter.filter;
      ctx.drawImage(img, 0, 0);
      
      const filteredDataUrl = canvas.toDataURL('image/jpeg');
      setFilteredImage(filteredDataUrl);
    };
    
    img.src = croppedImage;
  }, [croppedImage]);

  const handleNext = () => {
    if (activeTab === "crop" && croppedImage) {
      setActiveTab("filter");
      applyFilter(selectedFilter);
    }
  };

  const handleSubmit = () => {
    const finalImage = filteredImage || croppedImage || image;
    if (!finalImage) return;

    setIsProcessing(true);
    try {
      onSubmit(finalImage);
      toast.success("Image submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCroppedImage(null);
    setFilteredImage(null);
    setSelectedAspectRatio(aspectRatios[0]);
    setSelectedFilter(filters[0]);
    setActiveTab("crop");
  };

  const handleCancel = () => {
    onSubmit(null);
  };

  return (
    <div className="py-2 px-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft size={14} />
            <span>Cancel</span>
          </Button>
          <h1 className="text-lg font-bold">Edit Profile Image</h1>
          <div className="w-[60px]"></div>
        </div>

        <Card className="rounded-lg border overflow-hidden shadow-md">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b bg-transparent px-3 py-1">
              <TabsTrigger 
                value="crop" 
                className={cn("data-[state=active]:text-primary rounded-md transition-all duration-300 text-sm")}
              >
                <Crop size={14} className="mr-1" />
                Crop
              </TabsTrigger>
              <TabsTrigger 
                value="filter" 
                disabled={!croppedImage}
                className={cn("data-[state=active]:text-primary rounded-md transition-all duration-300 text-sm")}
              >
                <FilterIcon size={14} className="mr-1" />
                Filter
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-3">
              <TabsContent value="crop" className="mt-0">
                <div>
                  <div className="flex flex-wrap gap-1 mb-3 justify-center">
                    {aspectRatios.map((ratio) => (
                      <Button
                        key={ratio.id}
                        variant={selectedAspectRatio.id === ratio.id ? "default" : "outline"}
                        onClick={() => setSelectedAspectRatio(ratio)}
                        className={cn(
                          "rounded-full text-xs px-2 py-0.5",
                          selectedAspectRatio.id === ratio.id 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-700"
                        )}
                      >
                        {ratio.name}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 border rounded-lg overflow-hidden bg-gray-50 max-h-[40vh]">
                    <ImageCropper
                      image={image}
                      aspectRatio={selectedAspectRatio}
                      onCropComplete={handleCropComplete}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filter" className="mt-0">
                {croppedImage && (
                  <div>
                    <div className="mb-3 flex justify-center">
                      <div className="w-full max-w-sm max-h-[40vh] rounded-lg overflow-hidden border">
                        <img 
                          src={filteredImage || croppedImage} 
                          alt="Preview" 
                          className="w-full h-auto max-h-[40vh] object-contain"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Select a Filter</h3>
                      <div className="flex overflow-x-auto pb-3 gap-2">
                        {filters.map((filter) => (
                          <FilterPreview
                            key={filter.id}
                            filter={filter}
                            image={croppedImage}
                            isSelected={selectedFilter.id === filter.id}
                            onClick={() => applyFilter(filter)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-between p-3 border-t bg-gray-50/50">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-1 text-xs"
              >
                <RefreshCw size={12} />
                <span>Reset</span>
              </Button>
              
              <div className="flex gap-2">
                {activeTab === "crop" && (
                  <Button 
                    onClick={handleNext}
                    disabled={!croppedImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                  >
                    Next: Filters
                  </Button>
                )}
                
                {(activeTab === "filter" || (activeTab === "crop" && croppedImage)) && (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-xs px-3 py-1"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={12} />
                        <span>Submit</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ImageEditor;