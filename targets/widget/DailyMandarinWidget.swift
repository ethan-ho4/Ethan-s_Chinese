import SwiftUI
import WidgetKit

struct DailyMandarinWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let snapshot: MandarinSnapshot

  private var isSmall: Bool { family == .systemSmall }
  private var isMedium: Bool { family == .systemMedium }

  private var mandarinSize: CGFloat {
    if isSmall { return 28 }
    if isMedium { return 36 }
    return 38
  }

  private var pinyinSize: CGFloat {
    if isSmall { return 13 }
    if isMedium { return 16 }
    return 17
  }

  private var headerSize: CGFloat {
    isSmall ? 11 : 12
  }

  var body: some View {
    WidgetCard(glowStyle: .mandarin, pondVariant: .mandarin) {
      VStack(alignment: .leading, spacing: isSmall ? 4 : 8) {
        HStack(alignment: .center, spacing: 6) {
          Text(snapshot.modeLabel)
            .font(.system(size: headerSize, weight: .bold))
            .foregroundStyle(WidgetColors.koiOrange)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          Spacer(minLength: 4)
          Text(snapshot.kind.uppercased())
            .font(.system(size: isSmall ? 10 : 11, weight: .bold))
            .foregroundStyle(WidgetColors.textMuted)
            .lineLimit(1)
        }

        Text(snapshot.mandarin)
          .font(.system(size: mandarinSize, weight: .bold))
          .foregroundStyle(WidgetColors.textOnLight)
          .minimumScaleFactor(isSmall ? 0.55 : 0.7)
          .lineLimit(isSmall ? 2 : 3)
          .fixedSize(horizontal: false, vertical: true)

        Text(snapshot.pinyin)
          .font(.system(size: pinyinSize, weight: .medium))
          .foregroundStyle(WidgetColors.koiOrange)
          .lineLimit(isSmall ? 1 : 2)
          .minimumScaleFactor(0.85)

        if !isSmall {
          Text(snapshot.english.capitalized)
            .font(.system(size: isMedium ? 17 : 20, weight: .bold))
            .foregroundStyle(WidgetColors.textOnLight)
            .lineLimit(isMedium ? 2 : 3)
            .minimumScaleFactor(0.85)
        }

        if family == .systemLarge {
          Text(snapshot.definition)
            .font(.system(size: 14))
            .foregroundStyle(WidgetColors.textMuted)
            .lineLimit(4)
            .minimumScaleFactor(0.9)
        }
      }
      .frame(maxWidth: .infinity, alignment: .topLeading)
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
