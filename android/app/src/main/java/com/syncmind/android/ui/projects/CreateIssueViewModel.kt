package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.CreateIssueRequest
import com.syncmind.android.data.model.IssueAISuggestion
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.SimilarIssue
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateIssueViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _projectState = mutableStateOf<NetworkResult<Project>>(NetworkResult.Loading)
    val projectState: State<NetworkResult<Project>> = _projectState

    private val _createState = mutableStateOf<NetworkResult<Issue>>(NetworkResult.Success(emptyIssue()))
    val createState: State<NetworkResult<Issue>> = _createState

    private val _aiSuggestionState = mutableStateOf<NetworkResult<IssueAISuggestion>?>(null)
    val aiSuggestionState: State<NetworkResult<IssueAISuggestion>?> = _aiSuggestionState

    private val _similarIssuesState = mutableStateOf<NetworkResult<List<SimilarIssue>>?>(null)
    val similarIssuesState: State<NetworkResult<List<SimilarIssue>>?> = _similarIssuesState

    private val _summary = mutableStateOf("")
    val summary: State<String> = _summary

    private val _description = mutableStateOf("")
    val description: State<String> = _description

    private val _issueType = mutableStateOf("Task")
    val issueType: State<String> = _issueType

    private val _priority = mutableStateOf("normal")
    val priority: State<String> = _priority

    private val _estimatedHours = mutableStateOf("")
    val estimatedHours: State<String> = _estimatedHours

    private val _dueDate = mutableStateOf("")
    val dueDate: State<String> = _dueDate

    fun load(projectId: Int) {
        viewModelScope.launch {
            _projectState.value = NetworkResult.Loading
            when (val result = projectRepository.getProject(projectId)) {
                is NetworkResult.Success -> {
                    _projectState.value = result
                    _issueType.value = result.data.issue_types.firstOrNull() ?: "Task"
                }
                is NetworkResult.Error -> _projectState.value = result
                is NetworkResult.Loading -> _projectState.value = NetworkResult.Loading
            }
        }
    }

    fun onSummaryChange(value: String) { _summary.value = value }
    fun onDescriptionChange(value: String) { _description.value = value }
    fun onIssueTypeChange(value: String) { _issueType.value = value }
    fun onPriorityChange(value: String) { _priority.value = value }
    fun onEstimatedHoursChange(value: String) { _estimatedHours.value = value }
    fun onDueDateChange(value: String) { _dueDate.value = value }

    fun suggestWithAi(projectId: Int) {
        val summary = _summary.value.trim()
        if (summary.isBlank()) {
            _aiSuggestionState.value = NetworkResult.Error("Summary is required for AI suggestions")
            return
        }

        viewModelScope.launch {
            _aiSuggestionState.value = NetworkResult.Loading
            _similarIssuesState.value = NetworkResult.Loading

            when (val result = projectRepository.suggestIssue(projectId, summary)) {
                is NetworkResult.Success -> {
                    applySuggestion(result.data)
                    _aiSuggestionState.value = result
                }
                is NetworkResult.Error -> _aiSuggestionState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _aiSuggestionState.value = NetworkResult.Loading
            }

            _similarIssuesState.value = projectRepository.getSimilarIssues(projectId, summary)
        }
    }

    fun create(projectId: Int) {
        val summary = _summary.value.trim()
        if (summary.isBlank()) {
            _createState.value = NetworkResult.Error("Summary is required")
            return
        }

        viewModelScope.launch {
            _createState.value = NetworkResult.Loading
            _createState.value = projectRepository.createIssue(
                projectId = projectId,
                request = CreateIssueRequest(
                    summary = summary,
                    description = _description.value.takeIf { it.isNotBlank() },
                    issue_type = _issueType.value,
                    priority = _priority.value,
                    estimated_hours = _estimatedHours.value.toDoubleOrNull(),
                    due_date = _dueDate.value.takeIf { it.isNotBlank() }
                )
            )
        }
    }

    private fun applySuggestion(suggestion: IssueAISuggestion) {
        suggestion.description?.takeIf { it.isNotBlank() }?.let { _description.value = it }
        suggestion.issue_type?.takeIf { it.isNotBlank() }?.let { _issueType.value = it }
        suggestion.priority?.takeIf { it.isNotBlank() }?.let { _priority.value = it }
        suggestion.estimated_hours?.let { _estimatedHours.value = it.toString() }
    }
}

private fun emptyIssue(): Issue = Issue(
    id = 0,
    project_id = 0,
    key = "",
    key_number = 0,
    summary = "",
    status = "open",
    priority = "normal",
    issue_type = "Task",
    creator_id = 0,
    created_at = "",
    updated_at = ""
)
