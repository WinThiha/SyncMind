package com.syncmind.android.ui.projects.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.ui.components.StatusChip
import com.syncmind.android.ui.components.SyncMindCard

@Composable
fun MilestoneItem(
    milestone: Milestone,
    onClick: () -> Unit
) {
    SyncMindCard(onClick = onClick) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = milestone.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                milestone.description?.takeIf { it.isNotBlank() }?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
            StatusChip(milestone.status)
        }
        LinearProgressIndicator(
            progress = { milestone.progress.percentage.coerceIn(0, 100) / 100f },
            modifier = Modifier.fillMaxWidth().height(8.dp),
            color = if (milestone.is_overdue) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
        Text(
            text = listOfNotNull(
                "${milestone.progress.completed}/${milestone.progress.total} issues",
                "${milestone.progress.percentage}%",
                milestone.due_date?.let { "Due: $it" },
                if (milestone.is_overdue) "Overdue" else null
            ).joinToString(" • "),
            style = MaterialTheme.typography.labelMedium,
            color = if (milestone.is_overdue) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
