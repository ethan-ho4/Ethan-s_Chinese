import SwiftUI

enum PondDecorationLevel {
  case compact
  case rich
}

struct WidgetPondDepth: View {
  var level: PondDecorationLevel
  var isLarge: Bool

  var body: some View {
    GeometryReader { geo in
      let widthRatio: CGFloat = {
        switch level {
        case .compact: return 0.55
        case .rich: return isLarge ? 0.70 : 0.65
        }
      }()
      let decorationWidth = geo.size.width * widthRatio
      let decorationHeight = decorationWidth * (220.0 / 320.0)
      let inset: CGFloat = level == .compact ? 4 : (isLarge ? 8 : 6)

      Canvas { context, size in
        let scale = min(size.width / 320, size.height / 220)
        context.scaleBy(x: scale, y: scale)

        let isCompact = level == .compact
        let isRich = level == .rich
        let aquaOpacity = isCompact ? 0.30 : 0.42
        let whiteOpacity = isCompact ? 0.22 : 0.34
        let goldOpacity = isCompact ? 0.18 : 0.30
        let bodyOpacity = isCompact ? 0.34 : 0.58
        let patchOpacity = isCompact ? 0.46 : 0.72
        let tailOpacity = isCompact ? 0.28 : 0.48
        let eyeOpacity = isCompact ? 0.44 : 0.68

        if isRich {
          strokeEllipse(
            context: &context,
            cx: 180, cy: 168,
            rx: 48, ry: 14,
            color: WidgetColors.lotusGold.opacity(0.22),
            lineWidth: 1.4
          )
          strokeEllipse(
            context: &context,
            cx: 260, cy: 178,
            rx: 36, ry: 10,
            color: WidgetColors.rippleAqua.opacity(0.26),
            lineWidth: 1.2
          )
        }

        strokeEllipse(
          context: &context,
          cx: 235, cy: 132,
          rx: isCompact ? 62 : 92,
          ry: isCompact ? 18 : 28,
          color: WidgetColors.rippleAqua.opacity(aquaOpacity),
          lineWidth: 3
        )

        if !isCompact {
          strokeEllipse(
            context: &context,
            cx: 230, cy: 132,
            rx: 56, ry: 17,
            color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(whiteOpacity),
            lineWidth: 2
          )

          strokeEllipse(
            context: &context,
            cx: 214, cy: 146,
            rx: 112, ry: 34,
            color: WidgetColors.lotusGold.opacity(goldOpacity),
            lineWidth: 1.6
          )

          strokePath(
            context: &context,
            path: wavePath1(),
            color: WidgetColors.rippleAqua.opacity(0.34),
            lineWidth: 3
          )
          strokePath(
            context: &context,
            path: wavePath2(),
            color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(0.24),
            lineWidth: 1.8
          )
        }

        if isRich {
          drawKoi(
            context: &context,
            bodyOpacity: bodyOpacity * 0.35,
            patchOpacity: patchOpacity * 0.35,
            tailOpacity: tailOpacity * 0.35,
            eyeOpacity: eyeOpacity * 0.35,
            transform: { ctx in
              ctx.translateBy(x: 28, y: 18)
              ctx.scaleBy(x: 0.62, y: 0.62)
            }
          )
        }

        drawKoi(
          context: &context,
          bodyOpacity: bodyOpacity,
          patchOpacity: patchOpacity,
          tailOpacity: tailOpacity,
          eyeOpacity: eyeOpacity,
          transform: { _ in }
        )

        if !isCompact {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(0.44))
          fillCircle(context: &context, cx: 300, cy: 82, r: 2.8, color: Color(red: 1, green: 248 / 255, blue: 234 / 255).opacity(0.36))
          fillCircle(context: &context, cx: 304, cy: 108, r: 3.2, color: WidgetColors.lotusGold.opacity(0.40))
          fillCircle(context: &context, cx: 244, cy: 88, r: 2.4, color: WidgetColors.rippleAqua.opacity(0.34))
        } else {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(0.30))
        }
      }
      .frame(width: decorationWidth, height: decorationHeight)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
      .padding(.trailing, inset)
      .padding(.bottom, inset)
    }
    .allowsHitTesting(false)
  }

  private func drawKoi(
    context: inout GraphicsContext,
    bodyOpacity: Double,
    patchOpacity: Double,
    tailOpacity: Double,
    eyeOpacity: Double,
    transform: (inout GraphicsContext) -> Void
  ) {
    var koiContext = context
    transform(&koiContext)

    fillPath(context: &koiContext, path: koiBodyPath(), color: WidgetColors.mistyIvory.opacity(bodyOpacity))
    fillPath(context: &koiContext, path: koiPatchPath(), color: WidgetColors.koiOrange.opacity(patchOpacity))
    fillPath(context: &koiContext, path: koiTailPath(), color: WidgetColors.inkBlack.opacity(tailOpacity))
    fillCircle(context: &koiContext, cx: 274, cy: 118, r: 2.4, color: WidgetColors.inkBlack.opacity(eyeOpacity))
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
