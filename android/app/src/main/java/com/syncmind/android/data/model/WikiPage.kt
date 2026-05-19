package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class WikiPageAuthor(
    val id: Int,
    val name: String
)

@Serializable
data class WikiPage(
    val id: Int,
    val project_id: Int,
    val title: String,
    val content: String? = null,
    val author: WikiPageAuthor? = null,
    val last_editor: WikiPageAuthor? = null,
    val created_at: String,
    val updated_at: String
)

@Serializable
data class WikiPagesResponse(
    val data: List<WikiPage>
)

@Serializable
data class WikiPageResponse(
    val data: WikiPage
)

@Serializable
data class SaveWikiPageRequest(
    val title: String,
    val content: String? = null
)

@Serializable
data class WikiAiChatMessage(
    val role: String,
    val content: String
)

@Serializable
data class WikiAiChatRequest(
    val message: String,
    val history: List<WikiAiChatMessage> = emptyList(),
    val locale: String = "en"
)

@Serializable
data class WikiAiChatResponse(
    val answer: String
)

@Serializable
data class WikiAiDraftRequest(
    val prompt: String,
    val locale: String = "en"
)

@Serializable
data class WikiAiDraftResponse(
    val content: String
)
