package com.syncmind.android.ui.invitations

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.AcceptInvitationResponse
import com.syncmind.android.data.model.InvitationInfo
import com.syncmind.android.data.repository.InvitationRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class InvitationViewModel @Inject constructor(
    private val invitationRepository: InvitationRepository
) : ViewModel() {

    private val _invitationState = mutableStateOf<NetworkResult<InvitationInfo>>(NetworkResult.Loading)
    val invitationState: State<NetworkResult<InvitationInfo>> = _invitationState

    private val _acceptState = mutableStateOf<NetworkResult<AcceptInvitationResponse>?>(null)
    val acceptState: State<NetworkResult<AcceptInvitationResponse>?> = _acceptState

    fun load(token: String) {
        viewModelScope.launch {
            _invitationState.value = NetworkResult.Loading
            _invitationState.value = invitationRepository.getInvitation(token)
        }
    }

    fun accept(token: String) {
        viewModelScope.launch {
            _acceptState.value = NetworkResult.Loading
            _acceptState.value = invitationRepository.acceptInvitation(token)
        }
    }
}
