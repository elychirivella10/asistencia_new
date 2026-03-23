"""
db package - Facade that re-exports a unified DBRepository class.

All callers (live_monitor.py, summarizer.py, run.py, etc.) continue to use
`from db_repository import DBRepository` unchanged, since db_repository.py
now imports and re-exports from here.

Internal structure:
  - user_repo.py        : user lookups, create_user
  - attendance_repo.py  : raw punches and comedor sync
  - summary_repo.py     : daily summaries and novelty queries
  - notification_repo.py: late arrival logic and notification logging
"""

from .user_repo import UserRepo
from .attendance_repo import AttendanceRepo
from .summary_repo import SummaryRepo
from .notification_repo import NotificationRepo


class DBRepository(UserRepo, AttendanceRepo, SummaryRepo, NotificationRepo):
    """
    Unified repository that composes all domain-specific repos.
    Uses multiple inheritance so every method is available as before.
    """

    def __init__(self, db_url):
        self.db_url = db_url

    # --- Compatibility shims for methods that changed signatures internally ---

    def sync_attendance(self, attendances, device_id):
        """Wraps AttendanceRepo.sync_attendance resolving user_map automatically."""
        user_map = self.get_users_map_by_biometric_id()
        return AttendanceRepo.sync_attendance(self, attendances, device_id, user_map)

    def sync_comedor_attendance(self, attendances, device_id):
        """Wraps AttendanceRepo.sync_comedor_attendance resolving user_map automatically."""
        user_map = self.get_users_map_by_biometric_id()
        return AttendanceRepo.sync_comedor_attendance(self, attendances, device_id, user_map)


__all__ = ["DBRepository"]
