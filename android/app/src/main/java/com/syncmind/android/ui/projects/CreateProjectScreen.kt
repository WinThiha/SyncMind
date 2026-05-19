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
fun CreateProjectScreen(
    onBack: () -> Unit,
    onProjectCreated: (Int) -> Unit,
    viewModel: CreateProjectViewModel = hiltViewModel()
) {
    val createState by viewModel.createState
    val name by viewModel.name
    val key by viewModel.key
    val icon by viewModel.icon
    val issueTypes by viewModel.issueTypes

    LaunchedEffect(createState) {
        if (createState is NetworkResult.Success) {
            val project = (createState as NetworkResult.Success<Project>).data
            if (project.id > 0) {
                onProjectCreated(project.id)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New project") },
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
                label = { Text("Project name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = key,
                onValueChange = viewModel::onKeyChange,
                label = { Text("Project key") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                supportingText = { Text("2-10 letters, stored uppercase") }
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
                modifier = Modifier.fillMaxWidth(),
                supportingText = { Text("Comma-separated") }
            )
            if (createState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = (createState as NetworkResult.Error).message,
                    color = MaterialTheme.colorScheme.error
                )
            }
            Spacer(modifier = Modifier.height(18.dp))
            Button(
                onClick = { viewModel.create() },
                enabled = name.isNotBlank() && key.length >= 2 && createState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (createState is NetworkResult.Loading) "Creating..." else "Create project")
            }
        }
    }
}
