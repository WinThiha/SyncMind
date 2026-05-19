package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.CreateProjectRequest
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateProjectViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _createState = mutableStateOf<NetworkResult<Project>>(NetworkResult.Success(emptyProject()))
    val createState: State<NetworkResult<Project>> = _createState

    private val _name = mutableStateOf("")
    val name: State<String> = _name
    private val _key = mutableStateOf("")
    val key: State<String> = _key
    private val _icon = mutableStateOf("")
    val icon: State<String> = _icon
    private val _issueTypes = mutableStateOf("Task, Bug, Request")
    val issueTypes: State<String> = _issueTypes

    fun onNameChange(value: String) { _name.value = value }
    fun onKeyChange(value: String) { _key.value = value.uppercase().filter { it.isLetter() }.take(10) }
    fun onIconChange(value: String) { _icon.value = value }
    fun onIssueTypesChange(value: String) { _issueTypes.value = value }

    fun create() {
        val name = _name.value.trim()
        val key = _key.value.trim().uppercase()
        val types = _issueTypes.value.split(",").map { it.trim() }.filter { it.isNotBlank() }

        if (name.isBlank()) {
            _createState.value = NetworkResult.Error("Project name is required")
            return
        }
        if (key.length !in 2..10) {
            _createState.value = NetworkResult.Error("Project key must be 2 to 10 letters")
            return
        }
        if (types.isEmpty()) {
            _createState.value = NetworkResult.Error("At least one issue type is required")
            return
        }

        viewModelScope.launch {
            _createState.value = NetworkResult.Loading
            _createState.value = projectRepository.createProject(
                CreateProjectRequest(
                    name = name,
                    key = key,
                    icon = _icon.value.takeIf { it.isNotBlank() },
                    issue_types = types
                )
            )
        }
    }
}

private fun emptyProject(): Project = Project(
    id = 0,
    name = "",
    key = "",
    creator_id = 0,
    created_at = "",
    updated_at = ""
)
