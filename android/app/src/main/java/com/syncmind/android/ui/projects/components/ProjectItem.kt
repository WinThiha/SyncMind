package com.syncmind.android.ui.projects.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.syncmind.android.data.model.Project

@Composable
fun ProjectItem(project: Project) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = project.name,
                    style = MaterialTheme.typography.titleLarge
                )
                Badge(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                ) {
                    Text(text = project.key.uppercase())
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Key: ${project.key}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            if (!project.issue_types.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Issue Types: ${project.issue_types.joinToString(", ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
