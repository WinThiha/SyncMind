package com.syncmind.android.ui.invitations

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.InvitationInfo
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvitationScreen(
    token: String,
    onBack: () -> Unit,
    onLogin: () -> Unit,
    onAccepted: (Int) -> Unit,
    viewModel: InvitationViewModel = hiltViewModel()
) {
    val invitationState by viewModel.invitationState
    val acceptState by viewModel.acceptState

    LaunchedEffect(token) {
        viewModel.load(token)
    }

    LaunchedEffect(acceptState) {
        val state = acceptState
        if (state is NetworkResult.Success) {
            onAccepted(state.data.project_id)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Invitation") },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (val state = invitationState) {
                is NetworkResult.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator()
                    }
                }
                is NetworkResult.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Button(onClick = { viewModel.load(token) }) {
                        Text("Retry")
                    }
                }
                is NetworkResult.Success -> {
                    InvitationDetails(invitation = state.data)
                    AcceptActions(
                        acceptState = acceptState,
                        onAccept = { viewModel.accept(token) },
                        onLogin = onLogin
                    )
                }
            }
        }
    }
}

@Composable
private fun InvitationDetails(invitation: InvitationInfo) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(
            text = "You're invited",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        invitation.inviter_name?.let { inviter ->
            Text(
                text = "$inviter invited you to join",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        DetailRow(label = "Project", value = invitation.project_name)
        DetailRow(label = "Role", value = invitation.role.replaceFirstChar { it.uppercase() })
        invitation.position?.let { position ->
            DetailRow(label = "Position", value = position)
        }
        DetailRow(label = "Expires", value = invitation.expires_at.take(10))
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun AcceptActions(
    acceptState: NetworkResult<*>?,
    onAccept: () -> Unit,
    onLogin: () -> Unit
) {
    val busy = acceptState is NetworkResult.Loading

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(
            onClick = onAccept,
            enabled = !busy,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (busy) "Joining..." else "Join project")
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                onClick = onLogin,
                enabled = !busy,
                modifier = Modifier.weight(1f)
            ) {
                Text("Log in")
            }
        }
        when (acceptState) {
            is NetworkResult.Error -> Text(
                text = acceptState.message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium
            )
            is NetworkResult.Success -> Text(
                text = "Invitation accepted",
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium
            )
            is NetworkResult.Loading, null -> Spacer(modifier = Modifier.height(0.dp))
        }
    }
}
