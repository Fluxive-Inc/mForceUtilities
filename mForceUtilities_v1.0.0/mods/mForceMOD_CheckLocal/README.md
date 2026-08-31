# fxSpy - Local Agent

A macOS "System Transparency Auditor" designed to scan for potential tracking software, monitor network connections, and sanitize user logs.

## 🛠 Setup & Installation

Since this project requires specific entitlements that can't be auto-generated in a single script without an Xcode project file, please follow these steps:

1.  **Open Xcode**: Create a new Project.
    *   Template: **macOS App**
    *   Product Name: **fxSpy**
    *   Interface: **SwiftUI**
    *   Language: **Swift**

2.  **Add Source Files**:
    *   In Finder, navigate to where you generated these files (or copy them).
    *   Drag the **contents** of the `Sources` folder into your Xcode project navigator (the left sidebar).
    *   Make sure "Copy items if needed" is checked.
    *   Delete the default `ContentView.swift` and `fxSpyApp.swift` created by Xcode, as you are replacing them with ours.

3.  **Configure Permissions**:
    *   Click on the **Project** icon in the top left of Xcode.
    *   Select the **Target** (fxSpy).
    *   Go to **Signing & Capabilities**.
    *   **REMOVE "App Sandbox"**: Click the 'x' button next to "App Sandbox". This is required to scan `/Library` and run `lsof`.

4.  **Run the App**:
    *   Press `Cmd + R` to build and run.
    *   **Grant Access**: When scanning, if prompted, you may need to grant Full Disk Access.
    *   *Note*: For full functionality, you should add the built app to **System Settings > Privacy & Security > Full Disk Access**.

## 🚀 Features

*   **System Audit**: Scans `LaunchAgents` and `LaunchDaemons` for persistent software.
*   **Network Monitor**: Uses `lsof` to show active outgoing network connections.
*   **Sanitize**: ONE-CLICK cleaning of user logs and caches.

## ⚠️ Disclaimer

This tool is for educational and self-audit purposes. Deleting system files can cause instability. Always verify a file before deleting it.
