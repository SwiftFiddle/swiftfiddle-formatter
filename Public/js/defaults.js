"use strict";

export const Defaults = {
  code: `import UIKit

struct Timeline<Element>: RandomAccessCollection {
  var storage: [Date: Element] = [:]

  var startIndex = DateIndex(Date.distantPast)
  var endIndex = DateIndex(Date.distantPast)

  subscript(i: DateIndex) -> Element? {
    get {
      return storage[i.date]
    }
    set {
      if isEmpty {
        startIndex = i
        endIndex = index(after: i)
      } else if i < startIndex {
        startIndex = i
      } else if i >= endIndex {
        endIndex = index(after: i)
      }

      storage[i.date] = newValue
    }
  }

  func index(after i: DateIndex) -> DateIndex {
    let nextDay = calendar.date(byAdding: DateComponents(day: 1), to: i.date)!
    return DateIndex(nextDay)
  }

  func distance(from start: DateIndex, to end: DateIndex) -> Int {
    return calendar.dateComponents([.day], from: start.date, to: end.date).day!
  }
}
`,
};
