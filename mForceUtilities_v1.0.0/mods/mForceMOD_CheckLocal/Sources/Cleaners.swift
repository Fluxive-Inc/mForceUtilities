import Foundation

class SystemCleaner: ObservableObject {
    @Published var lastCleaned: Date? = nil
    
    func cleanUserLogs() {
        let fileManager = FileManager.default
        let home = fileManager.homeDirectoryForCurrentUser.path
        
        let pathsToClean = [
            home + "/Library/Logs",
            home + "/Library/Caches"
        ]
        
        for path in pathsToClean {
            do {
                let contents = try fileManager.contentsOfDirectory(atPath: path)
                for item in contents {
                   let itemPath = path + "/" + item
                   try? fileManager.removeItem(atPath: itemPath)
                }
            } catch {
                print("Error cleaning \(path): \(error)")
            }
        }
        
        DispatchQueue.main.async {
            self.lastCleaned = Date()
        }
    }
}
