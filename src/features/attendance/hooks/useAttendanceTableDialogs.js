
import { useState } from "react";

export function useAttendanceTableDialogs() {
  const [detailRecord, setDetailRecord] = useState(null);

  const handleDetails = (record) => {
    setDetailRecord(record);
  };

  const handleClose = () => {
    setDetailRecord(null);
  };

  return {
    detailRecord,
    handleDetails,
    handleClose,
  };
}
