package com.syncmind.android.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = SyncDarkPrimary,
    onPrimary = SyncOnSurface,
    primaryContainer = SyncPrimaryContainer,
    onPrimaryContainer = SyncOnPrimaryContainer,
    secondary = SyncSecondaryContainer,
    onSecondary = SyncOnSurface,
    secondaryContainer = SyncDarkSurfaceContainer,
    onSecondaryContainer = SyncDarkOnSurface,
    tertiary = SyncTertiaryContainer,
    background = SyncDarkBackground,
    onBackground = SyncDarkOnSurface,
    surface = SyncDarkSurface,
    onSurface = SyncDarkOnSurface,
    surfaceVariant = SyncDarkSurfaceContainer,
    onSurfaceVariant = SyncDarkOnSurfaceVariant,
    outline = SyncOutlineVariant,
    outlineVariant = SyncDarkSurfaceContainer,
    error = SyncError,
    errorContainer = SyncErrorContainer
)

private val LightColorScheme = lightColorScheme(
    primary = SyncPrimary,
    onPrimary = Color.White,
    primaryContainer = SyncPrimaryContainer,
    onPrimaryContainer = SyncOnPrimaryContainer,
    secondary = SyncSecondary,
    onSecondary = Color.White,
    secondaryContainer = SyncSecondaryContainer,
    onSecondaryContainer = SyncSecondary,
    tertiary = SyncTertiary,
    tertiaryContainer = SyncTertiaryContainer,
    background = SyncBackground,
    onBackground = SyncOnSurface,
    surface = SyncSurface,
    onSurface = SyncOnSurface,
    surfaceVariant = SyncSurfaceContainer,
    onSurfaceVariant = SyncOnSurfaceVariant,
    outline = SyncOutline,
    outlineVariant = SyncOutlineVariant,
    error = SyncError,
    errorContainer = SyncErrorContainer
)

@Composable
fun SyncMindTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
