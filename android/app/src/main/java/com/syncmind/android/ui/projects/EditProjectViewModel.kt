package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.UpdateProjectRequest
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EditProjectViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _projectState = mutableStateOf<NetworkResult<Project>>(NetworkResult.Loading)
    val projectState: State<NetworkResult<Project>> = _projectState

    private val _saveState = mutableStateOf<NetworkResult<Project>>(NetworkResult.Success(emptyProjectForEdit()))
    val saveState: State<NetworkResult<Project>> = _saveState

    private val _name = mutableStateOf("")
    val name: State<String> = _name
    private val _icon = mutableStateOf("")
    val icon: State<String> = _icon
    private val _issueTypes = mutableStateOf("")
    val issueTypes: State<String> = _issueTypes

    fun load(projectId: Int) {
        viewModelScope.launch {
            _projectState.value = NetworkResult.Loading
            when (val result = projectRepository.getProject(projectId)) {
                is NetworkResult.Success -> {
                    _projectState.value = result
                    _name.value = result.data.name
                    _icon.value = result.data.icon.orEmpty()
                    _issueTypes.value = result.data.issue_types.joinToString(", ")
                }
                is NetworkResult.Error -> _projectState.value = result
                is NetworkResult.Loading -> _projectState.value = NetworkResult.Loading
            }
        }
    }

    fun onNameChange(value: String) { _name.value = value }
    fun onIconChange(value: String) { _icon.value = value }
    fun onIssueTypesChange(value: String) { _issueTypes.value = value }

    fun save(projectId: Int) {
        val name = _name.value.trim()
        val types = _issueTypes.value.split(",").map { it.trim() }.filter { it.isNotBlank() }
        if (name.isBlank()) {
            _saveState.value = NetworkResult.Error("Project name is required")
            return
        }
        if (types.isEmpty()) {
            _saveState.value = NetworkResult.Error("At least one issue type is required")
            return
        }

        viewModelScope.launch {
            _saveState.value = NetworkResult.Loading
            _saveState.value = projectRepository.updateProject(
                projectId = projectId,
                request = UpdateProjectRequest(
                    name = name,
                    icon = _icon.value.takeIf { it.isNotBlank() },
                    issue_types = types
                )
            )
        }
    }
}

private fun emptyProjectForEdit(): Project = Project(
    id = 0,
    name = "",
    key = "",
    creator_id = 0,
    created_at = "",
    updated_at = ""
)
