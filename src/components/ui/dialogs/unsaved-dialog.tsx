import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { Button } from "../button";
import { FC, useCallback } from "react";

interface UnsavedDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const UnsavedDialog: FC<UnsavedDialogProps> = ({
  open,
  setOpen,
  onCancel,
  onConfirm,
}) => {
  const handleOnCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }

    setOpen(false);
  }, [onCancel, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogDescription>
            This project has unsaved changes. Do you want to discard them and
            exit?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleOnCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Discard and Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedDialog;
