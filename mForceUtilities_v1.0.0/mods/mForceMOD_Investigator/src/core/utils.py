import subprocess
import sys

def select_folder_native():
    """
    Opens a native macOS folder selection dialog and returns the absolute path.
    Returns None if cancelled or not on macOS.
    """
    if sys.platform != "darwin":
        return None
        
    try:
        # AppleScript to prompt for folder and get POSIX path
        script = 'POSIX path of (choose folder with prompt "Select Investigation Source Folder")'
        cmd = ['osascript', '-e', script]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            path = result.stdout.strip()
            return path
    except Exception as e:
        print(f"Error opening dialog: {e}")
        return None
        
    return None
