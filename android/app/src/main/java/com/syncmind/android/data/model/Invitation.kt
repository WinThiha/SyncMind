package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class InvitationInfo(
    val project_id: Int,
    val project_name: String,
    val role: String,
    val position: String? = null,
    val inviter_name: String? = null,
    val expires_at: String
)

@Serializable
data class InvitationInfoResponse(
    val data: InvitationInfo
)

@Serializable
data class AcceptInvitationResponse(
    val message: String,
    val project_id: Int
)
