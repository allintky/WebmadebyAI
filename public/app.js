document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const note = document.getElementById('note').value;

    // 清空输入框
    document.getElementById('title').value = '';
    document.getElementById('note').value = '';

    const response = await fetch('/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, note }),
    });

    const book = await response.json();
    displayBook(book, 'bookList');
    fetchBooks();  // 重新获取所有书籍
});
async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    displayBooks(books);
}

function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = ''; // 清空书籍列表
    // biome-ignore lint/complexity/noForEach: <explanation>
    books.forEach(book => displayBook(book, bookList));
}

function displayBook(book, container) {
    const item = document.createElement('li');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.flexDirection = 'column';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = book.title;

    const noteSpan = document.createElement('span');
    noteSpan.className = 'note';
    noteSpan.textContent = book.note;

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.textContent = 'Edit';
    editButton.onclick = () => {
        const newTitle = prompt("Enter new title:", book.title);
        if (newTitle !== null) {
            const newNote = prompt("Enter new note:", book.note);
            if (newNote !== null) {
                editBook(book.id, newTitle, newNote);
            }
        }
    };

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        if (confirm('Are you sure you want to delete this book?')) {
            deleteBook(book.id);
        }
    };

    item.appendChild(titleSpan);
    item.appendChild(noteSpan);
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'edit-delete-buttons';
    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);
    item.appendChild(buttonsContainer);
    container.appendChild(item);
}

async function editBook(id, title, note) {
    const response = await fetch(`/books/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, note }),
    });
    if (response.ok) {
        fetchBooks();
    } else {
        console.error('Failed to edit book');
    }
}

async function deleteBook(id) {
    const response = await fetch(`/books/${id}`, {
        method: 'DELETE',
    });
    if (response.ok) {
        fetchBooks();
    } else {
        console.error('Failed to delete book');
    }
}

function searchBooks() {
    const searchQuery = document.getElementById('search').value;
    if (searchQuery) {
        fetch(`/books?search=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(books => {
            displaySearchResults(books);
        })
        .catch(error => {
            console.error('Error searching books:', error);
        });
    } else {
        fetchBooks();
    }
}

function displaySearchResults(books) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // 清空搜索结果
    // biome-ignore lint/complexity/noForEach: <explanation>
    books.forEach(book => displayBook(book, searchResults));
}

function clearFields() {
    document.getElementById('title').value = ''; // 清空标题输入框
    document.getElementById('note').value = ''; // 清空备注输入框
}

// fetchBooks();