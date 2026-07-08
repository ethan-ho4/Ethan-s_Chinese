import SwiftUI
import WidgetKit

struct WidgetLearningContent: View {
  @Environment(\.widgetFamily) private var family
  let mandarin: String
  let pinyin: String
  let english: String

  private var isSmall: Bool { family == .systemSmall }
  private var isMedium: Bool { family == .systemMedium }

  private var mandarinSize: CGFloat {
    if isSmall { return 24 }
    if isMedium { return 34 }
    return 38
  }

  private var pinyinSize: CGFloat {
    if isSmall { return 11 }
    if isMedium { return 16 }
    return 17
  }

  private var englishSize: CGFloat {
    if isSmall { return 11 }
    if isMedium { return 16 }
    return 18
  }

  private var displayEnglish: String {
    if isSmall && english.count > 56 {
      return String(english.prefix(53)).trimmingCharacters(in: .whitespacesAndNewlines) + "..."
    }
    return english
  }

  var body: some View {
    VStack(alignment: .leading, spacing: isSmall ? 4 : 8) {
      Text(mandarin)
        .font(.system(size: mandarinSize, weight: .bold))
        .foregroundStyle(WidgetColors.textOnDark)
        .minimumScaleFactor(isSmall ? 0.5 : 0.65)
        .lineLimit(isSmall ? 2 : 3)
        .multilineTextAlignment(.leading)
        .fixedSize(horizontal: false, vertical: true)

      Text(pinyin)
        .font(.system(size: pinyinSize, weight: .medium))
        .foregroundStyle(WidgetColors.koiOrange)
        .lineLimit(isSmall ? 1 : 2)
        .multilineTextAlignment(.leading)
        .minimumScaleFactor(0.8)

      Text(displayEnglish.capitalized)
        .font(.system(size: englishSize, weight: isSmall ? .medium : .semibold))
        .foregroundStyle(WidgetColors.textOnDark)
        .lineLimit(isSmall ? 2 : (isMedium ? 2 : 3))
        .multilineTextAlignment(.leading)
        .minimumScaleFactor(0.85)
    }
    .frame(maxWidth: .infinity, alignment: .topLeading)
  }
}
