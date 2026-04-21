# Compatibility shim: DBRepository now lives in the db/ package.
# All existing callers (live_monitor.py, summarizer.py, run.py, etc.) continue to work unchanged.
from db import DBRepository  # noqa: F401
