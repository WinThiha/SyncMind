package com.syncmind.android.ui.projects

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.ProjectMember
import com.syncmind.android.ui.components.EmptyState
import com.syncmind.android.ui.components.StatusChip
import com.syncmind.android.ui.components.SyncMindCard
import com.syncmind.android.ui.projects.components.IssueItem
import com.syncmind.android.ui.projects.components.MilestoneItem
import com.syncmind.android.ui.projects.components.WikiPageItem
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    projectId: Int,
    onIssueClick: (Int, String) -> Unit,
    onCreateIssueClick: (Int) -> Unit,
    onCreateMilestoneClick: (Int) -> Unit,
    onMilestoneClick: (Int, Int) -> Unit,
    onWikiPageClick: (Int, Int) -> Unit,
    onCreateWikiPageClick: (Int) -> Unit,
    onEditProjectClick: (Int) -> Unit,
    onManageMembersClick: (Int) -> Unit,
    onDeleted: () -> Unit,
    onBack: () -> Unit,
    viewModel: ProjectDetailViewModel = hiltViewModel()
) {
    val projectState by viewModel.projectState
    val issuesState by viewModel.issuesState
    val milestonesState by viewModel.milestonesState
    val wikiPagesState by viewModel.wikiPagesState
    val deleteState by viewModel.deleteState
    var showDeleteDialog by remember { mutableStateOf(false) }

    LaunchedEffect(projectId) {
        viewModel.load(projectId)
    }

    LaunchedEffect(deleteState) {
        if (deleteState is NetworkResult.Success) {
            onDeleted()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(projectTitle(projectState)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { onEditProjectClick(projectId) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit project")
                    }
                    IconButton(onClick = { showDeleteDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete project")
                    }
                    IconButton(onClick = { viewModel.load(projectId) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            item {
                when (val state = projectState) {
                    is NetworkResult.Loading -> LoadingSection()
                    is NetworkResult.Error -> ErrorSection(state.message)
                    is NetworkResult.Success -> {
                        ProjectOverview(state.data)
                        Spacer(modifier = Modifier.height(18.dp))
                        ProjectMembersSection(
                            members = state.data.members,
                            onManageMembersClick = { onManageMembersClick(projectId) }
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(18.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Issues", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Button(onClick = { onCreateIssueClick(projectId) }) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Text("New")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            when (val state = issuesState) {
                is NetworkResult.Loading -> item { LoadingSection() }
                is NetworkResult.Error -> item { ErrorSection(state.message) }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        item {
                            EmptyState("No issues found", "Create the first issue for this project.")
                        }
                    } else {
                        items(state.data) { issue ->
                            IssueItem(
                                issue = issue,
                                onClick = { onIssueClick(projectId, issue.key) }
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(18.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Milestones", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Button(onClick = { onCreateMilestoneClick(projectId) }) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Text("New")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            when (val state = milestonesState) {
                is NetworkResult.Loading -> item { LoadingSection() }
                is NetworkResult.Error -> item { ErrorSection(state.message) }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        item {
                            EmptyState("No milestones found", "Milestone progress and AI insights will appear here.")
                        }
                    } else {
                        items(state.data) { milestone ->
                            MilestoneItem(
                                milestone = milestone,
                                onClick = { onMilestoneClick(projectId, milestone.id) }
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(18.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Wiki", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Button(onClick = { onCreateWikiPageClick(projectId) }) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Text("New")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            when (val state = wikiPagesState) {
                is NetworkResult.Loading -> item { LoadingSection() }
                is NetworkResult.Error -> item { ErrorSection(state.message) }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        item {
                            EmptyState("No wiki pages found", "Add project notes, decisions, and reference material.")
                        }
                    } else {
                        items(state.data) { page ->
                            WikiPageItem(
                                page = page,
                                onClick = { onWikiPageClick(projectId, page.id) }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete project?") },
            text = {
                Column {
                    Text("This project and its related work will be removed.")
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
                    onClick = { viewModel.deleteProject(projectId) }
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
private fun ProjectMembersSection(
    members: List<ProjectMember>,
    onManageMembersClick: () -> Unit
) {
    SyncMindCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Members",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold
            )
            Button(onClick = onManageMembersClick) {
                Text("Manage")
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        if (members.isEmpty()) {
            Text(
                text = "No members found",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                members.forEach { member ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = member.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = listOfNotNull(
                                member.email,
                                member.pivot?.role?.replace('_', ' '),
                                member.pivot?.position
                            ).joinToString(" • "),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ProjectOverview(project: Project) {
    SyncMindCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = project.name,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = project.key.uppercase(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            StatusChip("${project.members.size} members")
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = listOfNotNull(
                project.issues_count?.let { "$it issues" },
                project.members_count?.let { "$it members" },
                project.creator?.name?.let { "Owner: $it" }
            ).ifEmpty { listOf("Project details loaded") }.joinToString(" • "),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        if (project.issue_types.isNotEmpty()) {
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                project.issue_types.take(3).forEach { type ->
                    AssistChip(onClick = {}, label = { Text(type) })
                }
            }
        }
    }
}

@Composable
private fun LoadingSection() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun ErrorSection(message: String) {
    Text(
        text = "Error: $message",
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodyLarge
    )
}

private fun projectTitle(projectState: NetworkResult<Project>): String {
    return when (projectState) {
        is NetworkResult.Success -> projectState.data.name
        else -> "Project"
    }
}
