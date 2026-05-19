package com.syncmind.android.ui.projects

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectDetailViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _projectState = mutableStateOf<NetworkResult<Project>>(NetworkResult.Loading)
    val projectState: State<NetworkResult<Project>> = _projectState

    private val _issuesState = mutableStateOf<NetworkResult<List<Issue>>>(NetworkResult.Loading)
    val issuesState: State<NetworkResult<List<Issue>>> = _issuesState

    private val _milestonesState = mutableStateOf<NetworkResult<List<Milestone>>>(NetworkResult.Loading)
    val milestonesState: State<NetworkResult<List<Milestone>>> = _milestonesState

    private val _wikiPagesState = mutableStateOf<NetworkResult<List<WikiPage>>>(NetworkResult.Loading)
    val wikiPagesState: State<NetworkResult<List<WikiPage>>> = _wikiPagesState

    private val _deleteState = mutableStateOf<NetworkResult<Unit>?>(null)
    val deleteState: State<NetworkResult<Unit>?> = _deleteState

    fun load(projectId: Int) {
        if (projectId <= 0) {
            _projectState.value = NetworkResult.Error("Project not found")
            _issuesState.value = NetworkResult.Error("Project not found")
            _milestonesState.value = NetworkResult.Error("Project not found")
            _wikiPagesState.value = NetworkResult.Error("Project not found")
            return
        }

        viewModelScope.launch {
            _projectState.value = NetworkResult.Loading
            _issuesState.value = NetworkResult.Loading
            _milestonesState.value = NetworkResult.Loading
            _wikiPagesState.value = NetworkResult.Loading
            _projectState.value = projectRepository.getProject(projectId)
            _issuesState.value = projectRepository.getIssues(projectId)
            _milestonesState.value = projectRepository.getMilestones(projectId)
            _wikiPagesState.value = projectRepository.getWikiPages(projectId)
        }
    }

    fun deleteProject(projectId: Int) {
        if (projectId <= 0) {
            _deleteState.value = NetworkResult.Error("Project not found")
            return
        }

        viewModelScope.launch {
            _deleteState.value = NetworkResult.Loading
            _deleteState.value = projectRepository.deleteProject(projectId)
        }
    }
}
