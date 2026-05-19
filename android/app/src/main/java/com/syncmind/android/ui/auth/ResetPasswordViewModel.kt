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
class ResetPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _password = mutableStateOf("")
    val password: State<String> = _password

    private val _passwordConfirmation = mutableStateOf("")
    val passwordConfirmation: State<String> = _passwordConfirmation

    private val _resetState = mutableStateOf<NetworkResult<String>?>(null)
    val resetState: State<NetworkResult<String>?> = _resetState

    fun onPasswordChange(value: String) {
        _password.value = value
    }

    fun onPasswordConfirmationChange(value: String) {
        _passwordConfirmation.value = value
    }

    fun resetPassword(token: String, email: String) {
        if (token.isBlank() || email.isBlank()) {
            _resetState.value = NetworkResult.Error("Reset link is invalid")
            return
        }

        if (_password.value.isBlank()) {
            _resetState.value = NetworkResult.Error("Password is required")
            return
        }

        if (_password.value != _passwordConfirmation.value) {
            _resetState.value = NetworkResult.Error("Passwords do not match")
            return
        }

        viewModelScope.launch {
            _resetState.value = NetworkResult.Loading
            _resetState.value = authRepository.resetPassword(
                token = token,
                email = email,
                password = _password.value,
                passwordConfirmation = _passwordConfirmation.value
            )
        }
    }
}
