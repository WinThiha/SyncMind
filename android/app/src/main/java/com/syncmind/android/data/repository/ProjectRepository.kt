package com.syncmind.android.data.repository

import com.syncmind.android.data.api.ProjectApiService
import com.syncmind.android.data.model.Project
import com.syncmind.android.util.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepository @Inject constructor(
    private val apiService: ProjectApiService
) {
    suspend fun getProjects(): NetworkResult<List<Project>> {
        return try {
            val response = apiService.getProjects()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }
}
