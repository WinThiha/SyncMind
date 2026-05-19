package com.syncmind.android.ui.projects

import androidx.compose.foundation.layout.Column
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
import com.syncmind.android.data.model.Project
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProjectScreen(
    projectId: Int,
    onBack: () -> Unit,
    onProjectUpdated: (Int) -> Unit,
    viewModel: EditProjectViewModel = hiltViewModel()
) {
    val projectState by viewModel.projectState
    val saveState by viewModel.saveState
    val name by viewModel.name
    val icon by viewModel.icon
    val issueTypes by viewModel.issueTypes

    LaunchedEffect(projectId) {
        viewModel.load(projectId)
    }

    LaunchedEffect(saveState) {
        if (saveState is NetworkResult.Success) {
            val project = (saveState as NetworkResult.Success<Project>).data
            if (project.id > 0) {
                onProjectUpdated(project.id)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit project") },
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
                is NetworkResult.Success -> {
                    Text(state.data.key.uppercase(), style = MaterialTheme.typography.labelLarge)
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = name,
                        onValueChange = viewModel::onNameChange,
                        label = { Text("Project name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = icon,
                        onValueChange = viewModel::onIconChange,
                        label = { Text("Icon URL") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = issueTypes,
                        onValueChange = viewModel::onIssueTypesChange,
                        label = { Text("Issue types") },
                        supportingText = { Text("Comma-separated") },
                        modifier = Modifier.fillMaxWidth()
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
                        onClick = { viewModel.save(projectId) },
                        enabled = name.isNotBlank() && saveState !is NetworkResult.Loading,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (saveState is NetworkResult.Loading) "Saving..." else "Save project")
                    }
                }
            }
        }
    }
}
