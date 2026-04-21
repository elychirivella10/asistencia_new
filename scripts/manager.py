import os
import sys
import subprocess
import argparse
import logging
from datetime import datetime

# Root directory of the project
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_LOGS = os.path.join(ROOT_DIR, "outputs", "logs")

if not os.path.exists(OUTPUT_LOGS):
    os.makedirs(OUTPUT_LOGS)

def setup_logger(name):
    """Sets up a logger that writes to both console and a file in outputs/logs/."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # Console Handler
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    
    # File Handler
    log_file = os.path.join(OUTPUT_LOGS, f"{name}_{datetime.now().strftime('%Y%m%d')}.log")
    fh = logging.FileHandler(log_file)
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    
    return logger

def run_script(script_path, args=[]):
    """Executes a python script as a subprocess to avoid import/namespace conflicts."""
    full_path = os.path.join(ROOT_DIR, script_path)
    cmd = [sys.executable, full_path] + args
    print(f"\n[EXECUTING] {' '.join(cmd)}\n")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Script failed with exit code {e.returncode}")
        sys.exit(e.returncode)

def main():
    parser = argparse.ArgumentParser(description="Central Management CLI for Biometric & Personnel System")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Personnel Sync
    p_sync = subparsers.add_parser("sync-personnel", help="Sync personnel from ODS file to Database")
    p_sync.add_argument("--apply", action="store_true", help="Apply changes permanently (default is dry-run)")

    # Area Comparison
    subparsers.add_parser("check-areas", help="Compare Excel locations with DB areas")

    # Personnel Comparison (Legacy Audit)
    subparsers.add_parser("audit-personnel", help="Audit differences between Excel and DB IDs")

    # Clock Sync
    subparsers.add_parser("sync-attendance", help="Sync attendance from Biometric Clocks to Database")
    
    # Clock Monitor (Real-time)
    subparsers.add_parser("monitor-live", help="Start real-time biometric monitor (used by PM2)")

    # Summarizer
    subparsers.add_parser("summarize", help="Run daily attendance summarizer")

    args = parser.parse_args()

    if args.command == "sync-personnel":
        sync_args = ["--apply"] if args.apply else []
        run_script("scripts/personnel/sincronizar_personal.py", sync_args)
    
    elif args.command == "check-areas":
        run_script("scripts/personnel/comparar_ubicaciones.py")
        
    elif args.command == "audit-personnel":
        run_script("scripts/personnel/comparar_personal.py")
        
    elif args.command == "sync-attendance":
        run_script("scripts/clocks/run.py")
        
    elif args.command == "monitor-live":
        run_script("scripts/clocks/live_monitor.py")
        
    elif args.command == "summarize":
        run_script("scripts/clocks/summarizer.py")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
