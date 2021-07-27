import Foundation
import Vapor

func routes(_ app: Application) throws {
    app.get("health") { _ in ["status": "pass"] }

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
}
