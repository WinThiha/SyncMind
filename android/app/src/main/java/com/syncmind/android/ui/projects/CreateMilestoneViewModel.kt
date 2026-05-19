package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.CreateMilestoneRequest
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.MilestoneDateSuggestion
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateMilestoneViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _createState = mutableStateOf<NetworkResult<Milestone>>(NetworkResult.Success(emptyMilestone()))
    val createState: State<NetworkResult<Milestone>> = _createState

    private val _dateSuggestionState = mutableStateOf<NetworkResult<MilestoneDateSuggestion>?>(null)
    val dateSuggestionState: State<NetworkResult<MilestoneDateSuggestion>?> = _dateSuggestionState

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

    fun onNameChange(value: String) { _name.value = value }
    fun onDescriptionChange(value: String) { _description.value = value }
    fun onStartDateChange(value: String) { _startDate.value = value }
    fun onDueDateChange(value: String) { _dueDate.value = value }
    fun onStatusChange(value: String) { _status.value = value }

    fun suggestDates(projectId: Int) {
        val name = _name.value.trim()
        if (name.isBlank()) {
            _dateSuggestionState.value = NetworkResult.Error("Milestone name is required")
            return
        }

        viewModelScope.launch {
            _dateSuggestionState.value = NetworkResult.Loading
            when (val result = projectRepository.suggestMilestoneDates(
                projectId = projectId,
                name = name,
                description = _description.value.takeIf { it.isNotBlank() }
            )) {
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

    fun create(projectId: Int) {
        val name = _name.value.trim()
        if (name.isBlank()) {
            _createState.value = NetworkResult.Error("Milestone name is required")
            return
        }

        viewModelScope.launch {
            _createState.value = NetworkResult.Loading
            _createState.value = projectRepository.createMilestone(
                projectId = projectId,
                request = CreateMilestoneRequest(
                    name = name,
                    description = _description.value.takeIf { it.isNotBlank() },
                    start_date = _startDate.value.takeIf { it.isNotBlank() },
                    due_date = _dueDate.value.takeIf { it.isNotBlank() },
                    status = _status.value
                )
            )
        }
    }
}

private fun emptyMilestone(): Milestone = Milestone(
    id = 0,
    project_id = 0,
    name = "",
    status = "open",
    created_at = "",
    updated_at = ""
)
