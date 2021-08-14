import Foundation
import Vapor
import SwiftFormatConfiguration

func routes(_ app: Application) throws {
    app.get("health") { _ in ["status": "pass"] }

    app.webSocket { (req, ws) in
        ws.onText { (ws, text) in
            do {
                let (output, _) = try format(
                    source: text,
                    configuration: nil
                )
                ws.send(output)
            } catch {
                req.logger.error("\(error)")
                ws.send(text)
            }
        }
    }

    func format(source: String, configuration: Configuration?) throws -> (stdout: String, stderr: String) {
        return try exec(mode: "format", source: source, configuration: configuration)
    }

    func lint(source: String, configuration: Configuration?) throws -> (stdout: String, stderr: String) {
        return try exec(mode: "lint", source: source, configuration: configuration)
    }

    func exec(mode: String, source: String, configuration: Configuration?) throws -> (stdout: String, stderr: String) {
        guard let input = source.data(using: .utf8) else {
            throw Abort(.badRequest)
        }

        let temporaryDirectory = URL(fileURLWithPath: NSTemporaryDirectory())
        let configurationFile = temporaryDirectory.appendingPathComponent("\(UUID().uuidString).json")
        let encoder = JSONEncoder()
        try encoder
            .encode(configuration ?? Configuration())
            .write(to: configurationFile)

        let standardInput = Pipe()
        let standardOutput = Pipe()
        let standardError = Pipe()

        let fileHandle = standardInput.fileHandleForWriting
        fileHandle.write(input)
        try fileHandle.close()

        let process = Process()
        let executableURL = URL(
            fileURLWithPath: "\(app.directory.resourcesDirectory)formatter/.build/release/swift-format"
        )
        process.executableURL = executableURL
        process.arguments = ["--mode", mode, "--configuration", configurationFile.path]

        process.standardInput = standardInput
        process.standardOutput = standardOutput
        process.standardError = standardError

        process.launch()
        process.waitUntilExit()

        try? FileManager().removeItem(at: configurationFile)

        let stdoutData = standardOutput.fileHandleForReading.readDataToEndOfFile()
        guard let stdout = String(data: stdoutData, encoding: .utf8) else {
            throw Abort(.internalServerError)
        }

        let stderrData = standardError.fileHandleForReading.readDataToEndOfFile()
        guard let stderr = String(data: stderrData, encoding: .utf8) else {
            throw Abort(.internalServerError)
        }

        return (stdout, stderr)
    }
}

private struct FormatRequest: Codable {
    let code: String
    let configuration: Configuration?
}

private struct FormatResponse: Content {
    let output: String
    let error: String
    let lintMessage: String
    let original: String
}
