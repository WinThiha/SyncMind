package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.UpdateIssueRequest
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EditIssueViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _issueState = mutableStateOf<NetworkResult<Issue>>(NetworkResult.Loading)
    val issueState: State<NetworkResult<Issue>> = _issueState

    private val _saveState = mutableStateOf<NetworkResult<Issue>>(NetworkResult.Success(emptyEditIssue()))
    val saveState: State<NetworkResult<Issue>> = _saveState

    private val _summary = mutableStateOf("")
    val summary: State<String> = _summary
    private val _description = mutableStateOf("")
    val description: State<String> = _description
    private val _status = mutableStateOf("open")
    val status: State<String> = _status
    private val _priority = mutableStateOf("normal")
    val priority: State<String> = _priority
    private val _issueType = mutableStateOf("Task")
    val issueType: State<String> = _issueType
    private val _estimatedHours = mutableStateOf("")
    val estimatedHours: State<String> = _estimatedHours
    private val _actualHours = mutableStateOf("")
    val actualHours: State<String> = _actualHours
    private val _dueDate = mutableStateOf("")
    val dueDate: State<String> = _dueDate

    fun load(projectId: Int, issueKey: String) {
        viewModelScope.launch {
            _issueState.value = NetworkResult.Loading
            when (val result = projectRepository.getIssue(projectId, issueKey)) {
                is NetworkResult.Success -> {
                    applyIssue(result.data)
                    _issueState.value = result
                }
                is NetworkResult.Error -> _issueState.value = result
                is NetworkResult.Loading -> _issueState.value = NetworkResult.Loading
            }
        }
    }

    fun onSummaryChange(value: String) { _summary.value = value }
    fun onDescriptionChange(value: String) { _description.value = value }
    fun onStatusChange(value: String) { _status.value = value }
    fun onPriorityChange(value: String) { _priority.value = value }
    fun onIssueTypeChange(value: String) { _issueType.value = value }
    fun onEstimatedHoursChange(value: String) { _estimatedHours.value = value }
    fun onActualHoursChange(value: String) { _actualHours.value = value }
    fun onDueDateChange(value: String) { _dueDate.value = value }

    fun save(projectId: Int, issueKey: String) {
        val summary = _summary.value.trim()
        if (summary.isBlank()) {
            _saveState.value = NetworkResult.Error("Summary is required")
            return
        }

        viewModelScope.launch {
            _saveState.value = NetworkResult.Loading
            _saveState.value = projectRepository.updateIssue(
                projectId = projectId,
                issueKey = issueKey,
                request = UpdateIssueRequest(
                    summary = summary,
                    description = _description.value.takeIf { it.isNotBlank() },
                    status = _status.value,
                    priority = _priority.value,
                    issue_type = _issueType.value,
                    estimated_hours = _estimatedHours.value.toDoubleOrNull(),
                    actual_hours = _actualHours.value.toDoubleOrNull(),
                    due_date = _dueDate.value.takeIf { it.isNotBlank() }
                )
            )
        }
    }

    private fun applyIssue(issue: Issue) {
        _summary.value = issue.summary
        _description.value = issue.description.orEmpty()
        _status.value = issue.status
        _priority.value = issue.priority
        _issueType.value = issue.issue_type
        _estimatedHours.value = issue.estimated_hours?.toString().orEmpty()
        _actualHours.value = issue.actual_hours?.toString().orEmpty()
        _dueDate.value = issue.due_date.orEmpty()
    }
}

private fun emptyEditIssue(): Issue = Issue(
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
