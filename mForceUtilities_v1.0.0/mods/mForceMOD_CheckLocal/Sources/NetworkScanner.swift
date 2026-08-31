import Foundation

struct NetworkConnection: Identifiable, Hashable {
    let id = UUID()
    let rawOutput: String
    let command: String
    let remoteAddress: String
}

class NetworkScanner: ObservableObject {
    @Published var connections: [NetworkConnection] = []
    @Published var isScanning = false
    
    func scanNetwork() {
        isScanning = true
        DispatchQueue.global(qos: .userInitiated).async {
            let output = self.runLsof()
            let parsed = self.parseLsof(output)
            
            DispatchQueue.main.async {
                self.connections = parsed
                self.isScanning = false
            }
        }
    }
    
    private func runLsof() -> String {
        let task = Process()
        task.launchPath = "/usr/sbin/lsof"
        // -i: internet files, -n: no host names (faster), -P: no port names (faster)
        task.arguments = ["-i", "-n", "-P"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        
        do {
            try task.run()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            return String(data: data, encoding: .utf8) ?? ""
        } catch {
            print("Failed to run lsof: \(error)")
            return ""
        }
    }
    
    private func parseLsof(_ output: String) -> [NetworkConnection] {
        var results: [NetworkConnection] = []
        let lines = output.components(separatedBy: .newlines)
        
        // Skip header line if present
        let contentLines = lines.dropFirst()
        
        for line in contentLines {
            let parts = line.split(separator: " ", omittingEmptySubsequences: true)
            if parts.count >= 8 {
                // Typical lsof output: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
                // We want COMMAND and NAME (last part usually contains IP)
                let command = String(parts[0])
                let name = String(parts.last ?? "")
                
                if name.contains("->") {
                    // Extract remote address "local->remote"
                    let addresses = name.components(separatedBy: "->")
                    if addresses.count > 1 {
                        let remote = addresses[1]
                        results.append(NetworkConnection(
                            rawOutput: line,
                            command: command,
                            remoteAddress: remote
                        ))
                    }
                }
            }
        }
        
        return results
    }
}
