package com.syncmind.android.ui.issues

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
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.IssuesSummary
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.SimilarIssue
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
fun GlobalIssuesScreen(
    onBack: () -> Unit,
    onDashboardClick: (() -> Unit)? = null,
    onProjectsClick: (() -> Unit)? = null,
    onSettingsClick: (() -> Unit)? = null,
    viewModel: GlobalIssuesViewModel = hiltViewModel()
) {
    val issuesState by viewModel.issuesState
    val summaryState by viewModel.summaryState
    val projectsState by viewModel.projectsState
    val selectedProjectId by viewModel.selectedProjectId
    val similarQuery by viewModel.similarQuery
    val similarIssuesState by viewModel.similarIssuesState

    SyncMindScaffold(
        title = "Project Flow",
        currentDestination = SyncMindDestination.Issues,
        onDashboardClick = onDashboardClick,
        onProjectsClick = onProjectsClick,
        onIssuesClick = viewModel::load,
        onSettingsClick = onSettingsClick,
        onBack = onBack,
        onRefresh = viewModel::load
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text("Global Issues", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                Text(
                    "Your personal work queue across active projects.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            item { SummarySection(summaryState) }
            item {
                SimilarSearchSection(
                    projectsState = projectsState,
                    selectedProjectId = selectedProjectId,
                    query = similarQuery,
                    similarIssuesState = similarIssuesState,
                    onSelectedProjectChange = viewModel::onSelectedProjectChange,
                    onQueryChange = viewModel::onSimilarQueryChange,
                    onSearch = viewModel::searchSimilarIssues
                )
            }
            item { SectionHeader("Issues") }
            when (val state = issuesState) {
                is NetworkResult.Loading -> item { LoadingState("Loading issues") }
                is NetworkResult.Error -> item {
                    SyncMindCard {
                        Text("Issues could not load", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        Text(state.message, color = MaterialTheme.colorScheme.error)
                        Button(onClick = viewModel::load) { Text("Retry") }
                    }
                }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        item { EmptyState("No issues found", "Try clearing filters or checking another project.") }
                    } else {
                        items(state.data) { issue -> IssueCard(issue) }
                    }
                }
            }
        }
    }
}

@Composable
private fun SimilarSearchSection(
    projectsState: NetworkResult<List<Project>>,
    selectedProjectId: Int?,
    query: String,
    similarIssuesState: NetworkResult<List<SimilarIssue>>?,
    onSelectedProjectChange: (Int) -> Unit,
    onQueryChange: (String) -> Unit,
    onSearch: () -> Unit
) {
    SyncMindCard {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            androidx.compose.material3.Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Column(modifier = Modifier.weight(1f)) {
                Text("AI similar search", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("Find duplicates or related work by meaning.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        when (projectsState) {
            is NetworkResult.Loading -> Text("Loading projects...", color = MaterialTheme.colorScheme.onSurfaceVariant)
            is NetworkResult.Error -> Text(projectsState.message, color = MaterialTheme.colorScheme.error)
            is NetworkResult.Success -> {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    projectsState.data.take(4).forEach { project ->
                        FilterChip(
                            selected = selectedProjectId == project.id,
                            onClick = { onSelectedProjectChange(project.id) },
                            label = { Text(project.key.uppercase()) }
                        )
                    }
                }
            }
        }
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            label = { Text("Describe the issue") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2
        )
        Button(
            onClick = onSearch,
            enabled = selectedProjectId != null && query.isNotBlank() && similarIssuesState !is NetworkResult.Loading,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (similarIssuesState is NetworkResult.Loading) "Searching..." else "Find similar issues")
        }
        SimilarResults(similarIssuesState)
    }
}

@Composable
private fun SimilarResults(state: NetworkResult<List<SimilarIssue>>?) {
    when (state) {
        is NetworkResult.Loading -> Text("Searching with AI...", color = MaterialTheme.colorScheme.onSurfaceVariant)
        is NetworkResult.Error -> Text(state.message, color = MaterialTheme.colorScheme.error)
        is NetworkResult.Success -> {
            if (state.data.isEmpty()) {
                Text("No similar issues found", color = MaterialTheme.colorScheme.onSurfaceVariant)
            } else {
                state.data.forEach { issue ->
                    Text(
                        text = listOfNotNull(issue.full_key ?: issue.key, "${(issue.similarity * 100).toInt()}% match").joinToString(" • "),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(issue.summary, style = MaterialTheme.typography.bodyMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        }
        null -> Unit
    }
}

@Composable
private fun SummarySection(state: NetworkResult<IssuesSummary>) {
    when (state) {
        is NetworkResult.Loading -> SyncMindCard { Text("Loading summary...", color = MaterialTheme.colorScheme.onSurfaceVariant) }
        is NetworkResult.Error -> SyncMindCard { Text(state.message, color = MaterialTheme.colorScheme.error) }
        is NetworkResult.Success -> {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("Assigned", state.data.assigned_to_me.toString(), Modifier.weight(1f), Icons.AutoMirrored.Filled.List)
                MetricCard("Overdue", state.data.overdue.toString(), Modifier.weight(1f), Icons.Default.Warning, SyncErrorContainer, MaterialTheme.colorScheme.error)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard("High", state.data.high_priority.toString(), Modifier.weight(1f), Icons.Default.Warning)
                MetricCard("Unassigned", state.data.unassigned.toString(), Modifier.weight(1f), Icons.AutoMirrored.Filled.List)
            }
        }
    }
}

@Composable
private fun IssueCard(issue: Issue) {
    SyncMindCard {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PriorityStrip(priority = issue.priority)
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(
                        text = listOfNotNull(issue.project_name ?: issue.project_key, issue.key).joinToString(" • "),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    StatusChip(issue.status)
                }
                Text(issue.summary, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                Text(
                    text = issue.description?.takeIf { it.isNotBlank() } ?: "No description",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = listOfNotNull(issue.assignee?.name ?: "Unassigned", issue.due_date ?: "No due date").joinToString(" • "),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
