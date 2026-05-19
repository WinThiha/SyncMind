package com.syncmind.android.ui.projects

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.IssueAISuggestion
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.SimilarIssue
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateIssueScreen(
    projectId: Int,
    onBack: () -> Unit,
    onIssueCreated: (Int, String) -> Unit,
    viewModel: CreateIssueViewModel = hiltViewModel()
) {
    val projectState by viewModel.projectState
    val createState by viewModel.createState
    val aiSuggestionState by viewModel.aiSuggestionState
    val similarIssuesState by viewModel.similarIssuesState
    val summary by viewModel.summary
    val description by viewModel.description
    val issueType by viewModel.issueType
    val priority by viewModel.priority
    val estimatedHours by viewModel.estimatedHours
    val dueDate by viewModel.dueDate

    LaunchedEffect(projectId) {
        viewModel.load(projectId)
    }

    LaunchedEffect(createState) {
        if (createState is NetworkResult.Success) {
            val issue = (createState as NetworkResult.Success<Issue>).data
            if (issue.key.isNotBlank()) {
                onIssueCreated(projectId, issue.key)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New issue") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            when (val state = projectState) {
                is NetworkResult.Loading -> CircularProgressIndicator()
                is NetworkResult.Error -> Text(
                    text = "Error: ${state.message}",
                    color = MaterialTheme.colorScheme.error
                )
                is NetworkResult.Success -> CreateIssueForm(
                    project = state.data,
                    summary = summary,
                    description = description,
                    issueType = issueType,
                    priority = priority,
                    estimatedHours = estimatedHours,
                    dueDate = dueDate,
                    createState = createState,
                    aiSuggestionState = aiSuggestionState,
                    similarIssuesState = similarIssuesState,
                    onSummaryChange = viewModel::onSummaryChange,
                    onDescriptionChange = viewModel::onDescriptionChange,
                    onIssueTypeChange = viewModel::onIssueTypeChange,
                    onPriorityChange = viewModel::onPriorityChange,
                    onEstimatedHoursChange = viewModel::onEstimatedHoursChange,
                    onDueDateChange = viewModel::onDueDateChange,
                    onSuggestWithAi = { viewModel.suggestWithAi(projectId) },
                    onCreate = { viewModel.create(projectId) }
                )
            }
        }
    }
}

@Composable
private fun CreateIssueForm(
    project: Project,
    summary: String,
    description: String,
    issueType: String,
    priority: String,
    estimatedHours: String,
    dueDate: String,
    createState: NetworkResult<Issue>,
    aiSuggestionState: NetworkResult<IssueAISuggestion>?,
    similarIssuesState: NetworkResult<List<SimilarIssue>>?,
    onSummaryChange: (String) -> Unit,
    onDescriptionChange: (String) -> Unit,
    onIssueTypeChange: (String) -> Unit,
    onPriorityChange: (String) -> Unit,
    onEstimatedHoursChange: (String) -> Unit,
    onDueDateChange: (String) -> Unit,
    onSuggestWithAi: () -> Unit,
    onCreate: () -> Unit
) {
    val issueTypes = project.issue_types.ifEmpty { listOf("Task", "Bug", "Request") }

    Text(text = project.name, style = MaterialTheme.typography.titleMedium)
    Spacer(modifier = Modifier.height(12.dp))
    OutlinedTextField(
        value = summary,
        onValueChange = onSummaryChange,
        label = { Text("Summary") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    Spacer(modifier = Modifier.height(8.dp))
    Button(
        onClick = onSuggestWithAi,
        enabled = summary.isNotBlank() && aiSuggestionState !is NetworkResult.Loading,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(if (aiSuggestionState is NetworkResult.Loading) "Thinking..." else "Suggest with AI")
    }
    AiSuggestionStatus(aiSuggestionState)
    SimilarIssuesSection(similarIssuesState)
    Spacer(modifier = Modifier.height(10.dp))
    OutlinedTextField(
        value = description,
        onValueChange = onDescriptionChange,
        label = { Text("Description") },
        modifier = Modifier.fillMaxWidth(),
        minLines = 4
    )
    Spacer(modifier = Modifier.height(14.dp))
    Text("Issue type", style = MaterialTheme.typography.labelLarge)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        issueTypes.forEach { type ->
            FilterChip(
                selected = issueType == type,
                onClick = { onIssueTypeChange(type) },
                label = { Text(type) }
            )
        }
    }
    Spacer(modifier = Modifier.height(14.dp))
    Text("Priority", style = MaterialTheme.typography.labelLarge)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("low", "normal", "high").forEach { option ->
            FilterChip(
                selected = priority == option,
                onClick = { onPriorityChange(option) },
                label = { Text(option.replaceFirstChar { it.uppercase() }) }
            )
        }
    }
    Spacer(modifier = Modifier.height(10.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(
            value = estimatedHours,
            onValueChange = onEstimatedHoursChange,
            label = { Text("Estimate") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )
        OutlinedTextField(
            value = dueDate,
            onValueChange = onDueDateChange,
            label = { Text("Due date") },
            modifier = Modifier.weight(1f),
            singleLine = true,
            placeholder = { Text("YYYY-MM-DD") }
        )
    }
    if (createState is NetworkResult.Error) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = createState.message,
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodyMedium
        )
    }
    Spacer(modifier = Modifier.height(18.dp))
    Button(
        onClick = onCreate,
        enabled = summary.isNotBlank() && createState !is NetworkResult.Loading,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(if (createState is NetworkResult.Loading) "Creating..." else "Create issue")
    }
}

@Composable
private fun AiSuggestionStatus(state: NetworkResult<IssueAISuggestion>?) {
    when (state) {
        is NetworkResult.Error -> {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = state.message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }
        is NetworkResult.Success -> {
            Spacer(modifier = Modifier.height(6.dp))
            val assigneeText = state.data.assignee_suggestions.joinToString(" • ") {
                "Assignee #${it.assignee_id}: ${it.reason}"
            }
            Text(
                text = if (assigneeText.isBlank()) {
                    "AI suggestions applied"
                } else {
                    "AI suggestions applied. $assigneeText"
                },
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodySmall
            )
        }
        is NetworkResult.Loading, null -> Unit
    }
}

@Composable
private fun SimilarIssuesSection(state: NetworkResult<List<SimilarIssue>>?) {
    when (state) {
        is NetworkResult.Loading -> {
            Spacer(modifier = Modifier.height(8.dp))
            CircularProgressIndicator()
        }
        is NetworkResult.Error -> {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Similar issue lookup failed: ${state.message}",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }
        is NetworkResult.Success -> {
            if (state.data.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text("Similar issues", style = MaterialTheme.typography.labelLarge)
                state.data.forEach { issue ->
                    Text(
                        text = listOfNotNull(
                            issue.key ?: "#${issue.key_number}",
                            issue.status,
                            issue.priority,
                            "${(issue.similarity * 100).toInt()}%"
                        ).joinToString(" • "),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = issue.summary,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                }
            }
        }
        null -> Unit
    }
}
