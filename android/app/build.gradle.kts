import java.net.URI

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.kotlin.serialization)
    kotlin("kapt")
}

fun String.quoted(): String = "\"${replace("\\", "\\\\").replace("\"", "\\\"")}\""

fun com.android.build.api.dsl.ApplicationBuildType.configureEnvironment(
    apiBaseUrl: String,
    webBaseUrl: String,
    googleWebClientId: String,
    usesCleartextTraffic: Boolean
) {
    buildConfigField("String", "API_BASE_URL", apiBaseUrl.quoted())
    buildConfigField("String", "WEB_BASE_URL", webBaseUrl.quoted())
    buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", googleWebClientId.quoted())

    val webUri = URI(webBaseUrl)
    manifestPlaceholders["deepLinkScheme"] = webUri.scheme ?: "https"
    manifestPlaceholders["deepLinkHost"] = webUri.host ?: webBaseUrl.removePrefix("https://").removePrefix("http://")
    manifestPlaceholders["usesCleartextTraffic"] = usesCleartextTraffic.toString()
}

android {
    namespace = "com.syncmind.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.syncmind.android"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            configureEnvironment(
                apiBaseUrl = providers.gradleProperty("DEBUG_API_BASE_URL")
                    .orElse(providers.gradleProperty("API_BASE_URL"))
                    .orElse(providers.environmentVariable("DEBUG_API_BASE_URL"))
                    .orElse(providers.environmentVariable("API_BASE_URL"))
                    .orElse("http://10.0.2.2:8000/api/")
                    .get(),
                webBaseUrl = providers.gradleProperty("DEBUG_WEB_BASE_URL")
                    .orElse(providers.gradleProperty("WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("DEBUG_WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("WEB_BASE_URL"))
                    .orElse("http://10.0.2.2:3000")
                    .get(),
                googleWebClientId = providers.gradleProperty("DEBUG_GOOGLE_WEB_CLIENT_ID")
                    .orElse(providers.gradleProperty("GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("DEBUG_GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("GOOGLE_WEB_CLIENT_ID"))
                    .orElse("215212984118-leq5vuv3htr1fn2gaput2d8a61efss4b.apps.googleusercontent.com")
                    .get(),
                usesCleartextTraffic = true
            )
        }
        create("staging") {
            initWith(getByName("debug"))
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-staging"
            matchingFallbacks += listOf("debug")
            configureEnvironment(
                apiBaseUrl = providers.gradleProperty("STAGING_API_BASE_URL")
                    .orElse(providers.gradleProperty("API_BASE_URL"))
                    .orElse(providers.environmentVariable("STAGING_API_BASE_URL"))
                    .orElse(providers.environmentVariable("API_BASE_URL"))
                    .orElse("https://api.syncmind.xyz/api/")
                    .get(),
                webBaseUrl = providers.gradleProperty("STAGING_WEB_BASE_URL")
                    .orElse(providers.gradleProperty("WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("STAGING_WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("WEB_BASE_URL"))
                    .orElse("https://syncmind.xyz")
                    .get(),
                googleWebClientId = providers.gradleProperty("STAGING_GOOGLE_WEB_CLIENT_ID")
                    .orElse(providers.gradleProperty("GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("STAGING_GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("GOOGLE_WEB_CLIENT_ID"))
                    .orElse("215212984118-leq5vuv3htr1fn2gaput2d8a61efss4b.apps.googleusercontent.com")
                    .get(),
                usesCleartextTraffic = providers.gradleProperty("STAGING_USES_CLEARTEXT_TRAFFIC")
                    .orElse(providers.gradleProperty("USES_CLEARTEXT_TRAFFIC"))
                    .orElse(providers.environmentVariable("STAGING_USES_CLEARTEXT_TRAFFIC"))
                    .orElse(providers.environmentVariable("USES_CLEARTEXT_TRAFFIC"))
                    .orElse("false")
                    .get()
                    .toBoolean()
            )
        }
        release {
            isMinifyEnabled = false
            configureEnvironment(
                apiBaseUrl = providers.gradleProperty("RELEASE_API_BASE_URL")
                    .orElse(providers.gradleProperty("API_BASE_URL"))
                    .orElse(providers.environmentVariable("RELEASE_API_BASE_URL"))
                    .orElse(providers.environmentVariable("API_BASE_URL"))
                    .orElse("https://syncmind.xyz/api/")
                    .get(),
                webBaseUrl = providers.gradleProperty("RELEASE_WEB_BASE_URL")
                    .orElse(providers.gradleProperty("WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("RELEASE_WEB_BASE_URL"))
                    .orElse(providers.environmentVariable("WEB_BASE_URL"))
                    .orElse("https://syncmind.xyz")
                    .get(),
                googleWebClientId = providers.gradleProperty("RELEASE_GOOGLE_WEB_CLIENT_ID")
                    .orElse(providers.gradleProperty("GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("RELEASE_GOOGLE_WEB_CLIENT_ID"))
                    .orElse(providers.environmentVariable("GOOGLE_WEB_CLIENT_ID"))
                    .orElse("215212984118-leq5vuv3htr1fn2gaput2d8a61efss4b.apps.googleusercontent.com")
                    .get(),
                usesCleartextTraffic = providers.gradleProperty("RELEASE_USES_CLEARTEXT_TRAFFIC")
                    .orElse(providers.gradleProperty("USES_CLEARTEXT_TRAFFIC"))
                    .orElse(providers.environmentVariable("RELEASE_USES_CLEARTEXT_TRAFFIC"))
                    .orElse(providers.environmentVariable("USES_CLEARTEXT_TRAFFIC"))
                    .orElse("false")
                    .get()
                    .toBoolean()
            )
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)

    // Hilt
    implementation(libs.hilt.android.library)
    kapt(libs.hilt.compiler.library)

    // Networking
    implementation(libs.retrofit)
    implementation(libs.retrofit.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

    // Serialization
    implementation(libs.kotlinx.serialization.json)

    // Security
    implementation(libs.androidx.security.crypto)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

kapt {
    correctErrorTypes = true
}
