// swift-tools-version:5.8
import PackageDescription

let package = Package(
    name: "formatter",
    platforms: [
        .macOS(.v10_15)
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-format.git", from: "602.0.0"),
    ]
)
