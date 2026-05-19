package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.ThreadSummary
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class IssueDetailViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _issueState = mutableStateOf<NetworkResult<Issue>>(NetworkResult.Loading)
    val issueState: State<NetworkResult<Issue>> = _issueState

    private val _commentDraft = mutableStateOf("")
    val commentDraft: State<String> = _commentDraft

    private val _commentSubmitState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val commentSubmitState: State<NetworkResult<Unit>> = _commentSubmitState

    private val _deleteState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val deleteState: State<NetworkResult<Unit>> = _deleteState

    private val _summaryState = mutableStateOf<NetworkResult<ThreadSummary>?>(null)
    val summaryState: State<NetworkResult<ThreadSummary>?> = _summaryState

    fun load(projectId: Int, issueKey: String) {
        if (projectId <= 0 || issueKey.isBlank()) {
            _issueState.value = NetworkResult.Error("Issue not found")
            return
        }

        viewModelScope.launch {
            _issueState.value = NetworkResult.Loading
            _issueState.value = projectRepository.getIssue(projectId, issueKey)
        }
    }

    fun onCommentDraftChange(value: String) {
        _commentDraft.value = value
    }

    fun postComment(projectId: Int, issueKey: String) {
        val content = _commentDraft.value.trim()
        if (content.isBlank()) {
            _commentSubmitState.value = NetworkResult.Error("Comment cannot be empty")
            return
        }

        viewModelScope.launch {
            _commentSubmitState.value = NetworkResult.Loading
            when (val result = projectRepository.createIssueComment(projectId, issueKey, content)) {
                is NetworkResult.Success -> {
                    _commentDraft.value = ""
                    _commentSubmitState.value = NetworkResult.Success(Unit)
                    _issueState.value = projectRepository.getIssue(projectId, issueKey)
                }
                is NetworkResult.Error -> {
                    _commentSubmitState.value = NetworkResult.Error(result.message, result.code)
                }
                is NetworkResult.Loading -> {
                    _commentSubmitState.value = NetworkResult.Loading
                }
            }
        }
    }

    fun deleteIssue(projectId: Int, issueKey: String) {
        viewModelScope.launch {
            _deleteState.value = NetworkResult.Loading
            _deleteState.value = projectRepository.deleteIssue(projectId, issueKey)
        }
    }

    fun summarizeIssue(projectId: Int, issueKey: String, force: Boolean = false) {
        viewModelScope.launch {
            _summaryState.value = NetworkResult.Loading
            _summaryState.value = projectRepository.summarizeIssue(projectId, issueKey, force)
        }
    }
}
