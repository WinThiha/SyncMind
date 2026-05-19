package com.syncmind.android.ui.issues

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.IssuesSummary
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.SimilarIssue
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GlobalIssuesViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _issuesState = mutableStateOf<NetworkResult<List<Issue>>>(NetworkResult.Loading)
    val issuesState: State<NetworkResult<List<Issue>>> = _issuesState

    private val _summaryState = mutableStateOf<NetworkResult<IssuesSummary>>(NetworkResult.Loading)
    val summaryState: State<NetworkResult<IssuesSummary>> = _summaryState

    private val _projectsState = mutableStateOf<NetworkResult<List<Project>>>(NetworkResult.Loading)
    val projectsState: State<NetworkResult<List<Project>>> = _projectsState

    private val _selectedProjectId = mutableStateOf<Int?>(null)
    val selectedProjectId: State<Int?> = _selectedProjectId

    private val _similarQuery = mutableStateOf("")
    val similarQuery: State<String> = _similarQuery

    private val _similarIssuesState = mutableStateOf<NetworkResult<List<SimilarIssue>>?>(null)
    val similarIssuesState: State<NetworkResult<List<SimilarIssue>>?> = _similarIssuesState

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _summaryState.value = NetworkResult.Loading
            _issuesState.value = NetworkResult.Loading
            _projectsState.value = NetworkResult.Loading
            _summaryState.value = projectRepository.getIssuesSummary()
            _issuesState.value = projectRepository.getGlobalIssues()
            when (val projects = projectRepository.getProjects()) {
                is NetworkResult.Success -> {
                    _projectsState.value = projects
                    if (_selectedProjectId.value == null) {
                        _selectedProjectId.value = projects.data.firstOrNull()?.id
                    }
                }
                is NetworkResult.Error -> _projectsState.value = NetworkResult.Error(projects.message, projects.code)
                is NetworkResult.Loading -> _projectsState.value = NetworkResult.Loading
            }
        }
    }

    fun onSelectedProjectChange(projectId: Int) {
        _selectedProjectId.value = projectId
    }

    fun onSimilarQueryChange(value: String) {
        _similarQuery.value = value
    }

    fun searchSimilarIssues() {
        val projectId = _selectedProjectId.value
        val query = _similarQuery.value.trim()
        if (projectId == null) {
            _similarIssuesState.value = NetworkResult.Error("Select a project")
            return
        }
        if (query.isBlank()) {
            _similarIssuesState.value = NetworkResult.Error("Search text is required")
            return
        }

        viewModelScope.launch {
            _similarIssuesState.value = NetworkResult.Loading
            _similarIssuesState.value = projectRepository.getGlobalSimilarIssues(projectId, query)
        }
    }
}
