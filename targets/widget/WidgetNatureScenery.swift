import SwiftUI

struct WidgetNatureScenery: View {
  var level: PondDecorationLevel

  var body: some View {
    GeometryReader { geo in
      Canvas { context, size in
        let scaleX = size.width / 360
        let scaleY = size.height / 260
        context.scaleBy(x: scaleX, y: scaleY)

        drawSeaZoneRipples(context: &context)

        switch level {
        case .small:
          drawLilyPad(context: &context, cx: 52, cy: 218, r: 22, opacity: 0.52)
          drawLeaf(context: &context, cx: 28, cy: 196, w: 18, h: 10, rotation: -18, opacity: 0.38)
          drawSparkle(context: &context, cx: 310, cy: 228, r: 2.2)
          drawSparkle(context: &context, cx: 292, cy: 244, r: 1.8)

        case .medium:
          drawLilyPad(context: &context, cx: 48, cy: 222, r: 26, opacity: 0.58)
          drawLilyPad(context: &context, cx: 318, cy: 210, r: 20, opacity: 0.48)
          drawLilyPad(context: &context, cx: 290, cy: 238, r: 16, opacity: 0.42)
          drawLeaf(context: &context, cx: 22, cy: 188, w: 22, h: 12, rotation: -22, opacity: 0.42)
          drawLeaf(context: &context, cx: 334, cy: 178, w: 16, h: 9, rotation: 28, opacity: 0.34)
          drawSparkle(context: &context, cx: 308, cy: 196, r: 2.4)
          drawSparkle(context: &context, cx: 326, cy: 226, r: 2.0)
          drawSparkle(context: &context, cx: 278, cy: 248, r: 1.8)
          drawSparkle(context: &context, cx: 340, cy: 248, r: 2.2)

        case .large:
          drawLilyPad(context: &context, cx: 42, cy: 224, r: 30, opacity: 0.62)
          drawLilyPad(context: &context, cx: 78, cy: 238, r: 18, opacity: 0.48)
          drawLilyPad(context: &context, cx: 322, cy: 204, r: 24, opacity: 0.54)
          drawLilyPad(context: &context, cx: 296, cy: 232, r: 18, opacity: 0.46)
          drawLilyPad(context: &context, cx: 338, cy: 236, r: 14, opacity: 0.40)
          drawLotusFlower(context: &context, cx: 48, cy: 210)
          drawLeaf(context: &context, cx: 18, cy: 182, w: 24, h: 13, rotation: -24, opacity: 0.44)
          drawLeaf(context: &context, cx: 342, cy: 172, w: 18, h: 10, rotation: 32, opacity: 0.36)
          drawWillowStrand(context: &context, start: CGPoint(x: 350, y: 28), end: CGPoint(x: 310, y: 200))
          drawWillowStrand(context: &context, start: CGPoint(x: 330, y: 48), end: CGPoint(x: 268, y: 220))
          drawPebble(context: &context, cx: 318, cy: 252, r: 3.2)
          drawPebble(context: &context, cx: 332, cy: 248, r: 2.4)
          drawPebble(context: &context, cx: 304, cy: 254, r: 2.8)
          drawPebble(context: &context, cx: 326, cy: 256, r: 2.0)
          for (i, point) in [(306, 188), (328, 214), (284, 236), (346, 222), (268, 248), (338, 192)].enumerated() {
            drawSparkle(context: &context, cx: CGFloat(point.0), cy: CGFloat(point.1), r: 1.8 + CGFloat(i % 2) * 0.4)
          }
        }
      }
      .frame(width: geo.size.width, height: geo.size.height)
    }
    .allowsHitTesting(false)
  }

  private func drawSeaZoneRipples(context: inout GraphicsContext) {
    let waveOpacity: Double = {
      switch level {
      case .small: return 0.22
      case .medium: return 0.30
      case .large: return 0.38
      }
    }()

    strokeEllipse(context: &context, cx: 280, cy: 210, rx: 72, ry: 20, color: WidgetColors.rippleAqua.opacity(waveOpacity), lineWidth: 2.2)
    strokeEllipse(context: &context, cx: 300, cy: 228, rx: 48, ry: 14, color: WidgetColors.warmWhite.opacity(waveOpacity * 0.8), lineWidth: 1.4)

    if level != .small {
      strokeEllipse(context: &context, cx: 250, cy: 196, rx: 90, ry: 26, color: WidgetColors.cobaltRipple.opacity(0.28), lineWidth: 1.8)
      drawWave(context: &context, from: CGPoint(x: 120, y: 230), to: CGPoint(x: 360, y: 200), opacity: waveOpacity)
    }

    if level == .large {
      strokeEllipse(context: &context, cx: 220, cy: 218, rx: 110, ry: 32, color: WidgetColors.lotusGold.opacity(0.18), lineWidth: 1.4)
      drawWave(context: &context, from: CGPoint(x: 80, y: 248), to: CGPoint(x: 360, y: 218), opacity: waveOpacity * 0.85)
      drawWave(context: &context, from: CGPoint(x: 160, y: 256), to: CGPoint(x: 360, y: 238), opacity: waveOpacity * 0.7)
    } else if level == .medium {
      drawWave(context: &context, from: CGPoint(x: 140, y: 244), to: CGPoint(x: 360, y: 224), opacity: waveOpacity * 0.75)
    } else {
      drawWave(context: &context, from: CGPoint(x: 180, y: 246), to: CGPoint(x: 360, y: 232), opacity: waveOpacity * 0.65)
    }
  }

