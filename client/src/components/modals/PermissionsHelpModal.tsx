import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface PermissionsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsHelpModal: React.FC<PermissionsHelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>How to Enable Camera and Microphone</AlertDialogTitle>
          <AlertDialogDescription>
            <p>To join the video call, you need to allow camera and microphone access. Follow these steps:</p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Chrome:</strong> Click the lock icon in the address bar, select "Site settings," and set Camera and Microphone to "Allow."</li>
              <li><strong>Firefox:</strong> Click the camera or shield icon in the address bar and clear blocked permissions.</li>
              <li><strong>Safari:</strong> Go to Safari Settings for This Website and set Camera and Microphone to "Allow."</li>
              <li>Refresh the page after updating permissions.</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};