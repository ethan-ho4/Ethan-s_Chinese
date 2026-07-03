import SwiftUI

enum PondDecorationVariant {
  case mandarin
  case proverb
}

struct WidgetPondDepth: View {
  var compact: Bool
  var variant: PondDecorationVariant

  var body: some View {
    GeometryReader { geo in
      let widthRatio: CGFloat = compact ? 0.55 : (geo.size.height > 200 ? 0.45 : 0.50)
      let decorationWidth = geo.size.width * widthRatio
      let decorationHeight = decorationWidth * (220.0 / 320.0)
      let inset: CGFloat = compact ? 4 : (geo.size.height > 200 ? 8 : 6)

      Canvas { context, size in
        let scale = min(size.width / 320, size.height / 220)
        context.scaleBy(x: scale, y: scale)

        let isSmall = compact
        let aquaOpacity = isSmall ? 0.30 : 0.38
        let whiteOpacity = isSmall ? 0.22 : 0.30
        let goldOpacity = isSmall ? 0.18 : 0.25
        let bodyOpacity = isSmall ? 0.34 : 0.48
        let patchOpacity = isSmall ? 0.46 : 0.64
        let tailOpacity = isSmall ? 0.28 : 0.40
        let eyeOpacity = isSmall ? 0.44 : 0.62

        // Outer ripple
        strokeEllipse(
          context: &context,
          cx: 235, cy: 132,
          rx: isSmall ? 62 : 92,
          ry: isSmall ? 18 : 28,
          color: WidgetColors.rippleAqua.opacity(aquaOpacity),
          lineWidth: 3
        )

        if variant == .mandarin {
          // Inner ripple
          strokeEllipse(
            context: &context,
            cx: 230, cy: 132,
            rx: isSmall ? 34 : 56,
            ry: isSmall ? 10 : 17,
            color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(whiteOpacity),
            lineWidth: 2
          )

          // Gold ripple
          strokeEllipse(
            context: &context,
            cx: 214, cy: 146,
            rx: isSmall ? 78 : 112,
            ry: isSmall ? 23 : 34,
            color: WidgetColors.lotusGold.opacity(goldOpacity),
            lineWidth: 1.6
          )

          // Wave paths
          strokePath(
            context: &context,
            path: wavePath1(),
            color: WidgetColors.rippleAqua.opacity(isSmall ? 0.24 : 0.32),
            lineWidth: 3
          )
          strokePath(
            context: &context,
            path: wavePath2(),
            color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(isSmall ? 0.16 : 0.22),
            lineWidth: 1.8
          )
        }

        // Koi body
        fillPath(
          context: &context,
          path: koiBodyPath(),
          color: WidgetColors.mistyIvory.opacity(bodyOpacity)
        )

        // Koi orange patch
        fillPath(
          context: &context,
          path: koiPatchPath(),
          color: WidgetColors.koiOrange.opacity(patchOpacity)
        )

        // Koi tail
        fillPath(
          context: &context,
          path: koiTailPath(),
          color: WidgetColors.inkBlack.opacity(tailOpacity)
        )

        // Koi eye
        fillCircle(
          context: &context,
          cx: 274, cy: 118, r: 2.4,
          color: WidgetColors.inkBlack.opacity(eyeOpacity)
        )

        if variant == .mandarin {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(isSmall ? 0.30 : 0.42))
          fillCircle(context: &context, cx: 300, cy: 82, r: 2.8, color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(isSmall ? 0.24 : 0.34))
          fillCircle(context: &context, cx: 304, cy: 108, r: 3.2, color: WidgetColors.lotusGold.opacity(isSmall ? 0.26 : 0.38))
          fillCircle(context: &context, cx: 244, cy: 88, r: 2.4, color: WidgetColors.rippleAqua.opacity(isSmall ? 0.22 : 0.32))
        } else {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(isSmall ? 0.30 : 0.42))
        }
      }
      .frame(width: decorationWidth, height: decorationHeight)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
      .padding(.trailing, inset)
      .padding(.bottom, inset)
    }
    .allowsHitTesting(false)
  }

  private func strokeEllipse(
    context: inout GraphicsContext,
    cx: CGFloat, cy: CGFloat, rx: CGFloat, ry: CGFloat,
    color: Color, lineWidth: CGFloat
  ) {
    var path = Path()
    path.addEllipse(in: CGRect(x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2))
    context.stroke(path, with: .color(color), lineWidth: lineWidth)
  }

  private func fillCircle(
    context: inout GraphicsContext,
    cx: CGFloat, cy: CGFloat, r: CGFloat,
    color: Color
  ) {
    var path = Path()
    path.addEllipse(in: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2))
    context.fill(path, with: .color(color))
  }

  private func fillPath(context: inout GraphicsContext, path: Path, color: Color) {
    context.fill(path, with: .color(color))
  }

  private func strokePath(context: inout GraphicsContext, path: Path, color: Color, lineWidth: CGFloat) {
    context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
  }

  private func koiBodyPath() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 166, y: 126))
    path.addCurve(
      to: CGPoint(x: 288, y: 126),
      control1: CGPoint(x: 194, y: 96),
      control2: CGPoint(x: 252, y: 94)
    )
    path.addCurve(
      to: CGPoint(x: 166, y: 126),
      control1: CGPoint(x: 252, y: 156),
      control2: CGPoint(x: 196, y: 156)
    )
    path.closeSubpath()
    return path
  }

  private func koiPatchPath() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 202, y: 124))
    path.addCurve(
      to: CGPoint(x: 276, y: 124),
      control1: CGPoint(x: 224, y: 106),
      control2: CGPoint(x: 254, y: 108)
    )
    path.addCurve(
      to: CGPoint(x: 202, y: 124),
      control1: CGPoint(x: 252, y: 136),
      control2: CGPoint(x: 225, y: 136)
    )
    path.closeSubpath()
    return path
  }

  private func koiTailPath() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 170, y: 126))
    path.addCurve(
      to: CGPoint(x: 116, y: 119),
      control1: CGPoint(x: 150, y: 116),
      control2: CGPoint(x: 132, y: 114)
    )
    path.addCurve(
      to: CGPoint(x: 173, y: 132),
      control1: CGPoint(x: 134, y: 132),
      control2: CGPoint(x: 150, y: 137)
    )
    path.closeSubpath()
    return path
  }

  private func wavePath1() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 24, y: 176))
    path.addCurve(
      to: CGPoint(x: 324, y: 144),
      control1: CGPoint(x: 92, y: 135),
      control2: CGPoint(x: 230, y: 142)
    )
    return path
  }

  private func wavePath2() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 68, y: 194))
    path.addCurve(
      to: CGPoint(x: 320, y: 170),
      control1: CGPoint(x: 122, y: 166),
      control2: CGPoint(x: 230, y: 166)
    )
    return path
  }
}
