package com.syncmind.android.ui.wiki

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.data.model.WikiAiChatMessage
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WikiPageScreen(
    projectId: Int,
    wikiPageId: Int,
    onEdit: (Int, Int) -> Unit,
    onDeleted: (Int) -> Unit,
    onBack: () -> Unit,
    viewModel: WikiPageViewModel = hiltViewModel()
) {
    val wikiPageState by viewModel.wikiPageState
    val deleteState by viewModel.deleteState
    val question by viewModel.question
    val chatState by viewModel.chatState
    val chatHistory by viewModel.chatHistory
    var confirmDelete by remember { mutableStateOf(false) }

    LaunchedEffect(projectId, wikiPageId) {
        viewModel.load(projectId, wikiPageId)
    }

    LaunchedEffect(deleteState) {
        if (deleteState is NetworkResult.Success && confirmDelete) {
            confirmDelete = false
            onDeleted(projectId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(wikiTitle(wikiPageState)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { onEdit(projectId, wikiPageId) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = { confirmDelete = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete")
                    }
                    IconButton(onClick = { viewModel.load(projectId, wikiPageId) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        when (val state = wikiPageState) {
            is NetworkResult.Loading -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is NetworkResult.Error -> {
                Text(
                    text = "Error: ${state.message}",
                    modifier = Modifier
                        .padding(paddingValues)
                        .padding(16.dp),
                    color = MaterialTheme.colorScheme.error
                )
            }
            is NetworkResult.Success -> WikiContent(
                page = state.data,
                paddingValues = paddingValues,
                question = question,
                chatState = chatState,
                chatHistory = chatHistory,
                onQuestionChange = viewModel::onQuestionChange,
                onAskWiki = { viewModel.askWiki(projectId) }
            )
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete wiki page?") },
            text = {
                Text(
                    if (deleteState is NetworkResult.Error) {
                        "Delete failed: ${(deleteState as NetworkResult.Error).message}"
                    } else {
                        "This action cannot be undone."
                    }
                )
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.delete(projectId, wikiPageId) },
                    enabled = deleteState !is NetworkResult.Loading
                ) {
                    Text(if (deleteState is NetworkResult.Loading) "Deleting..." else "Delete")
                }
            },
            dismissButton = {
                Button(onClick = { confirmDelete = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun WikiContent(
    page: WikiPage,
    paddingValues: PaddingValues,
    question: String,
    chatState: NetworkResult<String>?,
    chatHistory: List<WikiAiChatMessage>,
    onQuestionChange: (String) -> Unit,
    onAskWiki: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 12.dp)
    ) {
        item {
            Text(
                text = page.title,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = listOfNotNull(
                    page.author?.name?.let { "Author: $it" },
                    page.last_editor?.name?.let { "Last editor: $it" },
                    "Updated: ${page.updated_at}"
                ).joinToString(" • "),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(18.dp))
            Text(
                text = page.content?.takeIf { it.isNotBlank() } ?: "No content",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(24.dp))
            WikiAiChatSection(
                question = question,
                chatState = chatState,
                chatHistory = chatHistory,
                onQuestionChange = onQuestionChange,
                onAskWiki = onAskWiki
            )
        }
    }
}

@Composable
private fun WikiAiChatSection(
    question: String,
    chatState: NetworkResult<String>?,
    chatHistory: List<WikiAiChatMessage>,
    onQuestionChange: (String) -> Unit,
    onAskWiki: () -> Unit
) {
    Text(
        text = "Ask wiki AI",
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold
    )
    Spacer(modifier = Modifier.height(8.dp))
    chatHistory.takeLast(4).forEach { message ->
        Text(
            text = "${message.role.replaceFirstChar { it.uppercase() }}: ${message.content}",
            style = MaterialTheme.typography.bodySmall,
            color = if (message.role == "assistant") {
                MaterialTheme.colorScheme.onSurfaceVariant
            } else {
                MaterialTheme.colorScheme.primary
            }
        )
        Spacer(modifier = Modifier.height(6.dp))
    }
    OutlinedTextField(
        value = question,
        onValueChange = onQuestionChange,
        label = { Text("Question") },
        modifier = Modifier.fillMaxWidth(),
        minLines = 2
    )
    Spacer(modifier = Modifier.height(8.dp))
    Button(
        onClick = onAskWiki,
        enabled = question.isNotBlank() && chatState !is NetworkResult.Loading
    ) {
        Text(if (chatState is NetworkResult.Loading) "Asking..." else "Ask")
    }
    when (chatState) {
        is NetworkResult.Loading -> {
            Spacer(modifier = Modifier.height(8.dp))
            CircularProgressIndicator()
        }
        is NetworkResult.Error -> {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = chatState.message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }
        is NetworkResult.Success, null -> Unit
    }
}

private fun wikiTitle(state: NetworkResult<WikiPage>): String {
    return when (state) {
        is NetworkResult.Success -> state.data.title
        else -> "Wiki"
    }
}
