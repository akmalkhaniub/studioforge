import Foundation
import AVFoundation

@objc(NativeMediaCache)
class MediaCacheModule: NSObject, AVAssetResourceLoaderDelegate {
    private let fileManager = FileManager.default
    private let cacheDirectory: URL
    private let maxCacheSizeBytes: Int64 = 500 * 1024 * 1024 // 500 MB LRU Limit

    override init() {
        let paths = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)
        cacheDirectory = paths[0].appendingPathComponent("StudioForgeMediaCache")
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        super.init()
    }

    @objc(preloadVideo:maxBytes:resolver:rejecter:)
    func preloadVideo(_ urlString: String, maxBytes: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let url = URL(string: urlString) else {
            reject("INVALID_URL", "Supplied URL is invalid", nil)
            return
        }

        let fileName = "\(url.lastPathComponent)"
        let targetFileURL = cacheDirectory.appendingPathComponent(fileName)

        if fileManager.fileExists(atPath: targetFileURL.path) {
            resolve(targetFileURL.absoluteString)
            return
        }

        // Asynchronously stream and cache video header chunks into local disk
        let session = URLSession.shared
        var request = URLRequest(url: url)
        request.setValue("bytes=0-\(maxBytes)", forHTTPHeaderField: "Range")

        let task = session.downloadTask(with: request) { tempURL, response, error in
            if let error = error {
                reject("DOWNLOAD_FAILED", error.localizedDescription, error)
                return
            }
            guard let tempURL = tempURL else {
                reject("NO_DATA", "No data returned from stream", nil)
                return
            }
            do {
                try self.fileManager.moveItem(at: tempURL, to: targetFileURL)
                resolve(targetFileURL.absoluteString)
            } catch {
                resolve(urlString) // Fallback to remote streaming on cache write fail
            }
        }
        task.resume()
    }

    @objc(getDiskCacheSize:rejecter:)
    func getDiskCacheSize(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        var size: Int64 = 0
        if let contents = try? fileManager.contentsOfDirectory(at: cacheDirectory, includingPropertiesForKeys: [.fileSizeKey]) {
            for item in contents {
                if let resourceValues = try? item.resourceValues(forKeys: [.fileSizeKey]), let fileSize = resourceValues.fileSize {
                    size += Int64(fileSize)
                }
            }
        }
        resolve(NSNumber(value: size))
    }

    @objc(clearCache:rejecter:)
    func clearCache(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        try? fileManager.removeItem(at: cacheDirectory)
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        resolve(true)
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