  private func drawLilyPad(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat, r: CGFloat, opacity: Double) {
    var path = Path()
    path.addEllipse(in: CGRect(x: cx - r, y: cy - r * 0.72, width: r * 2, height: r * 1.44))
    context.fill(path, with: .color(WidgetColors.lotusGreen.opacity(opacity)))
    var vein = Path()
    vein.move(to: CGPoint(x: cx - r * 0.6, y: cy))
    vein.addQuadCurve(to: CGPoint(x: cx + r * 0.6, y: cy), control: CGPoint(x: cx, y: cy - r * 0.2))
    context.stroke(vein, with: .color(WidgetColors.lotusGreen.opacity(opacity * 0.7)), lineWidth: 0.8)
    fillCircle(context: &context, cx: cx + r * 0.3, cy: cy - r * 0.2, r: 1.6, color: WidgetColors.warmWhite.opacity(0.45))
  }

  private func drawLotusFlower(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat) {
    for i in 0..<5 {
      let angle = Double(i) * .pi * 2 / 5 - .pi / 2
      var petal = Path()
      petal.addEllipse(in: CGRect(x: cx - 4, y: cy - 9, width: 8, height: 14))
      var petalContext = context
      petalContext.translateBy(x: cx, y: cy)
      petalContext.rotate(by: .radians(angle))
      petalContext.translateBy(x: -cx, y: -cy)
      petalContext.fill(petal, with: .color(Color(red: 1, green: 0.85, blue: 0.88).opacity(0.72)))
    }
    fillCircle(context: &context, cx: cx, cy: cy, r: 3, color: WidgetColors.lotusGold.opacity(0.85))
  }

  private func drawLeaf(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat, w: CGFloat, h: CGFloat, rotation: Double, opacity: Double) {
    var path = Path()
    path.move(to: CGPoint(x: cx - w, y: cy))
    path.addQuadCurve(to: CGPoint(x: cx + w, y: cy), control: CGPoint(x: cx, y: cy - h))
    path.addQuadCurve(to: CGPoint(x: cx - w, y: cy), control: CGPoint(x: cx, y: cy + h * 0.4))
    path.closeSubpath()
    var leafContext = context
    leafContext.translateBy(x: cx, y: cy)
    leafContext.rotate(by: .degrees(rotation))
    leafContext.translateBy(x: -cx, y: -cy)
    leafContext.fill(path, with: .color(WidgetColors.lotusGreen.opacity(opacity)))
  }

  private func drawWillowStrand(context: inout GraphicsContext, start: CGPoint, end: CGPoint) {
    var path = Path()
    path.move(to: start)
    path.addCurve(
      to: end,
      control1: CGPoint(x: start.x - 20, y: start.y + 60),
      control2: CGPoint(x: end.x + 16, y: end.y - 40)
    )
    context.stroke(path, with: .color(WidgetColors.lotusGreen.opacity(0.32)), style: StrokeStyle(lineWidth: 1.6, lineCap: .round))
  }

  private func drawWave(context: inout GraphicsContext, from: CGPoint, to: CGPoint, opacity: Double) {
    var path = Path()
    path.move(to: from)
    path.addCurve(
      to: to,
      control1: CGPoint(x: from.x + (to.x - from.x) * 0.35, y: from.y - 18),
      control2: CGPoint(x: from.x + (to.x - from.x) * 0.65, y: to.y + 12)
    )
    context.stroke(path, with: .color(WidgetColors.rippleAqua.opacity(opacity)), style: StrokeStyle(lineWidth: 2.4, lineCap: .round))
  }

  private func drawPebble(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat, r: CGFloat) {
    fillCircle(context: &context, cx: cx, cy: cy, r: r, color: WidgetColors.lotusGold.opacity(0.42))
  }

  private func drawSparkle(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat, r: CGFloat) {
    fillCircle(context: &context, cx: cx, cy: cy, r: r, color: WidgetColors.warmWhite.opacity(0.5))
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

  private func fillCircle(context: inout GraphicsContext, cx: CGFloat, cy: CGFloat, r: CGFloat, color: Color) {
    var path = Path()
    path.addEllipse(in: CGRect(x: cx - r, y: cy - r, width: r * 2, height: r * 2))
    context.fill(path, with: .color(color))
  }
}
