package com.syncmind.android.ui.wiki

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.SaveWikiPageRequest
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.data.repository.ProjectRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EditWikiPageViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {
    private val _pageState = mutableStateOf<NetworkResult<WikiPage>>(NetworkResult.Loading)
    val pageState: State<NetworkResult<WikiPage>> = _pageState

    private val _saveState = mutableStateOf<NetworkResult<WikiPage>>(NetworkResult.Success(emptyWikiPage()))
    val saveState: State<NetworkResult<WikiPage>> = _saveState

    private val _title = mutableStateOf("")
    val title: State<String> = _title
    private val _content = mutableStateOf("")
    val content: State<String> = _content
    private val _draftPrompt = mutableStateOf("")
    val draftPrompt: State<String> = _draftPrompt
    private val _draftState = mutableStateOf<NetworkResult<String>?>(null)
    val draftState: State<NetworkResult<String>?> = _draftState

    fun load(projectId: Int, wikiPageId: Int) {
        viewModelScope.launch {
            _pageState.value = NetworkResult.Loading
            when (val result = projectRepository.getWikiPage(projectId, wikiPageId)) {
                is NetworkResult.Success -> {
                    _title.value = result.data.title
                    _content.value = result.data.content.orEmpty()
                    _pageState.value = result
                }
                is NetworkResult.Error -> _pageState.value = result
                is NetworkResult.Loading -> _pageState.value = NetworkResult.Loading
            }
        }
    }

    fun onTitleChange(value: String) { _title.value = value }
    fun onContentChange(value: String) { _content.value = value }
    fun onDraftPromptChange(value: String) { _draftPrompt.value = value }

    fun generateDraft(projectId: Int) {
        val prompt = _draftPrompt.value.trim()
        if (prompt.isBlank()) {
            _draftState.value = NetworkResult.Error("Draft prompt is required")
            return
        }

        viewModelScope.launch {
            _draftState.value = NetworkResult.Loading
            when (val result = projectRepository.wikiAiDraft(projectId, prompt)) {
                is NetworkResult.Success -> {
                    _content.value = result.data
                    _draftState.value = result
                }
                is NetworkResult.Error -> _draftState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _draftState.value = NetworkResult.Loading
            }
        }
    }

    fun save(projectId: Int, wikiPageId: Int) {
        val title = _title.value.trim()
        if (title.isBlank()) {
            _saveState.value = NetworkResult.Error("Title is required")
            return
        }

        viewModelScope.launch {
            _saveState.value = NetworkResult.Loading
            _saveState.value = projectRepository.updateWikiPage(
                projectId = projectId,
                wikiPageId = wikiPageId,
                request = SaveWikiPageRequest(
                    title = title,
                    content = _content.value.takeIf { it.isNotBlank() }
                )
            )
        }
    }
}
