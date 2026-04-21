package com.syncmind.android.data.api

import com.syncmind.android.data.model.ProjectsResponse
import retrofit2.Response
import retrofit2.http.GET

interface ProjectApiService {
    @GET("projects")
    suspend fun getProjects(): Response<ProjectsResponse>
}
