package com.syncmind.android.ui.auth

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.LoginRequest
import com.syncmind.android.data.repository.AuthRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _loginState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val loginState: State<NetworkResult<Unit>> = _loginState

    private val _email = mutableStateOf("")
    val email: State<String> = _email

    private val _password = mutableStateOf("")
    val password: State<String> = _password

    fun onEmailChange(newEmail: String) {
        _email.value = newEmail
    }

    fun onPasswordChange(newPassword: String) {
        _password.value = newPassword
    }

    fun login() {
        if (_email.value.isBlank() || _password.value.isBlank()) {
            _loginState.value = NetworkResult.Error("Email and password are required")
            return
        }

        _loginState.value = NetworkResult.Loading
        viewModelScope.launch {
            val result = authRepository.login(
                LoginRequest(
                    email = _email.value,
                    password = _password.value,
                    device_name = android.os.Build.MODEL
                )
            )
            when (result) {
                is NetworkResult.Success -> {
                    _loginState.value = NetworkResult.Success(Unit)
                }
                is NetworkResult.Error -> {
                    _loginState.value = NetworkResult.Error(result.message, result.code)
                }
                else -> {}
            }
        }
    }
}
