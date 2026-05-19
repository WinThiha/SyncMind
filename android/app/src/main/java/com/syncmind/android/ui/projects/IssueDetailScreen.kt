package com.syncmind.android.ui.projects

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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.IssueComment
import com.syncmind.android.data.model.IssueHistory
import com.syncmind.android.data.model.ThreadSummary
import com.syncmind.android.ui.components.EmptyState
import com.syncmind.android.ui.components.StatusChip
import com.syncmind.android.ui.components.SyncMindCard
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IssueDetailScreen(
    projectId: Int,
    issueKey: String,
    onEdit: (Int, String) -> Unit,
    onDeleted: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: IssueDetailViewModel = hiltViewModel()
) {
    val issueState by viewModel.issueState
    val commentDraft by viewModel.commentDraft
    val commentSubmitState by viewModel.commentSubmitState
    val deleteState by viewModel.deleteState
    val summaryState by viewModel.summaryState
    var confirmDelete by remember { mutableStateOf(false) }

    LaunchedEffect(projectId, issueKey) {
        viewModel.load(projectId, issueKey)
    }

    LaunchedEffect(deleteState) {
        if (deleteState is NetworkResult.Success && confirmDelete) {
            confirmDelete = false
            onDeleted(projectId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(issueTitle(issueState, issueKey)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { onEdit(projectId, issueKey) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = { confirmDelete = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete")
                    }
                    IconButton(onClick = { viewModel.load(projectId, issueKey) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = issueState) {
            is NetworkResult.Loading -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is NetworkResult.Error -> {
                Text(
                    text = "Error: ${state.message}",
                    modifier = Modifier
                        .padding(paddingValues)
                        .padding(16.dp),
                    color = MaterialTheme.colorScheme.error
                )
            }
            is NetworkResult.Success -> IssueDetailContent(
                issue = state.data,
                commentDraft = commentDraft,
                commentSubmitState = commentSubmitState,
                summaryState = summaryState,
                onCommentDraftChange = viewModel::onCommentDraftChange,
                onPostComment = { viewModel.postComment(projectId, issueKey) },
                onSummarize = { viewModel.summarizeIssue(projectId, issueKey) },
                onRegenerateSummary = { viewModel.summarizeIssue(projectId, issueKey, force = true) },
                paddingValues = paddingValues
            )
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete issue?") },
            text = {
                Text(
                    if (deleteState is NetworkResult.Error) {
                        "Delete failed: ${(deleteState as NetworkResult.Error).message}"
                    } else {
                        "This action cannot be undone."
                    }
                )
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.deleteIssue(projectId, issueKey) },
                    enabled = deleteState !is NetworkResult.Loading
                ) {
                    Text(if (deleteState is NetworkResult.Loading) "Deleting..." else "Delete")
                }
            },
            dismissButton = {
                Button(onClick = { confirmDelete = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun IssueDetailContent(
    issue: Issue,
    commentDraft: String,
    commentSubmitState: NetworkResult<Unit>,
    summaryState: NetworkResult<ThreadSummary>?,
    onCommentDraftChange: (String) -> Unit,
    onPostComment: () -> Unit,
    onSummarize: () -> Unit,
    onRegenerateSummary: () -> Unit,
    paddingValues: PaddingValues
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 12.dp)
    ) {
        item {
            SyncMindCard {
                Text(
                    text = issue.key,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )
                Text(text = issue.summary, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusChip(issue.status)
                    AssistChip(onClick = {}, label = { Text(issue.priority.capitalized()) })
                    AssistChip(onClick = {}, label = { Text(issue.issue_type.capitalized()) })
                }
                DetailText(
                    label = "People",
                    value = listOfNotNull(
                        issue.assignee?.name?.let { "Assignee: $it" } ?: "Unassigned",
                        issue.creator?.name?.let { "Reporter: $it" }
                    ).joinToString(" • ")
                )
                DetailText(
                    label = "Dates",
                    value = listOfNotNull(
                        "Created: ${issue.created_at}",
                        issue.due_date?.let { "Due: $it" }
                    ).joinToString(" • ")
                )
                DetailText(
                    label = "Estimate",
                    value = listOfNotNull(
                        issue.estimated_hours?.let { "Estimated: $it h" },
                        issue.actual_hours?.let { "Actual: $it h" }
                    ).ifEmpty { listOf("No time tracked") }.joinToString(" • ")
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            SyncMindCard {
                SectionTitle("Description")
                Text(
                    text = issue.description?.takeIf { it.isNotBlank() } ?: "No description",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(20.dp))
            IssueSummarySection(
                summaryState = summaryState,
                onSummarize = onSummarize,
                onRegenerateSummary = onRegenerateSummary
            )
            Spacer(modifier = Modifier.height(20.dp))
            SectionTitle("Comments")
        }

        if (issue.comments.isEmpty()) {
            item { EmptyState("No comments", "Start the discussion with the composer below.") }
        } else {
            items(issue.comments) { comment ->
                CommentRow(comment)
            }
        }

        item {
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = commentDraft,
                onValueChange = onCommentDraftChange,
                label = { Text("Add a comment") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
                enabled = commentSubmitState !is NetworkResult.Loading
            )
            if (commentSubmitState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = commentSubmitState.message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onPostComment,
                enabled = commentDraft.isNotBlank() && commentSubmitState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (commentSubmitState is NetworkResult.Loading) "Posting..." else "Post comment")
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
            SectionTitle("History")
        }

        if (issue.history.isEmpty()) {
            item { EmptyState("No history", "Field changes will appear in this activity log.") }
        } else {
            items(issue.history) { entry ->
                HistoryRow(entry)
            }
        }
    }
}

@Composable
private fun IssueSummarySection(
    summaryState: NetworkResult<ThreadSummary>?,
    onSummarize: () -> Unit,
    onRegenerateSummary: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        SectionTitle("AI thread summary")
        when (summaryState) {
            is NetworkResult.Loading -> {
                CircularProgressIndicator()
            }
            is NetworkResult.Error -> {
                Text(
                    text = summaryState.message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onSummarize) {
                    Text("Try again")
                }
            }
            is NetworkResult.Success -> {
                Text(
                    text = summaryState.data.summary,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                SummaryList("Decisions", summaryState.data.decisions)
                summaryState.data.consensus?.takeIf { it.isNotBlank() }?.let { consensus ->
                    Spacer(modifier = Modifier.height(8.dp))
                    DetailText(label = "Consensus", value = consensus)
                }
                SummaryList("Action items", summaryState.data.action_items)
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onRegenerateSummary) {
                    Text("Regenerate summary")
                }
            }
            null -> {
                Text(
                    text = "Generate a concise summary of comments and history.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onSummarize) {
                    Text("Summarize thread")
                }
            }
        }
    }
}

@Composable
private fun SummaryList(label: String, items: List<String>) {
    if (items.isEmpty()) return

    Spacer(modifier = Modifier.height(8.dp))
    Text(
        text = label,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
    items.forEach { item ->
        Text(
            text = "- $item",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

@Composable
private fun DetailText(label: String, value: String) {
    Spacer(modifier = Modifier.height(8.dp))
    Text(
        text = label,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
    Text(text = value, style = MaterialTheme.typography.bodyMedium)
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold
    )
    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
private fun CommentRow(comment: IssueComment) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = comment.user?.name ?: "Unknown user",
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = comment.content,
            style = MaterialTheme.typography.bodyMedium
        )
        Text(
            text = comment.created_at,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider()
    }
}

@Composable
private fun HistoryRow(entry: IssueHistory) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = listOfNotNull(
                entry.user?.name ?: "System",
                entry.field?.let { "changed ${it.replace('_', ' ')}" }
            ).joinToString(" "),
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = listOfNotNull(entry.old_value, entry.new_value)
                .joinToString(" -> ")
                .ifBlank { entry.created_at },
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider()
    }
}

@Composable
private fun EmptySection(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

private fun issueTitle(issueState: NetworkResult<Issue>, fallback: String): String {
    return when (issueState) {
        is NetworkResult.Success -> issueState.data.key
        else -> fallback.ifBlank { "Issue" }
    }
}

private fun String.capitalized(): String = replaceFirstChar { it.uppercase() }
