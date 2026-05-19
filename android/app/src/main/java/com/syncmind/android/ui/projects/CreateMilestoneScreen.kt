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
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.MilestoneDateSuggestion
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateMilestoneScreen(
    projectId: Int,
    onBack: () -> Unit,
    onMilestoneCreated: (Int) -> Unit,
    viewModel: CreateMilestoneViewModel = hiltViewModel()
) {
    val createState by viewModel.createState
    val dateSuggestionState by viewModel.dateSuggestionState
    val name by viewModel.name
    val description by viewModel.description
    val startDate by viewModel.startDate
    val dueDate by viewModel.dueDate
    val status by viewModel.status

    LaunchedEffect(createState) {
        if (createState is NetworkResult.Success) {
            val milestone = (createState as NetworkResult.Success<Milestone>).data
            if (milestone.id > 0) {
                onMilestoneCreated(projectId)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New milestone") },
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
                onClick = { viewModel.suggestDates(projectId) },
                enabled = name.isNotBlank() && dateSuggestionState !is NetworkResult.Loading,
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
            if (createState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = (createState as NetworkResult.Error).message,
                    color = MaterialTheme.colorScheme.error
                )
            }
            Spacer(modifier = Modifier.height(18.dp))
            Button(
                onClick = { viewModel.create(projectId) },
                enabled = name.isNotBlank() && createState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (createState is NetworkResult.Loading) "Creating..." else "Create milestone")
            }
        }
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
