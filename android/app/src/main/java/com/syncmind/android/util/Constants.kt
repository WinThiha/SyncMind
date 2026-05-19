package com.syncmind.android.util

import com.syncmind.android.BuildConfig

object Constants {
    val BASE_URL: String = BuildConfig.API_BASE_URL
    val WEB_BASE_URL: String = BuildConfig.WEB_BASE_URL.trimEnd('/')
}
