import Foundation
import WidgetKit

enum WidgetConstants {
  static let appGroup = "group.com.ethanho.ethanschinese"
  static let modeKey = "selectedMode"
  static let scriptKey = "script"
  static let startDateUtc: TimeInterval = 1767225600 // 2026-01-01T00:00:00Z
}

struct EntryData: Codable {
  let id: String
  let mandarin: String
  let traditional: String?
  let pinyin: String
  let english: String
  let definition: String
  let kind: String
  let hskLevel: Int
}

struct ProverbData: Codable {
  let id: String
  let mandarin: String
  let traditional: String?
  let pinyin: String
  let english: String
}

struct MandarinSnapshot {
  let modeLabel: String
  let kind: String
  let mandarin: String
  let pinyin: String
  let english: String
  let definition: String
}

struct ProverbSnapshot {
  let mandarin: String
  let pinyin: String
  let english: String
}

enum WidgetDataStore {
  private static let modeLabels: [String: String] = [
    "all": "All Words",
    "words": "Words Only",
    "phrases": "Phrases Only",
    "hsk1": "HSK 1",
    "hsk2": "HSK 2",
    "hsk3": "HSK 3",
  ]

  private static var sharedDefaults: UserDefaults? {
    UserDefaults(suiteName: WidgetConstants.appGroup)
  }

  private static func selectedMode() -> String {
    sharedDefaults?.string(forKey: WidgetConstants.modeKey) ?? "all"
  }

  private static func selectedScript() -> String {
    sharedDefaults?.string(forKey: WidgetConstants.scriptKey) ?? "simplified"
  }

  private static func loadEntries() -> [EntryData] {
    guard let url = Bundle.main.url(forResource: "entries", withExtension: "json"),
          let data = try? Data(contentsOf: url),
          let entries = try? JSONDecoder().decode([EntryData].self, from: data) else {
      return []
    }
    return entries
  }

  private static func loadProverbs() -> [ProverbData] {
    guard let url = Bundle.main.url(forResource: "proverbs", withExtension: "json"),
          let data = try? Data(contentsOf: url),
          let proverbs = try? JSONDecoder().decode([ProverbData].self, from: data) else {
      return []
    }
    return proverbs
  }

  private static func filterEntries(_ entries: [EntryData], mode: String) -> [EntryData] {
    switch mode {
    case "words":
      return entries.filter { $0.kind == "word" }
    case "phrases":
      return entries.filter { $0.kind == "phrase" }
    case "hsk1":
      return entries.filter { $0.hskLevel == 1 }
    case "hsk2":
      return entries.filter { $0.hskLevel == 2 }
    case "hsk3":
      return entries.filter { $0.hskLevel == 3 }
    default:
      return entries
    }
  }

  private static func utcDayNumber(for date: Date) -> Int {
    let utcMidnight = utcStartOfDay(for: date)
    return Int(floor((utcMidnight.timeIntervalSince1970 - WidgetConstants.startDateUtc) / 86_400))
  }

  private static func calendarDayOfYear(for date: Date) -> Int {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 0)!
    return calendar.ordinality(of: .day, in: .year, for: date) ?? 1
  }

  private static func utcStartOfDay(for date: Date) -> Date {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 0)!
    return calendar.startOfDay(for: date)
  }

  static func nextUtcMidnight(from date: Date) -> Date {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 0)!
    let start = calendar.startOfDay(for: date)
    return calendar.date(byAdding: .day, value: 1, to: start) ?? date.addingTimeInterval(86_400)
  }

  static func mandarinSnapshot(for date: Date = Date()) -> MandarinSnapshot {
    let mode = selectedMode()
    let script = selectedScript()
    let allEntries = loadEntries()
    let filtered = filterEntries(allEntries, mode: mode)
    let usable = filtered.isEmpty ? allEntries : filtered
    let dayNumber = utcDayNumber(for: date)
    let index = ((dayNumber % usable.count) + usable.count) % max(usable.count, 1)
    let entry = usable[index]

    let chinese = script == "traditional" ? (entry.traditional ?? entry.mandarin) : entry.mandarin
    return MandarinSnapshot(
      modeLabel: modeLabels[mode] ?? "All Words",
      kind: entry.kind,
      mandarin: chinese,
      pinyin: entry.pinyin,
      english: entry.english,
      definition: entry.definition
    )
  }

  static func proverbSnapshot(for date: Date = Date()) -> ProverbSnapshot {
    let script = selectedScript()
    let proverbs = loadProverbs()
    guard !proverbs.isEmpty else {
      return ProverbSnapshot(mandarin: "熟能生巧", pinyin: "Shú néng shēng qiǎo", english: "Practice makes perfect.")
    }

    let dayOfYear = calendarDayOfYear(for: date)
    let index = ((dayOfYear % proverbs.count) + proverbs.count) % proverbs.count
    let proverb = proverbs[index]
    let chinese = script == "traditional" ? (proverb.traditional ?? proverb.mandarin) : proverb.mandarin

    return ProverbSnapshot(
      mandarin: chinese,
      pinyin: proverb.pinyin,
      english: proverb.english
    )
  }
}

struct MandarinEntry: TimelineEntry {
  let date: Date
  let snapshot: MandarinSnapshot
}

struct ProverbEntry: TimelineEntry {
  let date: Date
  let snapshot: ProverbSnapshot
}

struct MandarinProvider: TimelineProvider {
  func placeholder(in context: Context) -> MandarinEntry {
    MandarinEntry(date: Date(), snapshot: WidgetDataStore.mandarinSnapshot())
  }

  func getSnapshot(in context: Context, completion: @escaping (MandarinEntry) -> Void) {
    completion(MandarinEntry(date: Date(), snapshot: WidgetDataStore.mandarinSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<MandarinEntry>) -> Void) {
    let now = Date()
    let entry = MandarinEntry(date: now, snapshot: WidgetDataStore.mandarinSnapshot(for: now))
    let reload = WidgetDataStore.nextUtcMidnight(from: now)
    completion(Timeline(entries: [entry], policy: .after(reload)))
  }
}

struct ProverbProvider: TimelineProvider {
  func placeholder(in context: Context) -> ProverbEntry {
    ProverbEntry(date: Date(), snapshot: WidgetDataStore.proverbSnapshot())
  }

  func getSnapshot(in context: Context, completion: @escaping (ProverbEntry) -> Void) {
    completion(ProverbEntry(date: Date(), snapshot: WidgetDataStore.proverbSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<ProverbEntry>) -> Void) {
    let now = Date()
    let entry = ProverbEntry(date: now, snapshot: WidgetDataStore.proverbSnapshot(for: now))
    let reload = WidgetDataStore.nextUtcMidnight(from: now)
    completion(Timeline(entries: [entry], policy: .after(reload)))
  }
}
