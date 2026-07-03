import SwiftUI

enum WidgetColors {
  static let surface = Color(red: 238 / 255, green: 232 / 255, blue: 204 / 255)
  static let koiOrange = Color(red: 217 / 255, green: 107 / 255, blue: 43 / 255)
  static let lotusGreen = Color(red: 126 / 255, green: 159 / 255, blue: 61 / 255)
  static let textOnLight = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255)
  static let textMuted = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255, opacity: 0.62)
  static let rippleAqua = Color(red: 127 / 255, green: 199 / 255, blue: 194 / 255)
  static let lotusGold = Color(red: 216 / 255, green: 182 / 255, blue: 90 / 255)
}

struct PondBackground: View {
  var compact: Bool = false

  var body: some View {
    ZStack {
      WidgetColors.surface

      Circle()
        .stroke(WidgetColors.rippleAqua.opacity(compact ? 0.28 : 0.34), lineWidth: compact ? 2 : 3)
        .frame(width: compact ? 120 : 180, height: compact ? 36 : 56)
        .offset(x: compact ? 42 : 58, y: compact ? 34 : 42)

      Circle()
        .stroke(WidgetColors.lotusGold.opacity(compact ? 0.2 : 0.26), lineWidth: 1.5)
        .frame(width: compact ? 150 : 220, height: compact ? 44 : 68)
        .offset(x: compact ? 28 : 40, y: compact ? 48 : 58)

      Ellipse()
        .fill(WidgetColors.koiOrange.opacity(compact ? 0.42 : 0.55))
        .frame(width: compact ? 34 : 48, height: compact ? 18 : 24)
        .offset(x: compact ? 52 : 72, y: compact ? 28 : 36)
    }
  }
}

struct WidgetCard<Content: View>: View {
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    ZStack {
      PondBackground()
      content
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
  }
}
