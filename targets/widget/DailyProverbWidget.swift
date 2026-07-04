import SwiftUI
import WidgetKit

struct DailyProverbWidgetView: View {
  let snapshot: ProverbSnapshot

  var body: some View {
    WidgetCard(glowStyle: .proverb) {
      WidgetLearningContent(
        mandarin: snapshot.mandarin,
        pinyin: snapshot.pinyin,
        english: snapshot.english
      )
    }
  }
}

struct DailyProverbWidget: Widget {
  let kind = "DailyProverb"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: ProverbProvider()) { entry in
      DailyProverbWidgetView(snapshot: entry.snapshot)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(for: .widget) {
          WidgetColors.surface
        }
        .widgetEdgeBorder()
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
