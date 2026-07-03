import SwiftUI
import WidgetKit

struct DailyMandarinWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let snapshot: MandarinSnapshot

  var body: some View {
    WidgetCard {
      VStack(alignment: .leading, spacing: family == .systemSmall ? 6 : 8) {
        HStack {
          Text(snapshot.modeLabel)
            .font(.caption.weight(.bold))
            .foregroundStyle(WidgetColors.koiOrange)
            .lineLimit(1)
          Spacer()
          Text(snapshot.kind.uppercased())
            .font(.caption2.weight(.bold))
            .foregroundStyle(WidgetColors.textMuted)
        }

        Text(snapshot.mandarin)
          .font(.system(size: family == .systemSmall ? 30 : 38, weight: .bold))
          .foregroundStyle(WidgetColors.textOnLight)
          .minimumScaleFactor(0.7)
          .lineLimit(family == .systemSmall ? 2 : 3)

        Text(snapshot.pinyin)
          .font(.system(size: family == .systemSmall ? 14 : 17, weight: .medium))
          .foregroundStyle(WidgetColors.koiOrange)
          .lineLimit(2)

        if family != .systemSmall {
          Text(snapshot.english.capitalized)
            .font(.system(size: family == .systemMedium ? 18 : 20, weight: .bold))
            .foregroundStyle(WidgetColors.textOnLight)
            .lineLimit(family == .systemMedium ? 2 : 3)
        }

        if family == .systemLarge {
          Text(snapshot.definition)
            .font(.system(size: 14))
            .foregroundStyle(WidgetColors.textMuted)
            .lineLimit(4)
        }
      }
    }
  }
}

struct DailyMandarinWidget: Widget {
  let kind = "DailyMandarin"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MandarinProvider()) { entry in
      DailyMandarinWidgetView(snapshot: entry.snapshot)
        .containerBackground(for: .widget) {
          WidgetColors.surface
        }
    }
    .configurationDisplayName("Daily Mandarin")
    .description("Today's Mandarin word or phrase from your selected mode.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

#Preview(as: .systemSmall) {
  DailyMandarinWidget()
} timeline: {
  MandarinEntry(date: .now, snapshot: WidgetDataStore.mandarinSnapshot())
}

#Preview(as: .systemMedium) {
  DailyMandarinWidget()
} timeline: {
  MandarinEntry(date: .now, snapshot: WidgetDataStore.mandarinSnapshot())
}

#Preview(as: .systemLarge) {
  DailyMandarinWidget()
} timeline: {
  MandarinEntry(date: .now, snapshot: WidgetDataStore.mandarinSnapshot())
}
