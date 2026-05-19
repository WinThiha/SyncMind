package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.ProjectInvitation
import com.syncmind.android.data.model.ProjectMember
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectMembersViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _membersState = mutableStateOf<NetworkResult<List<ProjectMember>>>(NetworkResult.Loading)
    val membersState: State<NetworkResult<List<ProjectMember>>> = _membersState

    private val _invitationsState = mutableStateOf<NetworkResult<List<ProjectInvitation>>>(NetworkResult.Loading)
    val invitationsState: State<NetworkResult<List<ProjectInvitation>>> = _invitationsState

    private val _operationState = mutableStateOf<NetworkResult<String>?>(null)
    val operationState: State<NetworkResult<String>?> = _operationState

    private val _email = mutableStateOf("")
    val email: State<String> = _email

    private val _newRole = mutableStateOf("normal")
    val newRole: State<String> = _newRole

    private val _newPosition = mutableStateOf("")
    val newPosition: State<String> = _newPosition

    private val _roleDrafts = mutableStateOf<Map<Int, String>>(emptyMap())
    val roleDrafts: State<Map<Int, String>> = _roleDrafts

    private val _positionDrafts = mutableStateOf<Map<Int, String>>(emptyMap())
    val positionDrafts: State<Map<Int, String>> = _positionDrafts

    fun load(projectId: Int) {
        viewModelScope.launch {
            _membersState.value = NetworkResult.Loading
            _invitationsState.value = NetworkResult.Loading
            when (val result = projectRepository.getProjectMembers(projectId)) {
                is NetworkResult.Success -> {
                    syncDrafts(result.data)
                    _membersState.value = result
                }
                is NetworkResult.Error -> _membersState.value = result
                is NetworkResult.Loading -> _membersState.value = NetworkResult.Loading
            }
            _invitationsState.value = projectRepository.getProjectInvitations(projectId)
        }
    }

    fun onEmailChange(value: String) {
        _email.value = value
    }

    fun onNewRoleChange(value: String) {
        _newRole.value = value
    }

    fun onNewPositionChange(value: String) {
        _newPosition.value = value
    }

    fun onRoleDraftChange(userId: Int, value: String) {
        _roleDrafts.value = _roleDrafts.value + (userId to value)
    }

    fun onPositionDraftChange(userId: Int, value: String) {
        _positionDrafts.value = _positionDrafts.value + (userId to value)
    }

    fun addMember(projectId: Int) {
        val email = _email.value.trim()
        if (email.isBlank()) {
            _operationState.value = NetworkResult.Error("Email is required")
            return
        }

        viewModelScope.launch {
            _operationState.value = NetworkResult.Loading
            when (val result = projectRepository.addProjectMember(
                projectId = projectId,
                email = email,
                role = _newRole.value,
                position = _newPosition.value.takeIf { it.isNotBlank() }
            )) {
                is NetworkResult.Success -> {
                    _email.value = ""
                    _newPosition.value = ""
                    _operationState.value = result
                    load(projectId)
                }
                is NetworkResult.Error -> _operationState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _operationState.value = NetworkResult.Loading
            }
        }
    }

    fun updateMember(projectId: Int, userId: Int) {
        viewModelScope.launch {
            _operationState.value = NetworkResult.Loading
            when (val result = projectRepository.updateProjectMember(
                projectId = projectId,
                userId = userId,
                role = _roleDrafts.value[userId] ?: "normal",
                position = _positionDrafts.value[userId]?.takeIf { it.isNotBlank() }
            )) {
                is NetworkResult.Success -> {
                    _operationState.value = result
                    load(projectId)
                }
                is NetworkResult.Error -> _operationState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _operationState.value = NetworkResult.Loading
            }
        }
    }

    fun removeMember(projectId: Int, userId: Int) {
        viewModelScope.launch {
            _operationState.value = NetworkResult.Loading
            when (val result = projectRepository.removeProjectMember(projectId, userId)) {
                is NetworkResult.Success -> {
                    _operationState.value = result
                    load(projectId)
                }
                is NetworkResult.Error -> _operationState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _operationState.value = NetworkResult.Loading
            }
        }
    }

    fun transferOwnership(projectId: Int, newCreatorId: Int) {
        viewModelScope.launch {
            _operationState.value = NetworkResult.Loading
            when (val result = projectRepository.transferProjectOwnership(projectId, newCreatorId)) {
                is NetworkResult.Success -> {
                    _operationState.value = result
                    load(projectId)
                }
                is NetworkResult.Error -> _operationState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _operationState.value = NetworkResult.Loading
            }
        }
    }

    fun cancelInvitation(projectId: Int, invitationId: Int) {
        viewModelScope.launch {
            _operationState.value = NetworkResult.Loading
            when (val result = projectRepository.cancelProjectInvitation(projectId, invitationId)) {
                is NetworkResult.Success -> {
                    _operationState.value = result
                    load(projectId)
                }
                is NetworkResult.Error -> _operationState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _operationState.value = NetworkResult.Loading
            }
        }
    }

    private fun syncDrafts(members: List<ProjectMember>) {
        _roleDrafts.value = members.associate { member ->
            member.id to (member.pivot?.role ?: "normal")
        }
        _positionDrafts.value = members.associate { member ->
            member.id to member.pivot?.position.orEmpty()
        }
    }
}
