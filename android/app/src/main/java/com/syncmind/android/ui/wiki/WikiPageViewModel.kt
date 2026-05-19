package com.syncmind.android.ui.wiki

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.data.model.WikiAiChatMessage
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WikiPageViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _wikiPageState = mutableStateOf<NetworkResult<WikiPage>>(NetworkResult.Loading)
    val wikiPageState: State<NetworkResult<WikiPage>> = _wikiPageState

    private val _deleteState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val deleteState: State<NetworkResult<Unit>> = _deleteState

    private val _question = mutableStateOf("")
    val question: State<String> = _question

    private val _chatState = mutableStateOf<NetworkResult<String>?>(null)
    val chatState: State<NetworkResult<String>?> = _chatState

    private val _chatHistory = mutableStateOf<List<WikiAiChatMessage>>(emptyList())
    val chatHistory: State<List<WikiAiChatMessage>> = _chatHistory

    fun load(projectId: Int, wikiPageId: Int) {
        if (projectId <= 0 || wikiPageId <= 0) {
            _wikiPageState.value = NetworkResult.Error("Wiki page not found")
            return
        }

        viewModelScope.launch {
            _wikiPageState.value = NetworkResult.Loading
            _wikiPageState.value = projectRepository.getWikiPage(projectId, wikiPageId)
        }
    }

    fun delete(projectId: Int, wikiPageId: Int) {
        viewModelScope.launch {
            _deleteState.value = NetworkResult.Loading
            _deleteState.value = projectRepository.deleteWikiPage(projectId, wikiPageId)
        }
    }

    fun onQuestionChange(value: String) {
        _question.value = value
    }

    fun askWiki(projectId: Int) {
        val message = _question.value.trim()
        if (message.isBlank()) {
            _chatState.value = NetworkResult.Error("Question is required")
            return
        }

        viewModelScope.launch {
            _chatState.value = NetworkResult.Loading
            when (val result = projectRepository.wikiAiChat(projectId, message, _chatHistory.value)) {
                is NetworkResult.Success -> {
                    _chatHistory.value = _chatHistory.value + listOf(
                        WikiAiChatMessage(role = "user", content = message),
                        WikiAiChatMessage(role = "assistant", content = result.data)
                    )
                    _question.value = ""
                    _chatState.value = result
                }
                is NetworkResult.Error -> _chatState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _chatState.value = NetworkResult.Loading
            }
        }
    }
}
