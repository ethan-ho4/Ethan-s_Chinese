import SwiftUI

enum PondDecorationLevel {
  case small
  case medium
  case large
}

struct WidgetPondDepth: View {
  var level: PondDecorationLevel

  var body: some View {
    GeometryReader { geo in
      let widthRatio: CGFloat = {
        switch level {
        case .small: return 0.55
        case .medium: return 0.90
        case .large: return 1.0
        }
      }()
      let decorationWidth = geo.size.width * widthRatio
      let decorationHeight = decorationWidth * (220.0 / 320.0)
      let inset: CGFloat = {
        switch level {
        case .small: return 4
        case .medium: return 6
        case .large: return 8
        }
      }()
      let sceneAlignment: Alignment = level == .small ? .bottomTrailing : .center

      Canvas { context, size in
        let scale = min(size.width / 320, size.height / 220)
        context.scaleBy(x: scale, y: scale)

        let isSmall = level == .small
        let isLarge = level == .large

        if !isSmall {
          context.translateBy(x: 0, y: -size.height * 0.06)
        }
        let aquaOpacity = isSmall ? 0.36 : (isLarge ? 0.50 : 0.44)
        let whiteOpacity = isSmall ? 0.26 : (isLarge ? 0.40 : 0.34)
        let goldOpacity = isSmall ? 0.20 : (isLarge ? 0.34 : 0.28)
        let bodyOpacity = isSmall ? 0.40 : (isLarge ? 0.68 : 0.58)
        let patchOpacity = isSmall ? 0.52 : (isLarge ? 0.80 : 0.72)
        let tailOpacity = isSmall ? 0.32 : (isLarge ? 0.54 : 0.48)
        let eyeOpacity = isSmall ? 0.50 : (isLarge ? 0.74 : 0.68)

        if !isSmall {
          strokeEllipse(
            context: &context,
            cx: 180, cy: 168,
            rx: 48, ry: 14,
            color: WidgetColors.lotusGold.opacity(0.24),
            lineWidth: 1.4
          )
          strokeEllipse(
            context: &context,
            cx: 260, cy: 178,
            rx: 36, ry: 10,
            color: WidgetColors.rippleAqua.opacity(0.30),
            lineWidth: 1.2
          )
        }

        if isLarge {
          strokeEllipse(
            context: &context,
            cx: 200, cy: 182,
            rx: 58, ry: 16,
            color: WidgetColors.cobaltRipple.opacity(0.32),
            lineWidth: 1.2
          )
          strokePath(
            context: &context,
            path: wavePath3(),
            color: WidgetColors.rippleAqua.opacity(0.28),
            lineWidth: 2.2
          )
        }

        strokeEllipse(
          context: &context,
          cx: 235, cy: 132,
          rx: isSmall ? 62 : (isLarge ? 100 : 92),
          ry: isSmall ? 18 : (isLarge ? 30 : 28),
          color: WidgetColors.rippleAqua.opacity(aquaOpacity),
          lineWidth: 3
        )

        if !isSmall {
          strokeEllipse(
            context: &context,
            cx: 230, cy: 132,
            rx: isLarge ? 62 : 56, ry: isLarge ? 19 : 17,
            color: WidgetColors.warmWhite.opacity(whiteOpacity),
            lineWidth: 2
          )

          strokeEllipse(
            context: &context,
            cx: 214, cy: 146,
            rx: isLarge ? 124 : 112, ry: isLarge ? 38 : 34,
            color: WidgetColors.lotusGold.opacity(goldOpacity),
            lineWidth: 1.6
          )

          strokePath(
            context: &context,
            path: wavePath1(),
            color: WidgetColors.rippleAqua.opacity(isLarge ? 0.40 : 0.34),
            lineWidth: 3
          )
          strokePath(
            context: &context,
            path: wavePath2(),
            color: WidgetColors.warmWhite.opacity(isLarge ? 0.30 : 0.24),
            lineWidth: 1.8
          )
        }

        if !isSmall {
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

        if isLarge {
          drawKoi(
            context: &context,
            bodyOpacity: bodyOpacity * 0.22,
            patchOpacity: patchOpacity * 0.22,
            tailOpacity: tailOpacity * 0.22,
            eyeOpacity: eyeOpacity * 0.22,
            transform: { ctx in
              ctx.translateBy(x: -18, y: 42)
              ctx.scaleBy(x: 0.48, y: 0.48)
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

        if !isSmall {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(0.48))
          fillCircle(context: &context, cx: 300, cy: 82, r: 2.8, color: WidgetColors.warmWhite.opacity(0.38))
          fillCircle(context: &context, cx: 304, cy: 108, r: 3.2, color: WidgetColors.lotusGold.opacity(0.42))
          fillCircle(context: &context, cx: 244, cy: 88, r: 2.4, color: WidgetColors.rippleAqua.opacity(0.36))
          if isLarge {
            fillCircle(context: &context, cx: 268, cy: 76, r: 2.2, color: WidgetColors.warmWhite.opacity(0.34))
            fillCircle(context: &context, cx: 312, cy: 118, r: 2.6, color: WidgetColors.rippleAqua.opacity(0.32))
          }
        } else {
          fillCircle(context: &context, cx: 286, cy: 92, r: 3.8, color: WidgetColors.rippleAqua.opacity(0.34))
          fillCircle(context: &context, cx: 300, cy: 82, r: 2.4, color: WidgetColors.warmWhite.opacity(0.28))
        }
      }
      .frame(width: decorationWidth, height: decorationHeight)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: sceneAlignment)
      .padding(.trailing, level == .small ? inset : 0)
      .padding(.bottom, level == .small ? inset : 0)
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

  private func wavePath3() -> Path {
    var path = Path()
    path.move(to: CGPoint(x: 40, y: 162))
    path.addCurve(
      to: CGPoint(x: 310, y: 128),
      control1: CGPoint(x: 120, y: 118),
      control2: CGPoint(x: 220, y: 132)
    )
    return path
  }
}
