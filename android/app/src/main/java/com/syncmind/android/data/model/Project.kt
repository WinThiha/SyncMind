package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Project(
    val id: Int,
    val name: String,
    val key: String,
    val icon: String? = null,
    val issue_types: List<String> = emptyList(),
    val categories: List<String>? = null,
    val milestones: List<String>? = null,
    val versions: List<String>? = null,
    val creator_id: Int,
    val created_at: String,
    val updated_at: String,
    val members_count: Int? = null,
    val issues_count: Int? = null,
    val members: List<ProjectMember> = emptyList(),
    val creator: User? = null
)

@Serializable
data class ProjectMember(
    val id: Int,
    val name: String,
    val email: String,
    val pivot: ProjectMemberPivot? = null
)

@Serializable
data class ProjectMemberPivot(
    val role: String? = null,
    val position: String? = null
)

@Serializable
data class CreateProjectRequest(
    val name: String,
    val key: String,
    val icon: String? = null,
    val issue_types: List<String>
)

@Serializable
data class UpdateProjectRequest(
    val name: String? = null,
    val icon: String? = null,
    val issue_types: List<String>? = null
)

@Serializable
data class ProjectMembersResponse(
    val data: List<ProjectMember>
)

@Serializable
data class SaveProjectMemberRequest(
    val email: String? = null,
    val role: String,
    val position: String? = null
)

@Serializable
data class ProjectMemberMutationResponse(
    val message: String,
    val type: String? = null
)

@Serializable
data class TransferProjectOwnershipRequest(
    val new_creator_id: Int
)

@Serializable
data class ProjectInvitation(
    val id: Int,
    val email: String,
    val role: String,
    val position: String? = null,
    val invited_by: Int? = null,
    val expires_at: String,
    val created_at: String,
    val inviter: User? = null
)

@Serializable
data class ProjectInvitationsResponse(
    val data: List<ProjectInvitation>
)
