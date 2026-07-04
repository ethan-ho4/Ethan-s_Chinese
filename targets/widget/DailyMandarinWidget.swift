import SwiftUI
import WidgetKit

struct DailyMandarinWidgetView: View {
  let snapshot: MandarinSnapshot

  var body: some View {
    WidgetCard(glowStyle: .mandarin) {
      WidgetLearningContent(
        mandarin: snapshot.mandarin,
        pinyin: snapshot.pinyin,
        english: snapshot.english
      )
    }
  }
}

struct DailyMandarinWidget: Widget {
  let kind = "DailyMandarin"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MandarinProvider()) { entry in
      DailyMandarinWidgetView(snapshot: entry.snapshot)
        .widgetContainerChrome()
    }
    .configurationDisplayName("Daily Mandarin")
    .description("Today's Mandarin word or phrase with pinyin and English.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
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
