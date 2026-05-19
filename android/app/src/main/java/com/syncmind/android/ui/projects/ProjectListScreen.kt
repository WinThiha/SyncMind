package com.syncmind.android.ui.projects

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.ui.components.EmptyState
import com.syncmind.android.ui.components.LoadingState
import com.syncmind.android.ui.components.SearchBox
import com.syncmind.android.ui.components.SyncMindDestination
import com.syncmind.android.ui.components.SyncMindScaffold
import com.syncmind.android.ui.projects.components.ProjectItem
import com.syncmind.android.util.NetworkResult

@Composable
fun ProjectListScreen(
    onProjectClick: (Int) -> Unit,
    onCreateProjectClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onDashboardClick: () -> Unit,
    onGlobalIssuesClick: () -> Unit,
    onLogout: () -> Unit,
    viewModel: ProjectViewModel = hiltViewModel()
) {
    val projectsState by viewModel.projectsState

    SyncMindScaffold(
        title = "Project Flow",
        currentDestination = SyncMindDestination.Projects,
        onDashboardClick = onDashboardClick,
        onProjectsClick = { viewModel.getProjects() },
        onIssuesClick = onGlobalIssuesClick,
        onSettingsClick = onSettingsClick,
        onRefresh = { viewModel.getProjects() },
        floatingAction = onCreateProjectClick,
        floatingActionContentDescription = "Create project"
    ) { paddingValues ->
        when (val state = projectsState) {
            is NetworkResult.Loading -> LoadingState("Loading projects")
            is NetworkResult.Error -> {
                androidx.compose.foundation.layout.Column(
                    modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Project list could not load", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Text(state.message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
                    Button(onClick = { viewModel.getProjects() }, modifier = Modifier.padding(top = 12.dp)) {
                        Text("Retry")
                    }
                    Button(onClick = { viewModel.logout(onLogout) }, modifier = Modifier.padding(top = 8.dp)) {
                        Text("Log out")
                    }
                }
            }
            is NetworkResult.Success -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(paddingValues),
                    contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text("Projects", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                        Text(
                            "Choose a workspace or create a new project.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    item {
                        SearchBox(text = "", placeholder = "Search projects...")
                    }
                    if (state.data.isEmpty()) {
                        item {
                            EmptyState(
                                title = "No projects yet",
                                body = "Create your first workspace or accept an invitation to start tracking work."
                            )
                        }
                    } else {
                        items(state.data) { project ->
                            ProjectItem(
                                project = project,
                                onClick = { onProjectClick(project.id) }
                            )
                        }
                    }
                    item {
                        Button(onClick = { viewModel.logout(onLogout) }, modifier = Modifier.fillMaxWidth()) {
                            Text("Log out")
                        }
                    }
                }
            }
        }
    }
}
