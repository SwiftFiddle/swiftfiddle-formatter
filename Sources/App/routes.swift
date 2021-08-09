import Foundation
import Vapor
import SwiftFormatConfiguration

func routes(_ app: Application) throws {
    app.get("health") { _ in ["status": "pass"] }

    app.get("playground") { (req) in
        return req.view.render("index")
    }

    app.webSocket { (req, ws) in
        let formatter = Formatter()

        ws.onText { (ws, text) in
            do {
                let output = try formatter.format(source: text)
                ws.send(output)
            } catch {
                req.logger.error("\(error)")
                ws.send(text)
            }
        }
    }

    app.webSocket("api", "ws") { (req, ws) in
        ws.onBinary { (ws, buffer) in
            do {
                guard let requestData = buffer.getData(at: 0, length: buffer.readableBytes) else { return }

                let decoder = JSONDecoder()
                let request = try decoder.decode(FormatRequest.self, from: requestData)
                guard let input = request.code.data(using: .utf8) else { return }

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

                process.standardInput = standardInput
                process.standardOutput = standardOutput
                process.standardError = standardError

                process.launch()
                process.waitUntilExit()

                let data = standardOutput.fileHandleForReading.readDataToEndOfFile()
                guard let output = String(data: data, encoding: .utf8) else { return }

                let errorData = standardError.fileHandleForReading.readDataToEndOfFile()
                guard let errorOutput = String(data: errorData, encoding: .utf8) else { return }
                if !errorOutput.isEmpty {
                    req.logger.info("\(errorOutput)")
                }

                let encoder = JSONEncoder()
                let response = try encoder.encode(
                    FormatResponse(
                        output: output,
                        error: errorOutput,
                        original: request.code
                    )
                )
                if let json = String(data: response, encoding: .utf8) {
                    ws.send(json)
                }
            } catch {
                req.logger.error("\(error)")
                ws.send("")
            }
        }
    }
}

struct FormatRequest: Codable {
    let code: String
    let configuration: Configuration?
}

struct FormatResponse: Codable {
    let output: String
    let error: String
    let original: String
}
