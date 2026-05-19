package com.syncmind.android.ui.wiki

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
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateWikiPageScreen(
    projectId: Int,
    onBack: () -> Unit,
    onWikiPageSaved: (Int, Int) -> Unit,
    viewModel: CreateWikiPageViewModel = hiltViewModel()
) {
    val saveState by viewModel.saveState
    val title by viewModel.title
    val content by viewModel.content
    val draftPrompt by viewModel.draftPrompt
    val draftState by viewModel.draftState

    LaunchedEffect(saveState) {
        if (saveState is NetworkResult.Success) {
            val page = (saveState as NetworkResult.Success<WikiPage>).data
            if (page.id > 0) {
                onWikiPageSaved(projectId, page.id)
            }
        }
    }

    WikiPageFormScaffold(
        title = "New wiki page",
        pageTitle = title,
        content = content,
        saveState = saveState,
        draftPrompt = draftPrompt,
        draftState = draftState,
        onBack = onBack,
        onTitleChange = viewModel::onTitleChange,
        onContentChange = viewModel::onContentChange,
        onDraftPromptChange = viewModel::onDraftPromptChange,
        onGenerateDraft = { viewModel.generateDraft(projectId) },
        onSave = { viewModel.save(projectId) }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditWikiPageScreen(
    projectId: Int,
    wikiPageId: Int,
    onBack: () -> Unit,
    onWikiPageSaved: (Int, Int) -> Unit,
    viewModel: EditWikiPageViewModel = hiltViewModel()
) {
    val pageState by viewModel.pageState
    val saveState by viewModel.saveState
    val title by viewModel.title
    val content by viewModel.content
    val draftPrompt by viewModel.draftPrompt
    val draftState by viewModel.draftState

    LaunchedEffect(projectId, wikiPageId) {
        viewModel.load(projectId, wikiPageId)
    }

    LaunchedEffect(saveState) {
        if (saveState is NetworkResult.Success) {
            val page = (saveState as NetworkResult.Success<WikiPage>).data
            if (page.id > 0) {
                onWikiPageSaved(projectId, page.id)
            }
        }
    }

    when (val state = pageState) {
        is NetworkResult.Loading -> {
            Scaffold(
                topBar = { TopAppBar(title = { Text("Edit wiki page") }) }
            ) { paddingValues ->
                Column(modifier = Modifier.padding(paddingValues).padding(16.dp)) {
                    CircularProgressIndicator()
                }
            }
        }
        is NetworkResult.Error -> {
            Scaffold(
                topBar = { TopAppBar(title = { Text("Edit wiki page") }) }
            ) { paddingValues ->
                Text(
                    text = "Error: ${state.message}",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(paddingValues).padding(16.dp)
                )
            }
        }
        is NetworkResult.Success -> WikiPageFormScaffold(
            title = "Edit wiki page",
            pageTitle = title,
            content = content,
            saveState = saveState,
            draftPrompt = draftPrompt,
            draftState = draftState,
            onBack = onBack,
            onTitleChange = viewModel::onTitleChange,
            onContentChange = viewModel::onContentChange,
            onDraftPromptChange = viewModel::onDraftPromptChange,
            onGenerateDraft = { viewModel.generateDraft(projectId) },
            onSave = { viewModel.save(projectId, wikiPageId) }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun WikiPageFormScaffold(
    title: String,
    pageTitle: String,
    content: String,
    saveState: NetworkResult<WikiPage>,
    draftPrompt: String,
    draftState: NetworkResult<String>?,
    onBack: () -> Unit,
    onTitleChange: (String) -> Unit,
    onContentChange: (String) -> Unit,
    onDraftPromptChange: (String) -> Unit,
    onGenerateDraft: () -> Unit,
    onSave: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
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
                value = pageTitle,
                onValueChange = onTitleChange,
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = content,
                onValueChange = onContentChange,
                label = { Text("Content") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 12
            )
            Spacer(modifier = Modifier.height(14.dp))
            Text("AI draft", style = MaterialTheme.typography.labelLarge)
            OutlinedTextField(
                value = draftPrompt,
                onValueChange = onDraftPromptChange,
                label = { Text("Draft prompt") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onGenerateDraft,
                enabled = draftPrompt.isNotBlank() && draftState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (draftState is NetworkResult.Loading) "Drafting..." else "Generate draft")
            }
            when (draftState) {
                is NetworkResult.Error -> {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = draftState.message,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                is NetworkResult.Success -> {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Draft applied to content",
                        color = MaterialTheme.colorScheme.primary,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                is NetworkResult.Loading, null -> Unit
            }
            if (saveState is NetworkResult.Error) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = saveState.message,
                    color = MaterialTheme.colorScheme.error
                )
            }
            Spacer(modifier = Modifier.height(18.dp))
            Button(
                onClick = onSave,
                enabled = pageTitle.isNotBlank() && saveState !is NetworkResult.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (saveState is NetworkResult.Loading) "Saving..." else "Save wiki page")
            }
        }
    }
}
