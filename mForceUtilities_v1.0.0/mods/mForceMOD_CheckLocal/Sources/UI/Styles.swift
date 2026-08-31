import SwiftUI

extension Color {
    static let deepBackground = Color(red: 0.05, green: 0.05, blue: 0.1)
    static let panelBackground = Color(red: 0.1, green: 0.1, blue: 0.15)
    static let accentDanger = Color(red: 1.0, green: 0.3, blue: 0.3)
    static let accentSafe = Color(red: 0.3, green: 0.9, blue: 0.5)
    static let textPrimary = Color.white
    static let textSecondary = Color.gray
}

struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(VisualEffectBlur(material: .hudWindow, blendingMode: .behindWindow))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
    }
}

// Helper for vibrancy
struct VisualEffectBlur: NSViewRepresentable {
    var material: NSVisualEffectView.Material
    var blendingMode: NSVisualEffectView.BlendingMode

    func makeNSView(context: Context) -> NSVisualEffectView {
        let visualEffectView = NSVisualEffectView()
        visualEffectView.material = material
        visualEffectView.blendingMode = blendingMode
        visualEffectView.state = .active
        return visualEffectView
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
        nsView.blendingMode = blendingMode
    }
}
