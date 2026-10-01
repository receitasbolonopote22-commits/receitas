import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
let outDir = args[1]
for path in args.dropFirst(2) {
  let url = URL(fileURLWithPath: path)
  guard let img = NSImage(contentsOf: url), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("fail \(path)"); continue }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.recognitionLanguages = ["pt-BR"]
  req.usesLanguageCorrection = true
  let h = VNImageRequestHandler(cgImage: cg, options: [:])
  try? h.perform([req])
  var arr: [[String: Any]] = []
  for o in (req.results ?? []) {
    guard let c = o.topCandidates(1).first else { continue }
    let b = o.boundingBox
    arr.append(["t": c.string, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height, "c": c.confidence])
  }
  let out = ["w": cg.width, "h": cg.height, "lines": arr] as [String : Any]
  let data = try! JSONSerialization.data(withJSONObject: out, options: [])
  let name = url.deletingPathExtension().lastPathComponent
  try! data.write(to: URL(fileURLWithPath: outDir + "/" + name + ".json"))
}
