package com.syncmind.android.data.repository

import com.syncmind.android.data.api.InvitationApiService
import com.syncmind.android.data.model.AcceptInvitationResponse
import com.syncmind.android.data.model.InvitationInfo
import com.syncmind.android.util.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class InvitationRepository @Inject constructor(
    private val apiService: InvitationApiService
) {
    suspend fun getInvitation(token: String): NetworkResult<InvitationInfo> {
        return try {
            val response = apiService.getInvitation(token)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun acceptInvitation(token: String): NetworkResult<AcceptInvitationResponse> {
        return try {
            val response = apiService.acceptInvitation(token)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }
}
