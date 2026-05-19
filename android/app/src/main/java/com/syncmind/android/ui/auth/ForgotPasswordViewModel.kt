package com.syncmind.android.ui.auth

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.repository.AuthRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _email = mutableStateOf("")
    val email: State<String> = _email

    private val _requestState = mutableStateOf<NetworkResult<String>?>(null)
    val requestState: State<NetworkResult<String>?> = _requestState

    fun onEmailChange(value: String) {
        _email.value = value
    }

    fun sendResetLink() {
        val email = _email.value.trim()
        if (email.isBlank()) {
            _requestState.value = NetworkResult.Error("Email is required")
            return
        }

        viewModelScope.launch {
            _requestState.value = NetworkResult.Loading
            _requestState.value = authRepository.forgotPassword(email)
        }
    }
}
