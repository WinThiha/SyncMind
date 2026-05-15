package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.data.repository.AuthRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectViewModel @Inject constructor(
    private val projectRepository: ProjectRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _projectsState = mutableStateOf<NetworkResult<List<Project>>>(NetworkResult.Loading)
    val projectsState: State<NetworkResult<List<Project>>> = _projectsState

    init {
        getProjects()
    }

    fun getProjects() {
        _projectsState.value = NetworkResult.Loading
        viewModelScope.launch {
            _projectsState.value = projectRepository.getProjects()
        }
    }

    fun logout(onComplete: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onComplete()
        }
    }
}
