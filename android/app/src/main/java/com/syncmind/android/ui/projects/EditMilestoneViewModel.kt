package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.MilestoneDateSuggestion
import com.syncmind.android.data.model.MilestoneIssueSuggestion
import com.syncmind.android.data.model.MilestoneRiskResult
import com.syncmind.android.data.model.MilestoneSummaryResult
import com.syncmind.android.data.model.UpdateMilestoneRequest
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EditMilestoneViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _milestoneState = mutableStateOf<NetworkResult<Milestone>>(NetworkResult.Loading)
    val milestoneState: State<NetworkResult<Milestone>> = _milestoneState

    private val _saveState = mutableStateOf<NetworkResult<Milestone>>(NetworkResult.Success(emptyMilestoneForEdit()))
    val saveState: State<NetworkResult<Milestone>> = _saveState

    private val _deleteState = mutableStateOf<NetworkResult<Unit>?>(null)
    val deleteState: State<NetworkResult<Unit>?> = _deleteState

    private val _dateSuggestionState = mutableStateOf<NetworkResult<MilestoneDateSuggestion>?>(null)
    val dateSuggestionState: State<NetworkResult<MilestoneDateSuggestion>?> = _dateSuggestionState

    private val _summaryState = mutableStateOf<NetworkResult<MilestoneSummaryResult>?>(null)
    val summaryState: State<NetworkResult<MilestoneSummaryResult>?> = _summaryState

    private val _riskState = mutableStateOf<NetworkResult<MilestoneRiskResult>?>(null)
    val riskState: State<NetworkResult<MilestoneRiskResult>?> = _riskState

    private val _issueSuggestionsState = mutableStateOf<NetworkResult<List<MilestoneIssueSuggestion>>?>(null)
    val issueSuggestionsState: State<NetworkResult<List<MilestoneIssueSuggestion>>?> = _issueSuggestionsState

    private val _name = mutableStateOf("")
    val name: State<String> = _name
    private val _description = mutableStateOf("")
    val description: State<String> = _description
    private val _startDate = mutableStateOf("")
    val startDate: State<String> = _startDate
    private val _dueDate = mutableStateOf("")
    val dueDate: State<String> = _dueDate
    private val _status = mutableStateOf("open")
    val status: State<String> = _status

    fun load(projectId: Int, milestoneId: Int) {
        viewModelScope.launch {
            _milestoneState.value = NetworkResult.Loading
            when (val result = projectRepository.getMilestone(projectId, milestoneId)) {
                is NetworkResult.Success -> {
                    applyMilestone(result.data)
                    _milestoneState.value = result
                }
                is NetworkResult.Error -> _milestoneState.value = result
                is NetworkResult.Loading -> _milestoneState.value = NetworkResult.Loading
            }
        }
    }

    fun onNameChange(value: String) { _name.value = value }
    fun onDescriptionChange(value: String) { _description.value = value }
    fun onStartDateChange(value: String) { _startDate.value = value }
    fun onDueDateChange(value: String) { _dueDate.value = value }
    fun onStatusChange(value: String) { _status.value = value }

    fun suggestDates(projectId: Int, milestoneId: Int) {
        if (projectId <= 0 || milestoneId <= 0) {
            _dateSuggestionState.value = NetworkResult.Error("Milestone not found")
            return
        }

        viewModelScope.launch {
            _dateSuggestionState.value = NetworkResult.Loading
            when (val result = projectRepository.suggestExistingMilestoneDates(projectId, milestoneId)) {
                is NetworkResult.Success -> {
                    result.data.start_date?.let { _startDate.value = it }
                    result.data.due_date?.let { _dueDate.value = it }
                    _dateSuggestionState.value = result
                }
                is NetworkResult.Error -> _dateSuggestionState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _dateSuggestionState.value = NetworkResult.Loading
            }
        }
    }

    fun summarizeMilestone(projectId: Int, milestoneId: Int, force: Boolean = false) {
        viewModelScope.launch {
            _summaryState.value = NetworkResult.Loading
            _summaryState.value = projectRepository.summarizeMilestone(projectId, milestoneId, force)
        }
    }

    fun analyzeRisk(projectId: Int, milestoneId: Int, force: Boolean = false) {
        viewModelScope.launch {
            _riskState.value = NetworkResult.Loading
            _riskState.value = projectRepository.analyzeMilestoneRisk(projectId, milestoneId, force)
        }
    }

    fun suggestIssues(projectId: Int, milestoneId: Int) {
        viewModelScope.launch {
            _issueSuggestionsState.value = NetworkResult.Loading
            _issueSuggestionsState.value = projectRepository.suggestMilestoneIssues(projectId, milestoneId)
        }
    }

    fun save(projectId: Int, milestoneId: Int) {
        val name = _name.value.trim()
        if (name.isBlank()) {
            _saveState.value = NetworkResult.Error("Milestone name is required")
            return
        }

        viewModelScope.launch {
            _saveState.value = NetworkResult.Loading
            _saveState.value = projectRepository.updateMilestone(
                projectId = projectId,
                milestoneId = milestoneId,
                request = UpdateMilestoneRequest(
                    name = name,
                    description = _description.value.takeIf { it.isNotBlank() },
                    start_date = _startDate.value.takeIf { it.isNotBlank() },
                    due_date = _dueDate.value.takeIf { it.isNotBlank() },
                    status = _status.value
                )
            )
        }
    }

    fun deleteMilestone(projectId: Int, milestoneId: Int) {
        if (projectId <= 0 || milestoneId <= 0) {
            _deleteState.value = NetworkResult.Error("Milestone not found")
            return
        }

        viewModelScope.launch {
            _deleteState.value = NetworkResult.Loading
            _deleteState.value = projectRepository.deleteMilestone(projectId, milestoneId)
        }
    }

    private fun applyMilestone(milestone: Milestone) {
        _name.value = milestone.name
        _description.value = milestone.description.orEmpty()
        _startDate.value = milestone.start_date.orEmpty()
        _dueDate.value = milestone.due_date.orEmpty()
        _status.value = milestone.status
    }
}

private fun emptyMilestoneForEdit(): Milestone = Milestone(
    id = 0,
    project_id = 0,
    name = "",
    status = "open",
    created_at = "",
    updated_at = ""
)
