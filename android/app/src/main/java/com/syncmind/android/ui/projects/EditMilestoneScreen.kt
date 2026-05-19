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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.MilestoneDateSuggestion
import com.syncmind.android.data.model.MilestoneIssueSuggestion
import com.syncmind.android.data.model.MilestoneRiskResult
import com.syncmind.android.data.model.MilestoneSummaryResult
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditMilestoneScreen(
    projectId: Int,
    milestoneId: Int,
    onBack: () -> Unit,
    onMilestoneUpdated: (Int) -> Unit,
    onMilestoneDeleted: (Int) -> Unit,
    viewModel: EditMilestoneViewModel = hiltViewModel()
) {
    val milestoneState by viewModel.milestoneState
    val saveState by viewModel.saveState
    val deleteState by viewModel.deleteState
    val dateSuggestionState by viewModel.dateSuggestionState
    val summaryState by viewModel.summaryState
    val riskState by viewModel.riskState
    val issueSuggestionsState by viewModel.issueSuggestionsState
    val name by viewModel.name
    val description by viewModel.description
    val startDate by viewModel.startDate
    val dueDate by viewModel.dueDate
    val status by viewModel.status
    var showDeleteDialog by remember { mutableStateOf(false) }

    LaunchedEffect(projectId, milestoneId) {
        viewModel.load(projectId, milestoneId)
    }

    LaunchedEffect(saveState) {
        if (saveState is NetworkResult.Success) {
            val milestone = (saveState as NetworkResult.Success<Milestone>).data
            if (milestone.id > 0) {
                onMilestoneUpdated(projectId)
            }
        }
    }

    LaunchedEffect(deleteState) {
        if (deleteState is NetworkResult.Success) {
            onMilestoneDeleted(projectId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit milestone") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete milestone")
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
            when (val state = milestoneState) {
                is NetworkResult.Loading -> CircularProgressIndicator()
                is NetworkResult.Error -> Text(
                    text = "Error: ${state.message}",
                    color = MaterialTheme.colorScheme.error
                )
                is NetworkResult.Success -> {
                    OutlinedTextField(
                        value = name,
                        onValueChange = viewModel::onNameChange,
                        label = { Text("Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = description,
                        onValueChange = viewModel::onDescriptionChange,
                        label = { Text("Description") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { viewModel.suggestDates(projectId, milestoneId) },
                        enabled = dateSuggestionState !is NetworkResult.Loading,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (dateSuggestionState is NetworkResult.Loading) "Thinking..." else "Suggest dates")
                    }
                    DateSuggestionStatus(dateSuggestionState)
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = startDate,
                            onValueChange = viewModel::onStartDateChange,
                            label = { Text("Start date") },
                            placeholder = { Text("YYYY-MM-DD") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = dueDate,
                            onValueChange = viewModel::onDueDateChange,
                            label = { Text("Due date") },
                            placeholder = { Text("YYYY-MM-DD") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text("Status", style = MaterialTheme.typography.labelLarge)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("open", "in_progress", "closed").forEach { option ->
                            FilterChip(
                                selected = status == option,
                                onClick = { viewModel.onStatusChange(option) },
                                label = { Text(option.replace('_', ' ').replaceFirstChar { it.uppercase() }) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(18.dp))
                    MilestoneAiInsights(
                        summaryState = summaryState,
                        riskState = riskState,
                        issueSuggestionsState = issueSuggestionsState,
                        onSummarize = { viewModel.summarizeMilestone(projectId, milestoneId) },
                        onRegenerateSummary = { viewModel.summarizeMilestone(projectId, milestoneId, force = true) },
                        onAnalyzeRisk = { viewModel.analyzeRisk(projectId, milestoneId) },
                        onRegenerateRisk = { viewModel.analyzeRisk(projectId, milestoneId, force = true) },
                        onSuggestIssues = { viewModel.suggestIssues(projectId, milestoneId) }
                    )
                    if (saveState is NetworkResult.Error) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = (saveState as NetworkResult.Error).message,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = { viewModel.save(projectId, milestoneId) },
                        enabled = name.isNotBlank() && saveState !is NetworkResult.Loading,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (saveState is NetworkResult.Loading) "Saving..." else "Save milestone")
                    }
                }
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete milestone?") },
            text = {
                Column {
                    Text("This milestone will be removed from the project.")
                    if (deleteState is NetworkResult.Error) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = (deleteState as NetworkResult.Error).message,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    enabled = deleteState !is NetworkResult.Loading,
                    onClick = { viewModel.deleteMilestone(projectId, milestoneId) }
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(
                    enabled = deleteState !is NetworkResult.Loading,
                    onClick = { showDeleteDialog = false }
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun MilestoneAiInsights(
    summaryState: NetworkResult<MilestoneSummaryResult>?,
    riskState: NetworkResult<MilestoneRiskResult>?,
    issueSuggestionsState: NetworkResult<List<MilestoneIssueSuggestion>>?,
    onSummarize: () -> Unit,
    onRegenerateSummary: () -> Unit,
    onAnalyzeRisk: () -> Unit,
    onRegenerateRisk: () -> Unit,
    onSuggestIssues: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text("AI insights", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        AiSummaryBlock(summaryState, onSummarize, onRegenerateSummary)
        Spacer(modifier = Modifier.height(12.dp))
        AiRiskBlock(riskState, onAnalyzeRisk, onRegenerateRisk)
        Spacer(modifier = Modifier.height(12.dp))
        AiIssueSuggestionsBlock(issueSuggestionsState, onSuggestIssues)
    }
}

@Composable
private fun AiSummaryBlock(
    state: NetworkResult<MilestoneSummaryResult>?,
    onSummarize: () -> Unit,
    onRegenerate: () -> Unit
) {
    Text("Summary", style = MaterialTheme.typography.labelLarge)
    when (state) {
        is NetworkResult.Loading -> CircularProgressIndicator()
        is NetworkResult.Error -> {
            Text(state.message, color = MaterialTheme.colorScheme.error)
            Button(onClick = onSummarize) { Text("Try again") }
        }
        is NetworkResult.Success -> {
            Text(
                text = state.data.summary,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Button(onClick = onRegenerate) { Text("Regenerate summary") }
        }
        null -> Button(onClick = onSummarize) { Text("Summarize milestone") }
    }
}

@Composable
private fun AiRiskBlock(
    state: NetworkResult<MilestoneRiskResult>?,
    onAnalyze: () -> Unit,
    onRegenerate: () -> Unit
) {
    Text("Risk analysis", style = MaterialTheme.typography.labelLarge)
    when (state) {
        is NetworkResult.Loading -> CircularProgressIndicator()
        is NetworkResult.Error -> {
            Text(state.message, color = MaterialTheme.colorScheme.error)
            Button(onClick = onAnalyze) { Text("Try again") }
        }
        is NetworkResult.Success -> {
            Text(
                text = state.data.verdict.replace('_', ' ').replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.titleSmall
            )
            state.data.signals.forEach { signal ->
                Text("- $signal", style = MaterialTheme.typography.bodyMedium)
            }
            Text(
                text = state.data.recommendation,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Button(onClick = onRegenerate) { Text("Regenerate risk") }
        }
        null -> Button(onClick = onAnalyze) { Text("Analyze risk") }
    }
}

@Composable
private fun AiIssueSuggestionsBlock(
    state: NetworkResult<List<MilestoneIssueSuggestion>>?,
    onSuggest: () -> Unit
) {
    Text("Issue suggestions", style = MaterialTheme.typography.labelLarge)
    when (state) {
        is NetworkResult.Loading -> CircularProgressIndicator()
        is NetworkResult.Error -> {
            Text(state.message, color = MaterialTheme.colorScheme.error)
            Button(onClick = onSuggest) { Text("Try again") }
        }
        is NetworkResult.Success -> {
            if (state.data.isEmpty()) {
                Text(
                    text = "No issue suggestions",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                state.data.forEach { suggestion ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "${suggestion.key} • ${(suggestion.score * 100).toInt()}%",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = suggestion.summary,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = suggestion.reason,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        null -> Button(onClick = onSuggest) { Text("Suggest issues") }
    }
}

@Composable
private fun DateSuggestionStatus(state: NetworkResult<MilestoneDateSuggestion>?) {
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
            Text(
                text = state.data.rationale,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodySmall
            )
        }
        is NetworkResult.Loading, null -> Unit
    }
}
