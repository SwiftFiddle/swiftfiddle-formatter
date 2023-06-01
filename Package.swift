// swift-tools-version:5.8
import PackageDescription

let package = Package(
  name: "swiftfiddle-format",
  platforms: [
    .macOS(.v10_15)
  ],
  dependencies: [
    .package(url: "https://github.com/vapor/vapor.git", from: "4.77.0"),
    .package(url: "https://github.com/vapor/leaf.git", from: "4.2.4"),
    .package(url: "https://github.com/apple/swift-format.git", from: "508.0.1"),
  ],
  targets: [
    .executableTarget(
      name: "App",
      dependencies: [
        .product(name: "Vapor", package: "vapor"),
        .product(name: "Leaf", package: "leaf"),
        .product(name: "SwiftFormat", package: "swift-format"),
      ],
      swiftSettings: [
        .unsafeFlags(["-cross-module-optimization"], .when(configuration: .release))
      ]
    ),
  ]
)
