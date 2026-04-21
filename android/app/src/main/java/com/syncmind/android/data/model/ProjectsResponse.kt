package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ProjectsResponse(
    val data: List<Project>,
    val links: PaginationLinks? = null,
    val meta: PaginationMeta? = null
)

@Serializable
data class PaginationLinks(
    val first: String?,
    val last: String?,
    val prev: String?,
    val next: String?
)

@Serializable
data class PaginationMeta(
    val current_page: Int,
    val from: Int? = null,
    val last_page: Int,
    val path: String,
    val per_page: Int,
    val to: Int? = null,
    val total: Int
)
