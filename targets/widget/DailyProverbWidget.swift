import SwiftUI
import WidgetKit

struct DailyProverbWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let snapshot: ProverbSnapshot

  private var isSmall: Bool { family == .systemSmall }
  private var isMedium: Bool { family == .systemMedium }

  private var displayEnglish: String {
    if isSmall && snapshot.english.count > 48 {
      return String(snapshot.english.prefix(45)).trimmingCharacters(in: .whitespacesAndNewlines) + "..."
    }
    return snapshot.english
  }

  private var mandarinSize: CGFloat {
    if isSmall { return 22 }
    if isMedium { return 24 }
    return 26
  }

  private var headerSize: CGFloat {
    isSmall ? 11 : 12
  }

  var body: some View {
    WidgetCard(glowStyle: .proverb, pondVariant: .proverb) {
      VStack(alignment: .leading, spacing: isSmall ? 4 : 8) {
        HStack(alignment: .center, spacing: 6) {
          Text("Daily Proverb")
            .font(.system(size: headerSize, weight: .bold))
            .foregroundStyle(WidgetColors.lotusGreen)
            .lineLimit(1)
            .minimumScaleFactor(0.85)
          Spacer(minLength: 4)
          Text("谚语")
            .font(.system(size: isSmall ? 10 : 11, weight: .bold))
            .foregroundStyle(WidgetColors.textMuted)
            .lineLimit(1)
        }

        Text(snapshot.mandarin)
          .font(.system(size: mandarinSize, weight: .bold))
          .foregroundStyle(WidgetColors.textOnLight)
          .minimumScaleFactor(isSmall ? 0.7 : 0.75)
          .lineLimit(isSmall ? 3 : 4)
          .fixedSize(horizontal: false, vertical: true)

        if !isSmall {
          Text(snapshot.pinyin)
            .font(.system(size: isMedium ? 15 : 16, weight: .medium))
            .foregroundStyle(WidgetColors.koiOrange)
            .lineLimit(2)
            .minimumScaleFactor(0.85)

          Text(displayEnglish)
            .font(.system(size: isMedium ? 15 : 16))
            .foregroundStyle(WidgetColors.textOnLight)
            .lineLimit(family == .systemLarge ? 5 : 3)
            .minimumScaleFactor(0.9)
        }
      }
      .frame(maxWidth: .infinity, alignment: .topLeading)
    }
  }
}

struct DailyProverbWidget: Widget {
  let kind = "DailyProverb"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: ProverbProvider()) { entry in
      DailyProverbWidgetView(snapshot: entry.snapshot)
        .containerBackground(for: .widget) {
          WidgetColors.surface
        }
    }
    .configurationDisplayName("Daily Proverb")
    .description("A daily Chinese proverb with pinyin and English meaning.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

#Preview(as: .systemSmall) {
  DailyProverbWidget()
} timeline: {
  ProverbEntry(date: .now, snapshot: WidgetDataStore.proverbSnapshot())
}

#Preview(as: .systemMedium) {
  DailyProverbWidget()
} timeline: {
  ProverbEntry(date: .now, snapshot: WidgetDataStore.proverbSnapshot())
}

#Preview(as: .systemLarge) {
  DailyProverbWidget()
} timeline: {
  ProverbEntry(date: .now, snapshot: WidgetDataStore.proverbSnapshot())
}
