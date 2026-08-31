import SwiftUI

struct ContentView: View {
    @StateObject var scanner = SystemScanner()
    @StateObject var networkScanner = NetworkScanner()
    @StateObject var cleaner = SystemCleaner()
    @State private var selectedTab = "Files"
    
    var body: some View {
        HStack(spacing: 0) {
            // Sidebar
            VStack(alignment: .leading, spacing: 20) {
                Text("fxSpy")
                    .font(.system(size: 24, weight: .bold, design: .monospaced))
                    .foregroundColor(.textPrimary)
                    .padding(.top, 30)
                    .padding(.horizontal)
                
                Divider().background(Color.white.opacity(0.1))
                
                SidebarButton(title: "System Audit", icon: "doc.text.magnifyingglass", isSelected: selectedTab == "Files") {
                    selectedTab = "Files"
                }
                
                SidebarButton(title: "Network Monitor", icon: "network", isSelected: selectedTab == "Network") {
                    selectedTab = "Network"
                }
                
                SidebarButton(title: "Sanitize", icon: "trash", isSelected: selectedTab == "Clean") {
                    selectedTab = "Clean"
                }
                
                Spacer()
                
                Text("Agent Active")
                    .font(.caption)
                    .foregroundColor(.accentSafe)
                    .padding()
            }
            .frame(width: 200)
            .background(Color.deepBackground)
            
            // Main Content Area
            ZStack {
                Color.panelBackground.edgesIgnoringSafeArea(.all)
                
                if selectedTab == "Files" {
                    FilesView(scanner: scanner)
                } else if selectedTab == "Network" {
                    NetworkView(scanner: networkScanner)
                } else if selectedTab == "Clean" {
                    CleanerView(cleaner: cleaner)
                }
            }
        }
        .frame(minWidth: 800, minHeight: 600)
    }
}

// Subviews
struct FilesView: View {
    @ObservedObject var scanner: SystemScanner
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("System Transparency Audit")
                    .font(.title)
                    .bold()
                Spacer()
                Button(action: { scanner.scan() }) {
                    Label("Scan System", systemImage: "arrow.triangle.2.circlepath")
                }
                .buttonStyle(.plain)
                .padding(8)
                .background(Color.accentColor.opacity(0.2))
                .cornerRadius(8)
            }
            .padding()
            
            List(scanner.detectedItems) { item in
                HStack {
                    VStack(alignment: .leading) {
                        Text(item.name)
                            .font(.headline)
                            .foregroundColor(.white)
                        Text(item.path)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Text(item.type)
                        .font(.caption)
                        .padding(4)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(4)
                    
                    Button(action: { scanner.deleteItem(item) }) {
                        Image(systemName: "trash")
                            .foregroundColor(.accentDanger)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.vertical, 4)
            }
            .listStyle(.plain)
        }
    }
}

struct NetworkView: View {
    @ObservedObject var scanner: NetworkScanner
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Network Activity Monitor")
                    .font(.title)
                    .bold()
                Spacer()
                if scanner.isScanning {
                    ProgressView()
                        .scaleEffect(0.5)
                }
                Button(action: { scanner.scanNetwork() }) {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
                .buttonStyle(.plain)
                .padding(8)
                .background(Color.accentColor.opacity(0.2))
                .cornerRadius(8)
            }
            .padding()
            
            List(scanner.connections) { connection in
                HStack {
                    VStack(alignment: .leading) {
                        Text(connection.command)
                            .font(.headline)
                            .foregroundColor(.accentSafe)
                        Text(connection.remoteAddress)
                            .font(.system(.caption, design: .monospaced))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                }
                .padding(.vertical, 4)
            }
            .listStyle(.plain)
        }
    }
}

struct CleanerView: View {
    @ObservedObject var cleaner: SystemCleaner
    
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: "trash.circle.fill")
                .resizable()
                .frame(width: 80, height: 80)
                .foregroundColor(.gray)
            
            Text("Sanitize User Data")
                .font(.title)
            
            Text("This will remove local user logs and caches. System logs utilize SIP and cannot be fully removed by user-mode applications.")
                .multilineTextAlignment(.center)
                .foregroundColor(.gray)
                .padding(.horizontal, 40)
            
            Button(action: { cleaner.cleanUserLogs() }) {
                Text("Clean Logs & Caches")
                    .font(.headline)
                    .padding()
                    .frame(width: 200)
                    .background(Color.accentDanger)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
            
            if let last = cleaner.lastCleaned {
                Text("Last cleaned: \(last.formatted())")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct SidebarButton: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .frame(width: 20)
                Text(title)
                Spacer()
            }
            .padding()
            .background(isSelected ? Color.white.opacity(0.1) : Color.clear)
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
        .padding(.horizontal)
    }
}
