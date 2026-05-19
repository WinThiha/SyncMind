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
class VerifyEmailViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _verifyState = mutableStateOf<NetworkResult<String>?>(null)
    val verifyState: State<NetworkResult<String>?> = _verifyState

    fun verify(verifyUrl: String) {
        if (_verifyState.value is NetworkResult.Loading || _verifyState.value is NetworkResult.Success) {
            return
        }

        if (verifyUrl.isBlank()) {
            _verifyState.value = NetworkResult.Error("Verification link is invalid")
            return
        }

        viewModelScope.launch {
            _verifyState.value = NetworkResult.Loading
            _verifyState.value = authRepository.verifyEmail(verifyUrl)
        }
    }
}
