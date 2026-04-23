package com.syncmind.android.data.repository

import com.syncmind.android.data.api.AuthApiService
import com.syncmind.android.data.model.LoginRequest
import com.syncmind.android.data.model.LoginResponse
import com.syncmind.android.data.TokenManager
import com.syncmind.android.util.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: AuthApiService,
    private val tokenManager: TokenManager
) {
    suspend fun login(request: LoginRequest): NetworkResult<LoginResponse> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                tokenManager.saveToken(body.token)
                tokenManager.saveUser(body.user)
                NetworkResult.Success(body)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun logout(): NetworkResult<Unit> {
        return try {
            val response = apiService.logout()
            if (response.isSuccessful) {
                tokenManager.deleteToken()
                tokenManager.deleteUser()
                NetworkResult.Success(Unit)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    fun isLoggedIn(): Boolean {
        return tokenManager.getToken() != null
    }
}
