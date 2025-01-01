function createNoteCard(title, text, isPinned = false) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card' + (isPinned ? ' pinned-note' : '');
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'note-title';
    titleDiv.textContent = title || 'Untitled Note';
    
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = text;
    
    const pinBtn = document.createElement('button');
    pinBtn.className = 'pin-btn' + (isPinned ? ' pinned' : '');
    pinBtn.innerHTML = `<i class="fas fa-thumbtack"></i>`;
    pinBtn.onclick = () => togglePin(noteCard, pinBtn);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'note-buttons';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editNote(noteCard, titleDiv, noteContent);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteNote(noteCard);
    
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    
    noteCard.appendChild(pinBtn);
    noteCard.appendChild(titleDiv);
    noteCard.appendChild(noteContent);
    noteCard.appendChild(buttonContainer);
    
    return noteCard;
}

function togglePin(noteCard, pinBtn) {
    const isPinned = !noteCard.classList.contains('pinned-note');
    const pinnedSection = document.getElementById('pinnedNotesSection');
    const normalSection = document.getElementById('notesDisplay');
    
    noteCard.classList.toggle('pinned-note');
    pinBtn.classList.toggle('pinned');
    
    if (isPinned) {
        pinnedSection.appendChild(noteCard);
    } else {
        normalSection.appendChild(noteCard);
    }
}

function saveNote() {
    const titleInput = document.getElementById('titleInput');
    const noteInput = document.getElementById('noteInput');
    const display = document.getElementById('notesDisplay');
    
    const title = titleInput.value.trim();
    const noteText = noteInput.value.trim();
    
    if (noteText) {
        const noteCard = createNoteCard(title, noteText);
        display.appendChild(noteCard);
        titleInput.value = '';
        noteInput.value = '';
    }
}
function editNote(noteCard, titleDiv, noteContent) {
    const currentTitle = titleDiv.textContent;
    const currentText = noteContent.textContent;
    
    // Create title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'edit-title-input';
    titleInput.value = currentTitle === 'Untitled Note' ? '' : currentTitle;
    
    // Create content input
    const contentInput = document.createElement('textarea');
    contentInput.className = 'edit-input';
    contentInput.value = currentText;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.style.fontSize = '12px';
    saveBtn.style.padding = '5px 10px';
    
    const saveEdit = () => {
        const newTitle = titleInput.value.trim();
        const newText = contentInput.value.trim();
        
        if (newText) {  // Require at least note content
            titleDiv.textContent = newTitle || 'Untitled Note';
            noteContent.textContent = newText;
            
            // Restore original elements
            noteCard.replaceChild(titleDiv, titleInput);
            noteCard.replaceChild(noteContent, contentInput);
            noteCard.querySelector('.note-buttons').style.display = 'flex';
            if (saveBtn.parentNode === noteCard) {
                noteCard.removeChild(saveBtn);
            }
        }
    };
    
    saveBtn.onclick = saveEdit;
    
    // Replace original elements with inputs
    noteCard.querySelector('.note-buttons').style.display = 'none';
    noteCard.replaceChild(titleInput, titleDiv);
    noteCard.replaceChild(contentInput, noteContent);
    noteCard.insertBefore(saveBtn, noteCard.lastChild);
    
    titleInput.focus();
}

function deleteNote(noteCard) {
    if (confirm('Are you sure you want to delete this note?')) {
        noteCard.remove();
    }
}