package com.syncmind.android.ui.dashboard

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.DashboardData
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _dashboardState = mutableStateOf<NetworkResult<DashboardData>>(NetworkResult.Loading)
    val dashboardState: State<NetworkResult<DashboardData>> = _dashboardState

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _dashboardState.value = NetworkResult.Loading
            _dashboardState.value = projectRepository.getDashboard()
        }
    }
}
