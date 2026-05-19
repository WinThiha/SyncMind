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
import androidx.compose.material.icons.filled.Refresh
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.ProjectInvitation
import com.syncmind.android.data.model.ProjectMember
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectMembersScreen(
    projectId: Int,
    onBack: () -> Unit,
    viewModel: ProjectMembersViewModel = hiltViewModel()
) {
    val membersState by viewModel.membersState
    val invitationsState by viewModel.invitationsState
    val operationState by viewModel.operationState
    val email by viewModel.email
    val newRole by viewModel.newRole
    val newPosition by viewModel.newPosition
    val roleDrafts by viewModel.roleDrafts
    val positionDrafts by viewModel.positionDrafts

    LaunchedEffect(projectId) {
        viewModel.load(projectId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Project members") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
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
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                AddMemberSection(
                    email = email,
                    role = newRole,
                    position = newPosition,
                    busy = operationState is NetworkResult.Loading,
                    onEmailChange = viewModel::onEmailChange,
                    onRoleChange = viewModel::onNewRoleChange,
                    onPositionChange = viewModel::onNewPositionChange,
                    onAdd = { viewModel.addMember(projectId) }
                )
                OperationStatus(operationState)
            }

            when (val state = membersState) {
                is NetworkResult.Loading -> item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator()
                    }
                }
                is NetworkResult.Error -> item {
                    Text(
                        text = "Error: ${state.message}",
                        color = MaterialTheme.colorScheme.error
                    )
                }
                is NetworkResult.Success -> {
                    if (state.data.isEmpty()) {
                        item {
                            Text(
                                text = "No members found",
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        items(state.data) { member ->
                            MemberEditor(
                                member = member,
                                role = roleDrafts[member.id] ?: member.pivot?.role ?: "normal",
                                position = positionDrafts[member.id] ?: member.pivot?.position.orEmpty(),
                                busy = operationState is NetworkResult.Loading,
                                onRoleChange = { viewModel.onRoleDraftChange(member.id, it) },
                                onPositionChange = { viewModel.onPositionDraftChange(member.id, it) },
                                onSave = { viewModel.updateMember(projectId, member.id) },
                                onTransferOwnership = { viewModel.transferOwnership(projectId, member.id) },
                                onRemove = { viewModel.removeMember(projectId, member.id) }
                            )
                        }
                    }
                }
            }

            item {
                InvitationsSection(
                    invitationsState = invitationsState,
                    busy = operationState is NetworkResult.Loading,
                    onCancel = { invitationId ->
                        viewModel.cancelInvitation(projectId, invitationId)
                    }
                )
            }
        }
    }
}

@Composable
private fun AddMemberSection(
    email: String,
    role: String,
    position: String,
    busy: Boolean,
    onEmailChange: (String) -> Unit,
    onRoleChange: (String) -> Unit,
    onPositionChange: (String) -> Unit,
    onAdd: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Add or invite member",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = email,
            onValueChange = onEmailChange,
            label = { Text("Email address") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(8.dp))
        RoleSelector(role = role, onRoleChange = onRoleChange)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = position,
            onValueChange = onPositionChange,
            label = { Text("Position") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = onAdd,
            enabled = !busy,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (busy) "Working..." else "Add / invite")
        }
    }
}

@Composable
private fun MemberEditor(
    member: ProjectMember,
    role: String,
    position: String,
    busy: Boolean,
    onRoleChange: (String) -> Unit,
    onPositionChange: (String) -> Unit,
    onSave: () -> Unit,
    onTransferOwnership: () -> Unit,
    onRemove: () -> Unit
) {
    val isAdmin = member.pivot?.role == "admin"

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(
            text = member.name,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = member.email,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        RoleSelector(role = role, onRoleChange = onRoleChange)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = position,
            onValueChange = onPositionChange,
            label = { Text("Position") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = onSave,
                enabled = !busy,
                modifier = Modifier.weight(1f)
            ) {
                Text("Save")
            }
            if (isAdmin) {
                TextButton(
                    onClick = onTransferOwnership,
                    enabled = !busy,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Transfer ownership")
                }
            }
            TextButton(
                onClick = onRemove,
                enabled = !busy,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Delete, contentDescription = null)
                Text("Remove")
            }
        }
    }
}

@Composable
private fun InvitationsSection(
    invitationsState: NetworkResult<List<ProjectInvitation>>,
    busy: Boolean,
    onCancel: (Int) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Pending invitations",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        when (invitationsState) {
            is NetworkResult.Loading -> CircularProgressIndicator()
            is NetworkResult.Error -> Text(
                text = "Error: ${invitationsState.message}",
                color = MaterialTheme.colorScheme.error
            )
            is NetworkResult.Success -> {
                if (invitationsState.data.isEmpty()) {
                    Text(
                        text = "No pending invitations",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        invitationsState.data.forEach { invitation ->
                            InvitationItem(
                                invitation = invitation,
                                busy = busy,
                                onCancel = { onCancel(invitation.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InvitationItem(
    invitation: ProjectInvitation,
    busy: Boolean,
    onCancel: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(
            text = invitation.email,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = listOfNotNull(
                invitation.role.replaceFirstChar { it.uppercase() },
                invitation.position,
                "Expires ${invitation.expires_at.take(10)}"
            ).joinToString(" • "),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextButton(
            onClick = onCancel,
            enabled = !busy
        ) {
            Icon(Icons.Default.Delete, contentDescription = null)
            Text("Cancel invitation")
        }
    }
}

@Composable
private fun RoleSelector(
    role: String,
    onRoleChange: (String) -> Unit
) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("normal", "admin").forEach { option ->
            FilterChip(
                selected = role == option,
                onClick = { onRoleChange(option) },
                label = { Text(option.replaceFirstChar { it.uppercase() }) }
            )
        }
    }
}

@Composable
private fun OperationStatus(state: NetworkResult<String>?) {
    when (state) {
        is NetworkResult.Error -> Text(
            text = state.message,
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodyMedium
        )
        is NetworkResult.Success -> Text(
            text = state.data,
            color = MaterialTheme.colorScheme.primary,
            style = MaterialTheme.typography.bodyMedium
        )
        is NetworkResult.Loading -> Unit
        null -> Unit
    }
}
