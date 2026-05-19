package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class IssuesResponse(
    val data: List<Issue>
)
