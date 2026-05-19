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
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.Issue
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditIssueScreen(
    projectId: Int,
    issueKey: String,
    onBack: () -> Unit,
    onIssueUpdated: (Int, String) -> Unit,
    viewModel: EditIssueViewModel = hiltViewModel()
) {
    val issueState by viewModel.issueState
    val saveState by viewModel.saveState
    val summary by viewModel.summary
    val description by viewModel.description
    val status by viewModel.status
    val priority by viewModel.priority
    val issueType by viewModel.issueType
    val estimatedHours by viewModel.estimatedHours
    val actualHours by viewModel.actualHours
    val dueDate by viewModel.dueDate

    LaunchedEffect(projectId, issueKey) {
        viewModel.load(projectId, issueKey)
    }

    LaunchedEffect(saveState) {
        if (saveState is NetworkResult.Success) {
            val issue = (saveState as NetworkResult.Success<Issue>).data
            if (issue.key.isNotBlank()) {
                onIssueUpdated(projectId, issue.key)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit issue") },
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
            when (val state = issueState) {
                is NetworkResult.Loading -> CircularProgressIndicator()
                is NetworkResult.Error -> Text(
                    text = "Error: ${state.message}",
                    color = MaterialTheme.colorScheme.error
                )
                is NetworkResult.Success -> EditIssueForm(
                    summary = summary,
                    description = description,
                    status = status,
                    priority = priority,
                    issueType = issueType,
                    estimatedHours = estimatedHours,
                    actualHours = actualHours,
                    dueDate = dueDate,
                    saveState = saveState,
                    onSummaryChange = viewModel::onSummaryChange,
                    onDescriptionChange = viewModel::onDescriptionChange,
                    onStatusChange = viewModel::onStatusChange,
                    onPriorityChange = viewModel::onPriorityChange,
                    onIssueTypeChange = viewModel::onIssueTypeChange,
                    onEstimatedHoursChange = viewModel::onEstimatedHoursChange,
                    onActualHoursChange = viewModel::onActualHoursChange,
                    onDueDateChange = viewModel::onDueDateChange,
                    onSave = { viewModel.save(projectId, issueKey) }
                )
            }
        }
    }
}

@Composable
private fun EditIssueForm(
    summary: String,
    description: String,
    status: String,
    priority: String,
    issueType: String,
    estimatedHours: String,
    actualHours: String,
    dueDate: String,
    saveState: NetworkResult<Issue>,
    onSummaryChange: (String) -> Unit,
    onDescriptionChange: (String) -> Unit,
    onStatusChange: (String) -> Unit,
    onPriorityChange: (String) -> Unit,
    onIssueTypeChange: (String) -> Unit,
    onEstimatedHoursChange: (String) -> Unit,
    onActualHoursChange: (String) -> Unit,
    onDueDateChange: (String) -> Unit,
    onSave: () -> Unit
) {
    OutlinedTextField(
        value = summary,
        onValueChange = onSummaryChange,
        label = { Text("Summary") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    Spacer(modifier = Modifier.height(10.dp))
    OutlinedTextField(
        value = description,
        onValueChange = onDescriptionChange,
        label = { Text("Description") },
        modifier = Modifier.fillMaxWidth(),
        minLines = 4
    )
    Spacer(modifier = Modifier.height(14.dp))
    ChipRow("Status", listOf("open", "in_progress", "resolved", "closed"), status, onStatusChange)
    ChipRow("Priority", listOf("low", "normal", "high"), priority, onPriorityChange)
    ChipRow("Type", listOf(issueType, "Task", "Bug", "Request").distinct(), issueType, onIssueTypeChange)
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(
            value = estimatedHours,
            onValueChange = onEstimatedHoursChange,
            label = { Text("Estimate") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )
        OutlinedTextField(
            value = actualHours,
            onValueChange = onActualHoursChange,
            label = { Text("Actual") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )
    }
    Spacer(modifier = Modifier.height(10.dp))
    OutlinedTextField(
        value = dueDate,
        onValueChange = onDueDateChange,
        label = { Text("Due date") },
        placeholder = { Text("YYYY-MM-DD") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    if (saveState is NetworkResult.Error) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = saveState.message,
            color = MaterialTheme.colorScheme.error
        )
    }
    Spacer(modifier = Modifier.height(18.dp))
    Button(
        onClick = onSave,
        enabled = summary.isNotBlank() && saveState !is NetworkResult.Loading,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(if (saveState is NetworkResult.Loading) "Saving..." else "Save issue")
    }
}

@Composable
private fun ChipRow(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit
) {
    Spacer(modifier = Modifier.height(10.dp))
    Text(label, style = MaterialTheme.typography.labelLarge)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            FilterChip(
                selected = selected == option,
                onClick = { onSelected(option) },
                label = { Text(option.replace('_', ' ').replaceFirstChar { it.uppercase() }) }
            )
        }
    }
}
