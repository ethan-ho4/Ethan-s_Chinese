import SwiftUI
import WidgetKit

enum WidgetColors {
  static let surface = Color(red: 238 / 255, green: 232 / 255, blue: 204 / 255)
  static let koiOrange = Color(red: 217 / 255, green: 107 / 255, blue: 43 / 255)
  static let lotusGreen = Color(red: 126 / 255, green: 159 / 255, blue: 61 / 255)
  static let textOnLight = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255)
  static let textMuted = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255, opacity: 0.62)
  static let rippleAqua = Color(red: 127 / 255, green: 199 / 255, blue: 194 / 255)
  static let lotusGold = Color(red: 216 / 255, green: 182 / 255, blue: 90 / 255)
  static let mistyIvory = Color(red: 243 / 255, green: 233 / 255, blue: 210 / 255)
  static let inkBlack = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255)
  static let mandarinGlow = Color(red: 232 / 255, green: 176 / 255, blue: 93 / 255, opacity: 0.10)
  static let proverbGlow = Color(red: 126 / 255, green: 159 / 255, blue: 61 / 255, opacity: 0.12)
  static let waterLine = Color(red: 14 / 255, green: 90 / 255, blue: 96 / 255, opacity: 0.18)
}

enum WidgetGlowStyle {
  case mandarin
  case proverb
}

struct WidgetGlow: View {
  var style: WidgetGlowStyle

  private var glowColor: Color {
    style == .mandarin ? WidgetColors.mandarinGlow : WidgetColors.proverbGlow
  }

  var body: some View {
    GeometryReader { geo in
      Ellipse()
        .fill(glowColor)
        .frame(width: geo.size.width * 0.55, height: geo.size.height * 0.45)
        .offset(x: -geo.size.width * 0.12, y: geo.size.height * 0.55)
    }
    .allowsHitTesting(false)
  }
}

struct WidgetWaterLine: View {
  var body: some View {
    GeometryReader { geo in
      Ellipse()
        .stroke(WidgetColors.waterLine, lineWidth: 1)
        .frame(width: geo.size.width * 0.75, height: geo.size.height * 0.28)
        .rotationEffect(.degrees(-12))
        .offset(x: geo.size.width * 0.35, y: geo.size.height * 0.18)
    }
    .allowsHitTesting(false)
  }
}

struct WidgetCard<Content: View>: View {
  @Environment(\.widgetFamily) private var family
  var glowStyle: WidgetGlowStyle
  var pondVariant: PondDecorationVariant
  let content: Content

  init(glowStyle: WidgetGlowStyle, pondVariant: PondDecorationVariant, @ViewBuilder content: () -> Content) {
    self.glowStyle = glowStyle
    self.pondVariant = pondVariant
    self.content = content()
  }

  private var isSmall: Bool {
    family == .systemSmall
  }

  private var contentPadding: CGFloat {
    isSmall ? 10 : 12
  }

  private var textHeightRatio: CGFloat {
    switch family {
    case .systemSmall: return 0.58
    case .systemMedium: return 0.72
    default: return 0.78
    }
  }

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .topLeading) {
        WidgetGlow(style: glowStyle)
        WidgetWaterLine()
        WidgetPondDepth(compact: isSmall, variant: pondVariant)

        content
          .padding(contentPadding)
          .frame(
            maxWidth: geo.size.width - contentPadding * 2,
            maxHeight: geo.size.height * textHeightRatio,
            alignment: .topLeading
          )
          .layoutPriority(1)
      }
    }
  }
}
