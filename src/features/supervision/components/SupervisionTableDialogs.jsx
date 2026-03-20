import { SupervisionFormDialog } from "./SupervisionFormDialog";
import { SupervisionDeleteDialog } from "./SupervisionDeleteDialog";

export function SupervisionTableDialogs({
  open,
  onOpenChange,
  editingSupervision,
  deletingSupervision,
  setDeletingSupervision,
  handleSuccess
}) {
  return (
    <>
      <SupervisionFormDialog
        open={open}
        onOpenChange={onOpenChange}
        supervision={editingSupervision}
        onSuccess={handleSuccess}
      />

      <SupervisionDeleteDialog
        supervision={deletingSupervision}
        open={!!deletingSupervision}
        onOpenChange={(open) => !open && setDeletingSupervision(null)}
      />
    </>
  );
}
