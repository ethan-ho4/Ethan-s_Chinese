import SwiftUI
import WidgetKit

struct DailyProverbWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let snapshot: ProverbSnapshot

  private var displayEnglish: String {
    if family == .systemSmall && snapshot.english.count > 48 {
      return String(snapshot.english.prefix(45)).trimmingCharacters(in: .whitespacesAndNewlines) + "..."
    }
    return snapshot.english
  }

  var body: some View {
    WidgetCard {
      VStack(alignment: .leading, spacing: family == .systemSmall ? 6 : 8) {
        HStack {
          Text("Daily Proverb")
            .font(.caption.weight(.bold))
            .foregroundStyle(WidgetColors.lotusGreen)
          Spacer()
          Text("谚语")
            .font(.caption2.weight(.bold))
            .foregroundStyle(WidgetColors.textMuted)
        }

        Text(snapshot.mandarin)
          .font(.system(size: family == .systemSmall ? 20 : 24, weight: .bold))
          .foregroundStyle(WidgetColors.textOnLight)
          .minimumScaleFactor(0.75)
          .lineLimit(family == .systemSmall ? 3 : 4)

        if family != .systemSmall {
          Text(snapshot.pinyin)
            .font(.system(size: 15, weight: .medium))
            .foregroundStyle(WidgetColors.koiOrange)
            .lineLimit(2)

          Text(displayEnglish)
            .font(.system(size: family == .systemMedium ? 15 : 16))
            .foregroundStyle(WidgetColors.textOnLight)
            .lineLimit(family == .systemLarge ? 5 : 3)
        }
      }
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
