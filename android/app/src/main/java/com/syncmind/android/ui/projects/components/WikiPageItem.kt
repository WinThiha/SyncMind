package com.syncmind.android.ui.projects.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.ui.components.SyncMindCard

@Composable
fun WikiPageItem(
    page: WikiPage,
    onClick: () -> Unit
) {
    SyncMindCard(onClick = onClick) {
        Text(
            text = page.title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = listOfNotNull(
                page.author?.name?.let { "Author: $it" },
                page.last_editor?.name?.let { "Last editor: $it" },
                "Updated: ${page.updated_at}"
            ).joinToString(" • "),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
