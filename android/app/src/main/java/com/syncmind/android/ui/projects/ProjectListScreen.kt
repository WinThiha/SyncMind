package com.syncmind.android.ui.projects

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.ui.projects.components.ProjectItem
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectListScreen(
    onLogout: () -> Unit,
    viewModel: ProjectViewModel = hiltViewModel()
) {
    val projectsState by viewModel.projectsState

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Projects") },
                actions = {
                    IconButton(onClick = { viewModel.getProjects() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                    IconButton(onClick = { viewModel.logout(onLogout) }) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            when (val state = projectsState) {
                is NetworkResult.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        Text(
                            text = "No projects found",
                            modifier = Modifier.align(Alignment.Center),
                            style = MaterialTheme.typography.bodyLarge
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            items(state.data) { project ->
                                ProjectItem(project = project)
                            }
                        }
                    }
                }
                is NetworkResult.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error: ${state.message}",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.getProjects() }) {
                            Text("Retry")
                        }
                    }
                }
            }
        }
    }
}
