import Foundation
import Combine

struct SuspiciousItem: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let path: String
    let command: String
    let type: String
}

class SystemScanner: ObservableObject {
    @Published var detectedItems: [SuspiciousItem] = []
    
    private let searchPaths = [
        "/Library/LaunchDaemons",
        "/Library/LaunchAgents",
        FileManager.default.homeDirectoryForCurrentUser.path + "/Library/LaunchAgents"
    ]
    
    func scan() {
        var newItems: [SuspiciousItem] = []
        let fileManager = FileManager.default
        
        for path in searchPaths {
            // Check if directory exists first
            var isDir: ObjCBool = false
            guard fileManager.fileExists(atPath: path, isDirectory: &isDir), isDir.boolValue else {
                continue
            }
            
            do {
                let files = try fileManager.contentsOfDirectory(atPath: path)
                for file in files {
                    if file.hasPrefix("com.apple.") { continue }
                    if file.hasPrefix(".") { continue } // Skip hidden files
                    
                    let fullPath = path + "/" + file
                    
                    // Simple check: try initial read as dictionary
                    if let dict = NSDictionary(contentsOfFile: fullPath) {
                        let programArgs = dict["ProgramArguments"] as? [String]
                        let program = dict["Program"] as? String // Some use just "Program"
                        
                        var command = "Unknown"
                        if let args = programArgs {
                            command = args.joined(separator: " ")
                        } else if let prog = program {
                            command = prog
                        }
                        
                        let typeLabel: String
                        if path.contains("Daemon") {
                            typeLabel = "System (Root)"
                        } else if path.contains(FileManager.default.homeDirectoryForCurrentUser.path) {
                            typeLabel = "User"
                        } else {
                            typeLabel = "Global Agent"
                        }
                        
                        newItems.append(SuspiciousItem(
                            name: file,
                            path: fullPath,
                            command: command,
                            type: typeLabel
                        ))
                    }
                }
            } catch {
                print("Access denied or error reading: \(path). Error: \(error)")
            }
        }
        
        DispatchQueue.main.async {
            self.detectedItems = newItems.sorted { $0.name < $1.name }
        }
    }
    
    func deleteItem(_ item: SuspiciousItem) {
        do {
            try FileManager.default.removeItem(atPath: item.path)
            scan()
        } catch {
            print("Failed to delete: \(error)")
        }
    }
}
