import Foundation
import Vapor
import SwiftFormatConfiguration

func routes(_ app: Application) throws {
    app.get("health") { _ in ["status": "pass"] }

    app.get { (req) in
        return req.view.render("index")
    }

    app.webSocket("api", "ws") { (req, ws) in
        ws.onBinary { (ws, buffer) in
            do {
                guard let requestData = buffer.getData(at: 0, length: buffer.readableBytes) else { return }

                let decoder = JSONDecoder()
                let request = try decoder.decode(FormatRequest.self, from: requestData)

                let encoder = JSONEncoder()
                let (output, error) = try format(
                    source: request.code,
                    configuration: request.configuration
                )
                let (_, lintMessage) = try lint(
                    source: request.code,
                    configuration: request.configuration
                )

                let response = FormatResponse(
                    output: output,
                    error: error,
                    lintMessage: lintMessage,
                    original: request.code
                )
                if let message = String(data: try encoder.encode(response), encoding: .utf8) {
                    ws.send(message)
                }
            } catch {
                req.logger.error("\(error)")
                ws.send("")
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

private struct FormatResponse: Codable {
    let output: String
    let error: String
    let lintMessage: String
    let original: String
}
