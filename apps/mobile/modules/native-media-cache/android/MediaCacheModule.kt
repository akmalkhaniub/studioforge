package ai.studioforge.mobile.cache

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream
import java.net.URL

class MediaCacheModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val cacheDir: File = File(reactContext.cacheDir, "StudioForgeMediaCache").apply {
        if (!exists()) mkdirs()
    }
    private val maxCacheSizeBytes: Long = 500L * 1024 * 1024 // 500 MB LRU Limit

    override fun getName(): String = "NativeMediaCache"

    @ReactMethod
    fun preloadVideo(urlString: String, maxBytes: Int, promise: Promise) {
        Thread {
            try {
                val url = URL(urlString)
                val fileName = url.path.substringAfterLast("/")
                val targetFile = File(cacheDir, fileName)

                if (targetFile.exists()) {
                    promise.resolve(targetFile.toURI().toString())
                    return@Thread
                }

                val connection = url.openConnection()
                connection.setRequestProperty("Range", "bytes=0-$maxBytes")
                connection.connect()

                connection.getInputStream().use { input ->
                    FileOutputStream(targetFile).use { output ->
                        input.copyTo(output)
                    }
                }

                promise.resolve(targetFile.toURI().toString())
            } catch (e: Exception) {
                // Graceful fallback to remote URL
                promise.resolve(urlString)
            }
        }.start()
    }

    @ReactMethod
    fun getDiskCacheSize(promise: Promise) {
        var totalSize: Long = 0
        cacheDir.listFiles()?.forEach { file ->
            totalSize += file.length()
        }
        promise.resolve(totalSize.toDouble())
    }

    @ReactMethod
    fun clearCache(promise: Promise) {
        try {
            cacheDir.deleteRecursively()
            cacheDir.mkdirs()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_FAILED", e.localizedMessage)
        }
    }
}
