// Persoon-uitsnede met Apple Vision: leest een video en schrijft per frame een grijs masker (wit = persoon) naar stdout.
// Zo steekt het hoofd van de spreker boven de box uit. Bouwen en gebruiken:
//   swiftc -O tools/uitsnede.swift -o analyse/uitsnede
//   ./analyse/uitsnede public/speaker.mp4 | ffmpeg -y -f rawvideo -pix_fmt gray -s 1080x1920 -r 30 -i - -c:v libx264 -crf 12 -pix_fmt yuv420p analyse/masker.mp4
//   ffmpeg -y -i public/speaker.mp4 -i analyse/masker.mp4 -filter_complex "[1:v]format=gray,gblur=sigma=1.2[m];[0:v][m]alphamerge,format=yuva444p10le" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le public/speaker_alpha.mov
// Zet daarna "alpha": true in src/data/meta.json.
import AVFoundation
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 2 else {
    FileHandle.standardError.write("gebruik: uitsnede <video>\n".data(using: .utf8)!)
    exit(1)
}
let url = URL(fileURLWithPath: args[1])
let asset = AVURLAsset(url: url)
guard let track = asset.tracks(withMediaType: .video).first else {
    FileHandle.standardError.write("geen videospoor\n".data(using: .utf8)!)
    exit(1)
}
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(output)
reader.startReading()

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
let uit = FileHandle.standardOutput
let breedte = 1080, hoogte = 1920
var frames = 0

while let sample = output.copyNextSampleBuffer() {
    guard let pixels = CMSampleBufferGetImageBuffer(sample) else { continue }
    let handler = VNImageRequestHandler(cvPixelBuffer: pixels, options: [:])
    try handler.perform([request])
    guard let masker = request.results?.first?.pixelBuffer else { continue }
    // Masker opschalen naar de videomaat en als ruwe grijswaarden wegschrijven.
    let ci = CIImage(cvPixelBuffer: masker)
    let sx = CGFloat(breedte) / ci.extent.width, sy = CGFloat(hoogte) / ci.extent.height
    let geschaald = ci.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
    let context = CIContext(options: [.workingColorSpace: NSNull()])
    var buffer = [UInt8](repeating: 0, count: breedte * hoogte)
    buffer.withUnsafeMutableBytes { ptr in
        context.render(geschaald, toBitmap: ptr.baseAddress!, rowBytes: breedte, bounds: CGRect(x: 0, y: 0, width: breedte, height: hoogte), format: .L8, colorSpace: nil)
    }
    uit.write(Data(buffer))
    frames += 1
}
FileHandle.standardError.write("\(frames) frames gemaskerd\n".data(using: .utf8)!)
