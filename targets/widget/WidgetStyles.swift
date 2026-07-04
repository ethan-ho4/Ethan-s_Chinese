import SwiftUI
import WidgetKit

enum WidgetColors {
  static let surface = Color(red: 238 / 255, green: 232 / 255, blue: 204 / 255)
  static let surfaceTop = Color(red: 245 / 255, green: 239 / 255, blue: 212 / 255)
  static let surfaceBottom = Color(red: 232 / 255, green: 224 / 255, blue: 200 / 255)
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
  static let vignetteGold = Color(red: 216 / 255, green: 182 / 255, blue: 90 / 255, opacity: 0.08)
  static let warmWhiteBorder = Color(red: 255 / 255, green: 248 / 255, blue: 234 / 255, opacity: 0.68)
}

enum WidgetGlowStyle {
  case mandarin
  case proverb
}

struct WidgetGlow: View {
  var style: WidgetGlowStyle
  var scale: CGFloat = 1.0

  private var glowColor: Color {
    style == .mandarin ? WidgetColors.mandarinGlow : WidgetColors.proverbGlow
  }

  var body: some View {
    GeometryReader { geo in
      Ellipse()
        .fill(glowColor)
        .frame(
          width: geo.size.width * 0.55 * scale,
          height: geo.size.height * 0.45 * scale
        )
        .offset(x: -geo.size.width * 0.12, y: geo.size.height * 0.55)
    }
    .allowsHitTesting(false)
  }
}

struct WidgetWaterLine: View {
  var rotation: Double = -12
  var xOffsetRatio: CGFloat = 0.35
  var yOffsetRatio: CGFloat = 0.18

  var body: some View {
    GeometryReader { geo in
      Ellipse()
        .stroke(WidgetColors.waterLine, lineWidth: 1)
        .frame(width: geo.size.width * 0.75, height: geo.size.height * 0.28)
        .rotationEffect(.degrees(rotation))
        .offset(x: geo.size.width * xOffsetRatio, y: geo.size.height * yOffsetRatio)
    }
    .allowsHitTesting(false)
  }
}

struct WidgetRichBackground: View {
  var body: some View {
    GeometryReader { geo in
      LinearGradient(
        colors: [WidgetColors.surfaceTop, WidgetColors.surfaceBottom],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )

      Ellipse()
        .fill(WidgetColors.vignetteGold)
        .frame(width: geo.size.width * 0.5, height: geo.size.height * 0.35)
        .offset(x: geo.size.width * 0.55, y: -geo.size.height * 0.08)

      Ellipse()
        .fill(WidgetColors.vignetteGold.opacity(0.6))
        .frame(width: geo.size.width * 0.4, height: geo.size.height * 0.28)
        .offset(x: -geo.size.width * 0.15, y: geo.size.height * 0.72)
    }
    .allowsHitTesting(false)
  }
}

struct WidgetCard<Content: View>: View {
  @Environment(\.widgetFamily) private var family
  var glowStyle: WidgetGlowStyle
  let content: Content

  init(glowStyle: WidgetGlowStyle, @ViewBuilder content: () -> Content) {
    self.glowStyle = glowStyle
    self.content = content()
  }

  private var isSmall: Bool {
    family == .systemSmall
  }

  private var isLarge: Bool {
    family == .systemLarge
  }

  private var decorationLevel: PondDecorationLevel {
    isSmall ? .compact : .rich
  }

  private var contentPadding: CGFloat {
    isSmall ? 10 : 12
  }

  private var textHeightRatio: CGFloat {
    isSmall ? 0.70 : 0.65
  }

  private var glowScale: CGFloat {
    isLarge ? 1.4 : 1.0
  }

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .topLeading) {
        if !isSmall {
          WidgetRichBackground()
        }

        WidgetGlow(style: glowStyle, scale: isSmall ? 1.0 : glowScale)
        WidgetWaterLine()
        if !isSmall {
          WidgetWaterLine(rotation: 18, xOffsetRatio: 0.08, yOffsetRatio: 0.42)
        }
        WidgetPondDepth(level: decorationLevel, isLarge: isLarge)

        content
          .padding(contentPadding)
          .frame(
            maxWidth: geo.size.width - contentPadding * 2,
            maxHeight: geo.size.height * textHeightRatio,
            alignment: .topLeading
          )
          .layoutPriority(1)
      }
      .frame(width: geo.size.width, height: geo.size.height)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

extension View {
  func widgetEdgeBorder() -> some View {
    overlay {
      ContainerRelativeShape()
        .strokeBorder(WidgetColors.warmWhiteBorder, lineWidth: 1.8)
    }
  }
}
