package com.syncmind.android.ui.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.DashboardActivity
import com.syncmind.android.data.model.DashboardData
import com.syncmind.android.data.model.DashboardIssuePreview
import com.syncmind.android.data.model.DashboardProjectHealth
import com.syncmind.android.ui.components.EmptyState
import com.syncmind.android.ui.components.LoadingState
import com.syncmind.android.ui.components.MetricCard
import com.syncmind.android.ui.components.PriorityStrip
import com.syncmind.android.ui.components.SectionHeader
import com.syncmind.android.ui.components.StatusChip
import com.syncmind.android.ui.components.SyncMindCard
import com.syncmind.android.ui.components.SyncMindDestination
import com.syncmind.android.ui.components.SyncMindScaffold
import com.syncmind.android.ui.theme.SyncErrorContainer
import com.syncmind.android.util.NetworkResult

@Composable
fun DashboardScreen(
    onBack: () -> Unit,
    onProjectsClick: (() -> Unit)? = null,
    onIssuesClick: (() -> Unit)? = null,
    onSettingsClick: (() -> Unit)? = null,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val dashboardState by viewModel.dashboardState

    SyncMindScaffold(
        title = "Project Flow",
        currentDestination = SyncMindDestination.Dashboard,
        onDashboardClick = viewModel::load,
        onProjectsClick = onProjectsClick,
        onIssuesClick = onIssuesClick,
        onSettingsClick = onSettingsClick,
        onRefresh = viewModel::load,
        onBack = onBack
    ) { paddingValues ->
        when (val state = dashboardState) {
            is NetworkResult.Loading -> LoadingState("Loading dashboard")
            is NetworkResult.Error -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Dashboard could not load", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Text(state.message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
                    Button(onClick = viewModel::load, modifier = Modifier.padding(top = 12.dp)) { Text("Retry") }
                }
            }
            is NetworkResult.Success -> DashboardContent(state.data, paddingValues)
        }
    }
}

@Composable
private fun DashboardContent(data: DashboardData, paddingValues: PaddingValues) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(paddingValues),
        contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Good morning.", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
            Text(
                "Here is your high-level overview for today.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Projects", data.summary.active_projects.toString(), Modifier.weight(1f), Icons.Default.Home)
                MetricCard("My open issues", data.summary.my_open_issues.toString(), Modifier.weight(1f), Icons.AutoMirrored.Filled.List)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Due soon", data.summary.due_soon.toString(), Modifier.weight(1f), Icons.AutoMirrored.Filled.List)
                MetricCard("Overdue", data.summary.overdue.toString(), Modifier.weight(1f), Icons.Default.Warning, SyncErrorContainer, MaterialTheme.colorScheme.error)
            }
        }
        item { SectionHeader("Project health") }
        if (data.project_health.isEmpty()) {
            item { EmptyState("No project health data", "Project progress will appear once there is activity.") }
        } else {
            items(data.project_health) { ProjectHealthCard(it) }
        }
        item { SectionHeader("My work") }
        if (data.my_work.isEmpty()) {
            item { EmptyState("No assigned work", "Assigned issues and upcoming tasks will appear here.") }
        } else {
            items(data.my_work) { IssuePreviewCard(it) }
        }
        item { SectionHeader("Recent activity") }
        if (data.recent_activity.isEmpty()) {
            item { EmptyState("No recent activity", "Team updates will appear after issues start moving.") }
        } else {
            items(data.recent_activity) { ActivityCard(it) }
        }
    }
}

@Composable
private fun IssuePreviewCard(issue: DashboardIssuePreview) {
    SyncMindCard {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PriorityStrip(issue.priority)
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(issue.key, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                    StatusChip(issue.status)
                }
                Text(issue.summary, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text(
                    listOfNotNull(issue.project_name, issue.due_date ?: "No due date").joinToString(" • "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun ProjectHealthCard(project: DashboardProjectHealth) {
    SyncMindCard {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(modifier = Modifier.weight(1f)) {
                Text(project.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text("${project.key} • ${project.members_count} members", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text("${project.progress}%", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
        }
        LinearProgressIndicator(
            progress = { project.progress.coerceIn(0, 100) / 100f },
            modifier = Modifier.fillMaxWidth().height(8.dp),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
        Text(
            "${project.issues_count} issues • ${project.overdue_issues_count} overdue",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun ActivityCard(activity: DashboardActivity) {
    SyncMindCard {
        Text(
            text = activity.text ?: listOfNotNull(activity.actor, activity.issue_key, activity.project_name).joinToString(" "),
            style = MaterialTheme.typography.bodyMedium
        )
        activity.created_at?.let {
            Text(it, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
