
"use client";

import { AttendanceDetailDialog } from "./AttendanceDetailDialog";

export function AttendanceTableDialogs({ detailRecord, handleClose, statusMap }) {
  return (
    <>
      {detailRecord && (
        <AttendanceDetailDialog
          record={detailRecord} 
          statusMap={statusMap}
          onOpenChange={(isOpen) => !isOpen && handleClose()}
        />
      )}
    </>
  );
}
