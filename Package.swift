// swift-tools-version:5.4
import PackageDescription

let package = Package(
    name: "swiftfiddle-format",
    platforms: [
        .macOS(.v10_15)
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.48.3"),
        .package(url: "https://github.com/vapor/leaf.git", from: "4.1.2"),
        .package(url: "https://github.com/apple/swift-format.git", from: "0.50400.0"),
    ],
    targets: [
        .target(
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
        .executableTarget(name: "Run", dependencies: [.target(name: "App")]),
    ]
)
