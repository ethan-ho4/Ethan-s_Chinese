import SwiftUI
import WidgetKit

enum WidgetColors {
  static let surface = Color(red: 238 / 255, green: 232 / 255, blue: 204 / 255)
  static let surfaceTop = Color(red: 245 / 255, green: 239 / 255, blue: 212 / 255)
  static let surfaceBottom = Color(red: 232 / 255, green: 224 / 255, blue: 200 / 255)
  static let cobaltBlue = Color(red: 0 / 255, green: 71 / 255, blue: 171 / 255)
  static let cobaltDeep = Color(red: 0 / 255, green: 51 / 255, blue: 128 / 255)
  static let cobaltRipple = Color(red: 64 / 255, green: 140 / 255, blue: 220 / 255)
  static let koiOrange = Color(red: 217 / 255, green: 107 / 255, blue: 43 / 255)
  static let lotusGreen = Color(red: 126 / 255, green: 159 / 255, blue: 61 / 255)
  static let textOnLight = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255)
  static let textMuted = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255, opacity: 0.62)
  static let rippleAqua = Color(red: 127 / 255, green: 199 / 255, blue: 194 / 255)
  static let lotusGold = Color(red: 216 / 255, green: 182 / 255, blue: 90 / 255)
  static let mistyIvory = Color(red: 243 / 255, green: 233 / 255, blue: 210 / 255)
  static let inkBlack = Color(red: 27 / 255, green: 27 / 255, blue: 27 / 255)
  static let warmWhite = Color(red: 1, green: 248 / 255, blue: 234 / 255)
  static let mandarinGlow = Color(red: 232 / 255, green: 176 / 255, blue: 93 / 255, opacity: 0.10)
  static let proverbGlow = Color(red: 126 / 255, green: 159 / 255, blue: 61 / 255, opacity: 0.12)
  static let waterLine = Color(red: 64 / 255, green: 140 / 255, blue: 220 / 255, opacity: 0.28)
  static let warmWhiteBorder = Color(red: 255 / 255, green: 248 / 255, blue: 234 / 255, opacity: 0.68)
  static let textOnDark = warmWhite
}

enum WidgetGlowStyle {
  case mandarin
  case proverb
}

enum WidgetDecoration {
  static func level(for family: WidgetFamily) -> PondDecorationLevel {
    switch family {
    case .systemSmall: return .small
    case .systemLarge: return .large
    default: return .medium
    }
  }

  static func glowScale(for level: PondDecorationLevel) -> CGFloat {
    level == .large ? 1.4 : 1.0
  }

  static func waterLineCount(for level: PondDecorationLevel) -> Int {
    switch level {
    case .small: return 1
    case .medium: return 2
    case .large: return 3
    }
  }
}

struct WidgetGlow: View {
  var style: WidgetGlowStyle
  var level: PondDecorationLevel
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
        .offset(
          x: level == .small ? -geo.size.width * 0.12 : geo.size.width * 0.08,
          y: level == .small ? geo.size.height * 0.55 : geo.size.height * 0.32
        )
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

struct WidgetPondBackground: View {
  var level: PondDecorationLevel

  var body: some View {
    GeometryReader { geo in
      LinearGradient(
        colors: [WidgetColors.cobaltBlue, WidgetColors.cobaltDeep],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )

      Ellipse()
        .fill(WidgetColors.lotusGreen.opacity(level == .large ? 0.10 : 0.06))
        .frame(width: geo.size.width * 0.55, height: geo.size.height * 0.32)
        .offset(
          x: level == .small ? geo.size.width * 0.42 : geo.size.width * 0.18,
          y: level == .small ? -geo.size.height * 0.06 : geo.size.height * 0.08
        )

      Ellipse()
        .fill(WidgetColors.cobaltRipple.opacity(0.12))
        .frame(width: geo.size.width * 0.7, height: geo.size.height * 0.38)
        .offset(
          x: level == .small ? geo.size.width * 0.18 : geo.size.width * 0.02,
          y: level == .small ? geo.size.height * 0.58 : geo.size.height * 0.38
        )

      if level != .small {
        Ellipse()
          .fill(WidgetColors.rippleAqua.opacity(0.08))
          .frame(width: geo.size.width * 0.45, height: geo.size.height * 0.22)
          .offset(
            x: level == .medium ? geo.size.width * 0.04 : geo.size.width * 0.08,
            y: level == .medium ? geo.size.height * 0.52 : geo.size.height * 0.48
          )
      }
    }
    .allowsHitTesting(false)
  }
}

struct WidgetFullBackground: View {
  @Environment(\.widgetFamily) private var family
  var glowStyle: WidgetGlowStyle

  private var decorationLevel: PondDecorationLevel {
    WidgetDecoration.level(for: family)
  }

  private var glowScale: CGFloat {
    WidgetDecoration.glowScale(for: decorationLevel)
  }

  private var waterLineCount: Int {
    WidgetDecoration.waterLineCount(for: decorationLevel)
  }

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .topLeading) {
        WidgetPondBackground(level: decorationLevel)
        WidgetNatureScenery(level: decorationLevel)
        WidgetGlow(style: glowStyle, level: decorationLevel, scale: glowScale)

        if waterLineCount >= 1 {
          WidgetWaterLine(
            xOffsetRatio: decorationLevel == .small ? 0.35 : 0.10,
            yOffsetRatio: decorationLevel == .small ? 0.18 : 0.26
          )
        }
        if waterLineCount >= 2 {
          WidgetWaterLine(
            rotation: 18,
            xOffsetRatio: decorationLevel == .small ? 0.08 : 0.04,
            yOffsetRatio: decorationLevel == .small ? 0.42 : 0.44
          )
        }
        if waterLineCount >= 3 {
          WidgetWaterLine(
            rotation: -24,
            xOffsetRatio: decorationLevel == .small ? 0.22 : 0.08,
            yOffsetRatio: decorationLevel == .small ? 0.58 : 0.56
          )
        }

        WidgetPondDepth(level: decorationLevel)
      }
      .frame(width: geo.size.width, height: geo.size.height)
    }
  }
}

struct WidgetCard<Content: View>: View {
  @Environment(\.widgetFamily) private var family
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  private var decorationLevel: PondDecorationLevel {
    WidgetDecoration.level(for: family)
  }

  private var contentPadding: CGFloat {
    switch decorationLevel {
    case .small: return 10
    case .medium: return 14
    case .large: return 16
    }
  }

  private var textHeightRatio: CGFloat {
    switch decorationLevel {
    case .small: return 0.70
    case .medium: return 0.88
    case .large: return 0.90
    }
  }

  private var contentAlignment: Alignment {
    .topLeading
  }

  var body: some View {
    GeometryReader { geo in
      content
        .padding(contentPadding)
        .frame(
          maxWidth: geo.size.width - contentPadding * 2,
          maxHeight: geo.size.height * textHeightRatio,
          alignment: contentAlignment
        )
        .frame(width: geo.size.width, height: geo.size.height, alignment: contentAlignment)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

extension View {
  func widgetContainerChrome(glowStyle: WidgetGlowStyle) -> some View {
    frame(maxWidth: .infinity, maxHeight: .infinity)
      .containerBackground(for: .widget) {
        WidgetFullBackground(glowStyle: glowStyle)
          .overlay {
            ContainerRelativeShape()
              .strokeBorder(WidgetColors.warmWhiteBorder, lineWidth: 1.8)
          }
      }
  }
}
