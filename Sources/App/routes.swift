import Foundation
import Vapor
import SwiftFormatConfiguration

func routes(_ app: Application) throws {
    app.get("health") { _ in ["status": "pass"] }

    app.get("playground") { (req) in
        return req.view.render("index")
    }

    app.webSocket { (req, ws) in
        ws.onText { (ws, text) in
            let response = format(source: text)
            if !response.output.isEmpty {
                ws.send(response.output)
            }
        }
    }

    app.webSocket("api", "ws") { (req, ws) in
        ws.onBinary { (ws, buffer) in
            do {
                guard let requestData = buffer.getData(at: 0, length: buffer.readableBytes) else { return }

                let decoder = JSONDecoder()
                let request = try decoder.decode(FormatRequest.self, from: requestData)

                let encoder = JSONEncoder()
                let response = format(source: request.code)
                if let message = String(data: try encoder.encode(response), encoding: .utf8) {
                    ws.send(message)
                }
            } catch {
                req.logger.error("\(error)")
                ws.send("")
            }
        }
    }

    func format(source: String) -> FormatResponse {
        let errorResponse = FormatResponse(output: "", error: "", original: source)
        guard let input = source.data(using: .utf8) else {
            return errorResponse
        }

        let standardInput = Pipe()
        let standardOutput = Pipe()
        let standardError = Pipe()

        let fileHandle = standardInput.fileHandleForWriting
        fileHandle.write(input)
        do {
            try fileHandle.close()
        } catch {
            return errorResponse
        }

        let process = Process()
        let executableURL = URL(
            fileURLWithPath: "\(app.directory.resourcesDirectory)formatter/.build/release/swift-format"
        )
        process.executableURL = executableURL

        process.standardInput = standardInput
        process.standardOutput = standardOutput
        process.standardError = standardError

        process.launch()
        process.waitUntilExit()

        let data = standardOutput.fileHandleForReading.readDataToEndOfFile()
        guard let output = String(data: data, encoding: .utf8) else {
            return errorResponse
        }

        let errorData = standardError.fileHandleForReading.readDataToEndOfFile()
        guard let errorOutput = String(data: errorData, encoding: .utf8) else {
            return errorResponse
        }

        return FormatResponse(output: output, error: errorOutput, original: source)
    }
}

private struct FormatRequest: Codable {
    let code: String
    let configuration: Configuration?
}

private struct FormatResponse: Codable {
    let output: String
    let error: String
    let original: String
}
